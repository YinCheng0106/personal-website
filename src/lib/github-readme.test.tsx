import { describe, expect, spyOn, test } from "bun:test";
import { readFileSync } from "node:fs";

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
  test("keeps MDX expressions inert and strips executable HTML payloads", () => {
    const html = render(makeReadme(`
# External Markdown

{21 * 2}

{(() => { throw new Error("README_MDX_MUST_NOT_EXECUTE") })()}

<iframe srcdoc="<script>alert(1)</script>"></iframe>

<img src="x" onerror="alert(1)">

<a href="javascript:alert(1)">unsafe HTML link</a>

[unsafe Markdown](javascript:alert%281%29)
`));
    expect(html).toContain("{21 * 2}");
    expect(html).toContain("README_MDX_MUST_NOT_EXECUTE");
    expect(html).not.toMatch(/<iframe|<script|<img|onerror=|srcdoc=|javascript:/i);
  });

  test("keeps the README renderer and URL helpers outside the trusted MDX pipeline", () => {
    for (const file of [
      "src/components/app/githubReadme.tsx",
      "src/lib/github-readme.ts",
    ]) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/next-mdx-remote|compileMDX|MDXRemote|case-studies/);
    }
    const renderer = readFileSync("src/components/app/githubReadme.tsx", "utf8");
    expect(renderer).toContain('from "react-markdown"');
    expect(renderer).toContain('from "remark-gfm"');
    expect(renderer).toContain("skipHtml");
    expect(renderer).toContain("urlTransform={createGitHubReadmeUrlTransform(");
  });

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

  test("keeps table semantics, alignment, links and code inside a named keyboard scroll region", () => {
    const html = render(makeReadme(`| Variable | Default |
| :--- | ---: |
| \`VERY_LONG_ENVIRONMENT_VARIABLE_NAME\` | [setup](docs/setup.md) |`));

    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="README 表格，可水平捲動"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("focus-visible:outline-2");
    expect(html).toContain("<table><thead><tr>");
    expect(html).toContain('<th style="text-align:left">Variable</th>');
    expect(html).toContain('<td style="text-align:right"><a href="https://github.com/YINLA-TEAM/YINLA/blob/main/docs/setup.md">setup</a></td>');
    expect(html).toContain("<code>VERY_LONG_ENVIRONMENT_VARIABLE_NAME</code>");
    expect(html).toContain("</tbody></table></div>");
  });

  test("preserves exact inline paths and fenced code whitespace without inserted break characters", () => {
    const inline = "src/data/weatherAlertSummaries.json";
    const block = `  const path = "${inline}";\n\tconsole.log(path);\n`;
    const html = render(makeReadme(`Use \`${inline}\`.\n\n\`\`\`ts\n${block}\`\`\``));

    expect(html).toContain(`<code>${inline}</code>`);
    expect(html).toContain(`<pre><code class="language-ts">${block.replaceAll('"', "&quot;")}</code></pre>`);
    expect(html).not.toMatch(/<wbr|\u200b|\u00ad/);
    expect(html).not.toContain('role="region"');
  });

  test.each([
    {
      name: "YINLA",
      repository: "YINLA-TEAM/YINLA",
      source: `<p align="center"><img src="./assets/yinla-readme-splash-compact.png" alt="HTML splash" width="100%" /></p>

# YINLA

[![Discord](https://img.shields.io/discord/1031159028505641011?color=5865F2&label=Discord&logo=discord&logoColor=white&style=flat-square)](https://discord.gg/mnCHdBbh65)
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg?style=flat-square)](./License)
[![Runtime](https://img.shields.io/badge/runtime-Bun%20%7C%20Node.js-111111?style=flat-square)](./package.json)`,
      altTexts: ["Discord", "License: GPL v3", "Runtime"],
    },
    {
      name: "iso-countries-utils",
      repository: "YinCheng0106/iso-countries-utils",
      source: `# iso-countries-utils

![License](https://img.shields.io/npm/l/iso-countries-utils)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Version](https://img.shields.io/npm/v/iso-countries-utils)

English | [繁體中文](./README.zh-TW.md)`,
      altTexts: ["License", "TypeScript", "Version"],
    },
  ])("preserves intrinsic badge sizing for $name Markdown", ({ repository, source, altTexts }) => {
    const html = render({
      ...makeReadme(source),
      html_url: `https://github.com/${repository}/blob/main/README.md`,
      download_url: `https://raw.githubusercontent.com/${repository}/main/README.md`,
    });
    const images = html?.match(/<img\b[^>]*>/g) ?? [];

    expect(images).toHaveLength(3);
    images.forEach((image, index) => {
      expect(image).toContain(`alt="${altTexts[index]}"`);
      expect(image).toContain('src="https://img.shields.io/');
      expect(image).not.toMatch(/\b(?:width|height)=/);
      expect(image).not.toContain("data-nimg");
      expect(image).toContain("max-w-full");
      expect(image).toContain("h-auto");
    });
    expect(html).not.toContain("HTML splash");
    expect(html).toContain(`href="https://github.com/${repository}/blob/main/`);
  });

  test("constrains large relative Markdown images without inventing dimensions", () => {
    const html = render(makeReadme('![YINLA screenshot](./assets/screenshot.png)'));

    expect(html).toContain(
      'src="https://raw.githubusercontent.com/YINLA-TEAM/YINLA/main/assets/screenshot.png"',
    );
    expect(html).toContain('alt="YINLA screenshot"');
    expect(html).toContain("max-w-full");
    expect(html).toContain("h-auto");
    expect(html).not.toMatch(/\b(?:width|height)=/);
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
