import type { UrlTransform } from "react-markdown";

export type GitHubReadmeContext = {
  htmlUrl: string;
  downloadUrl: string;
  path: string;
};

export type GitHubReadme = {
  content: string;
  encoding: string;
  path: string;
  html_url: string;
  download_url: string;
};

const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

export function decodeGitHubReadme(readme: unknown): string | null {
  if (!readme || typeof readme !== "object") return null;

  const candidate = readme as Partial<GitHubReadme>;
  if (
    candidate.encoding !== "base64" ||
    typeof candidate.content !== "string" ||
    candidate.content.length === 0
  ) {
    return null;
  }

  const encoded = candidate.content.replace(/\s/g, "");
  if (
    encoded.length === 0 ||
    encoded.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)
  ) {
    return null;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(
      Buffer.from(encoded, "base64"),
    );
  } catch {
    return null;
  }
}

function parseContextUrl(value: string, expectedHost: string): URL | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== expectedHost ||
      url.username.length > 0 ||
      url.password.length > 0
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function normalizeExplicitUrl(value: string, image: boolean): string | null {
  try {
    const url = new URL(value);
    if (!SAFE_LINK_PROTOCOLS.has(url.protocol)) return null;
    if (image && url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }
    if (url.username.length > 0 || url.password.length > 0) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function resolveGitHubReadmeUrl(
  value: string,
  attribute: "href" | "src",
  context: GitHubReadmeContext,
): string {
  const input = value.trim();
  if (!input || CONTROL_CHARACTERS.test(input) || input.startsWith("\\")) {
    return "";
  }

  // Keep anchors on the portfolio page so they navigate to rendered headings.
  if (attribute === "href" && input.startsWith("#")) return input;

  if (input.startsWith("//")) {
    return normalizeExplicitUrl(`https:${input}`, attribute === "src") ?? "";
  }

  const explicitProtocol = /^[a-z][a-z\d+.-]*:/i.test(input);
  if (explicitProtocol) {
    return normalizeExplicitUrl(input, attribute === "src") ?? "";
  }

  const htmlUrl = parseContextUrl(context.htmlUrl, "github.com");
  const downloadUrl = parseContextUrl(
    context.downloadUrl,
    "raw.githubusercontent.com",
  );
  if (!htmlUrl || !downloadUrl) return "";

  try {
    const base = attribute === "src" ? downloadUrl : htmlUrl;
    let resolved: URL;
    if (input.startsWith("/")) {
      // GitHub paths beginning with / are relative to the repository root.
      const pathDepth = context.path.split("/").filter(Boolean).length;
      const rootSegments = base.pathname
        .split("/")
        .filter(Boolean)
        .slice(0, -pathDepth);
      const root = new URL(base.href);
      root.pathname = `/${rootSegments.join("/")}/`;
      resolved = new URL(input.slice(1), root);
    } else {
      resolved = new URL(input, base);
    }
    if (resolved.protocol !== "https:") return "";

    const expectedHost =
      attribute === "src" ? "raw.githubusercontent.com" : "github.com";
    if (resolved.hostname !== expectedHost) return "";
    return resolved.href;
  } catch {
    return "";
  }
}

export function createGitHubReadmeUrlTransform(
  context: GitHubReadmeContext,
): UrlTransform {
  return (value, key) => {
    if (key !== "href" && key !== "src") return "";
    return resolveGitHubReadmeUrl(value, key, context);
  };
}

export function isGitHubReadme(value: unknown): value is GitHubReadme {
  if (!value || typeof value !== "object") return false;
  const readme = value as Partial<GitHubReadme>;
  return (
    readme.encoding === "base64" &&
    typeof readme.content === "string" &&
    typeof readme.path === "string" &&
    typeof readme.html_url === "string" &&
    typeof readme.download_url === "string"
  );
}
