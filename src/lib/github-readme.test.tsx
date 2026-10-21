import { describe, expect, spyOn, test } from "bun:test";

import GitHubReadmeView, {
  renderGitHubReadme,
} from "@/components/app/githubReadme";
import { renderToStaticMarkup } from "react-dom/server";
import { getRepoREADME } from "@/lib/github";
import { resolveGitHubReadmeUrl } from "@/lib/github-readme";

const context = {
  htmlUrl: "https://github.com/YINLA-TEAM/YINLA/blob/main/README.md",
  downloadUrl:
    "https://raw.githubusercontent.com/YINLA-TEAM/YINLA/main/README.md",
  path: "README.md",
};

function makeReadme(source: string) {
  return {
    html_url: context.htmlUrl,
    download_url: context.downloadUrl,
    path: "README.md",
    encoding: "base64",
    content: Buffer.from(source, "utf8").toString("base64"),
  };
}

function render(readme: unknown): string | null {
  const content = renderGitHubReadme(readme);
  return content ? renderToStaticMarkup(content) : null;
}

describe("GitHub README rendering", () => {
  test("renders the YINLA HTML comment fixture without an MDX error", () => {
    const html = render(
      makeReadme(`<!-- YINLA README build note -->\n\n# YINLA Bot\n\nA Discord bot.`),
    );

    expect(html).toContain('<h1 id="yinla-bot">YINLA Bot</h1>');
    expect(html).toContain("A Discord bot.");
    expect(html).not.toContain("YINLA README build note");
    expect(
      renderToStaticMarkup(<GitHubReadmeView readme={null} />),
    ).toContain("無 README 資料");
  });

  test("validates a GitHub Contents API response and renders its README Markdown", async () => {
    const source = `<!-- generated README note -->

<p align="center"><img src="./assets/logo.png" alt="YINLA logo"></p>

# YINLA Bot

Read the [setup guide](docs/setup.md).

| Feature | Status |
| --- | --- |
| Weather | ready |`;
    const apiResponse = {
      name: "README.md",
      path: "README.md",
      sha: "0123456789abcdef",
      size: Buffer.byteLength(source),
      url: "https://api.github.com/repos/YINLA-TEAM/YINLA/contents/README.md",
      html_url: context.htmlUrl,
      git_url: "https://api.github.com/repos/YINLA-TEAM/YINLA/git/blobs/example",
      download_url: context.downloadUrl,
      type: "file",
      content: Buffer.from(source, "utf8").toString("base64"),
      encoding: "base64",
      _links: {
        self: "https://api.github.com/repos/YINLA-TEAM/YINLA/contents/README.md",
        git: "https://api.github.com/repos/YINLA-TEAM/YINLA/git/blobs/example",
        html: context.htmlUrl,
      },
    };
    const readme = await getRepoREADME("YINLA-TEAM/YINLA", async () =>
      Response.json(apiResponse),
    );
    const html = render(readme);

    expect(readme).not.toBeNull();
    expect(html).toContain('<h1 id="yinla-bot">YINLA Bot</h1>');
    expect(html).toContain("<table>");
    expect(html).toContain(
      'href="https://github.com/YINLA-TEAM/YINLA/blob/main/docs/setup.md"',
    );
    expect(html).not.toContain("generated README note");
    expect(html).not.toContain('align="center"');
    expect(html).not.toContain("<img");
  });

  test("renders GitHub Flavored Markdown tables, task lists, strike and code", () => {
    const html = render(
      makeReadme(`| Feature | Status |\n| --- | --- |\n| Weather | ready |\n\n- [x] Shipped\n- [ ] Planned\n\n~~removed~~\n\n\`\`\`ts\nconst answer = 42;\n\`\`\``),
    );

    expect(html).toContain("<table>");
    expect(html).toContain("Weather");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("checked");
    expect(html).toContain("<del>removed</del>");
    expect(html).toContain('<code class="language-ts">');
  });

  test("resolves README-relative images and links in their GitHub context", () => {
    expect(
      resolveGitHubReadmeUrl("assets/bot.png", "src", context),
    ).toBe(
      "https://raw.githubusercontent.com/YINLA-TEAM/YINLA/main/assets/bot.png",
    );
    expect(
      resolveGitHubReadmeUrl("docs/setup.md", "href", context),
    ).toBe("https://github.com/YINLA-TEAM/YINLA/blob/main/docs/setup.md");
    expect(
      resolveGitHubReadmeUrl("/assets/bot.png", "src", context),
    ).toBe(
      "https://raw.githubusercontent.com/YINLA-TEAM/YINLA/main/assets/bot.png",
    );
    expect(
      resolveGitHubReadmeUrl("/docs/setup.md", "href", context),
    ).toBe("https://github.com/YINLA-TEAM/YINLA/blob/main/docs/setup.md");
    expect(
      resolveGitHubReadmeUrl("../images/bot.png", "src", {
        htmlUrl:
          "https://github.com/YINLA-TEAM/YINLA/blob/feature/readme/docs/README.md",
        downloadUrl:
          "https://raw.githubusercontent.com/YINLA-TEAM/YINLA/feature/readme/docs/README.md",
        path: "docs/README.md",
      }),
    ).toBe(
      "https://raw.githubusercontent.com/YINLA-TEAM/YINLA/feature/readme/images/bot.png",
    );
  });

  test("preserves local heading anchors and ordinary external links", () => {
    const html = render(
      makeReadme("[Usage](#usage) [Website](https://example.com/path)\n\n## Usage"),
    );

    expect(html).toContain('href="#usage"');
    expect(html).toContain('href="https://example.com/path"');
    expect(html).toContain('<h2 id="usage">Usage</h2>');
  });

  test("blocks dangerous URL protocols for links and images", () => {
    for (const url of [
      "javascript:alert(1)",
      "JaVaScRiPt:alert(1)",
      "vbscript:msgbox(1)",
      "data:text/html,<script>alert(1)</script>",
      "file:///etc/passwd",
    ]) {
      expect(resolveGitHubReadmeUrl(url, "href", context)).toBe("");
      expect(resolveGitHubReadmeUrl(url, "src", context)).toBe("");
    }

    const html = render(
      makeReadme('[click](javascript:alert(1))\n\n![pixel](data:image/svg+xml,<svg>)'),
    );
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("data:image");
  });

  test("ignores raw HTML and JSX-like content", () => {
    const html = render(
      makeReadme(
        "Before <script>alert(1)</script> after\n\n<Widget value={process.env.SECRET} />\n\n{process.env.SECRET}",
      ),
    );

    expect(html).not.toContain("<script");
    expect(html).not.toContain("<Widget");
    expect(html).toContain("{process.env.SECRET}");
    expect(html).toContain("Before");
  });

  test("returns the project fallback for missing or invalid README content", () => {
    expect(render(null)).toBeNull();
    expect(
      render({ ...makeReadme("content"), content: "%%%" }),
    ).toBeNull();
    expect(
      render({ ...makeReadme("content"), content: "//8=" }),
    ).toBeNull();
  });
});

describe("GitHub README API failures", () => {
  test("omits Authorization when GITHUB_TOKEN is not configured", async () => {
    const previousToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;
    let requestHeaders: Headers | undefined;

    try {
      await getRepoREADME("YINLA-TEAM/YINLA", async (_input, init) => {
        requestHeaders = new Headers(init?.headers);
        return Response.json({
          ...makeReadme("# public README"),
        });
      });
    } finally {
      if (previousToken === undefined) delete process.env.GITHUB_TOKEN;
      else process.env.GITHUB_TOKEN = previousToken;
    }

    expect(requestHeaders?.has("authorization")).toBe(false);
    expect(requestHeaders?.get("accept")).toBe("application/vnd.github+json");
  });

  test("handles missing files and rate limiting as unavailable README data", async () => {
    for (const status of [404, 403, 429]) {
      const readme = await getRepoREADME("YINLA-TEAM/YINLA", async () =>
        new Response(null, { status }),
      );
      expect(readme).toBeNull();
    }
  });

  test("handles invalid API bodies, null JSON and fetch errors", async () => {
    const invalidContent = await getRepoREADME(
      "YINLA-TEAM/YINLA",
      async () =>
        Response.json({
          encoding: "base64",
          content: "%%%",
          path: "README.md",
          html_url: context.htmlUrl,
          download_url: context.downloadUrl,
        }),
    );
    const nullResponse = await getRepoREADME(
      "YINLA-TEAM/YINLA",
      async () => Response.json(null),
    );
    const errorSpy = spyOn(console, "error").mockImplementation(() => {});
    const fetchError = await getRepoREADME("YINLA-TEAM/YINLA", async () => {
      throw new Error("network failure");
    });
    errorSpy.mockRestore();

    expect(invalidContent).toBeNull();
    expect(nullResponse).toBeNull();
    expect(fetchError).toBeNull();
    expect(render(invalidContent)).toBeNull();
  });
});
