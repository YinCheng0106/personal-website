import { decodeGitHubReadme } from "@/lib/github-readme";
import type { ProjectV2 } from "@/lib/project-v2";

export type Languages = Record<string, number>;

export interface Contributor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  contributions: number;
}

export interface Author {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
}

export interface Releases {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: Author;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  immutable: boolean;
  prerelease: boolean;
  created_at: string;
  updated_at: string;
  published_at: string;
  assets: [];
  tarball_url: string;
  zipball_url: string;
  body: string;
}

export interface GitHubStats {
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    type: string;
  };
  visibility: string;
  topics: string[];
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
    node_id: string;
  } | null;
  stars: number;
  watchers: number;
  forks: number;
  homepage: string;
  language: Languages;
  description: string;
  contributors: Contributor[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface README {
  path: string;
  html_url: string;
  download_url: string;
  content: string;
  encoding: string;
}

type GitHubFetch = (
  input: string,
  init?: RequestInit & { next?: { revalidate: number } },
) => Promise<Response>;

function githubApiHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getGitHubStats(
  repo: string,
  fetcher: GitHubFetch = fetch,
) {
  try {
    const res = await fetcher(`https://api.github.com/repos/${repo}`, {
      headers: githubApiHeaders(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    // Never surface repository metadata from a private repository, even when
    // the configured GitHub token has permission to read it.
    if (data.visibility !== "public") return null;

    const releases: Releases[] = await getRepoRelease(repo, fetcher);
    const languages: Languages = await getRepoLanguage(repo, fetcher);
    const contributors: Contributor[] = await gerRepoContributors(repo, fetcher);
    const readme: README | null = await getRepoREADME(repo, fetcher);

    return {
      owner: data.owner,
      visibility: data.visibility,
      topics: data.topics,
      license: data.license,
      stars: data.stargazers_count,
      watchers: data.watchers_count,
      forks: data.forks_count,
      github_description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at,
      pushed_at: data.pushed_at,
      homepage: data.homepage,
      readme: readme,
      releases: releases,
      languages: languages,
      contributors: contributors,
    };
  } catch (error) {
    console.error("Error fetching GitHub repo data:", error);
    return null;
  }
}

/** Fetch optional GitHub metadata only for a project's explicitly primary repository. */
export function getProjectGitHubStats(
  project: ProjectV2,
  fetcher: GitHubFetch = fetch,
) {
  const primaryRepository = project.repositories?.find(
    (repository) => repository.isPrimary,
  );
  return primaryRepository
    ? getGitHubStats(primaryRepository.repository, fetcher)
    : Promise.resolve(null);
}

const getRepoLanguage = async (repo: string, fetcher: GitHubFetch = fetch) => {
  try {
    const res = await fetcher(`https://api.github.com/repos/${repo}/languages`, {
      headers: githubApiHeaders(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching GitHub repo languages:", error);
    return null;
  }
};

const gerRepoContributors = async (
  repo: string,
  fetcher: GitHubFetch = fetch,
) => {
  try {
    const res = await fetcher(
      `https://api.github.com/repos/${repo}/contributors`,
      {
        headers: githubApiHeaders(),
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching GitHub repo contributors:", error);
    return null;
  }
};

export async function getRepoRelease(
  repo: string,
  fetcher: GitHubFetch = fetch,
) {
  try {
    const res = await fetcher(`https://api.github.com/repos/${repo}/releases`, {
      headers: githubApiHeaders(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching GitHub repo releases:", error);
    return null;
  }
}

export async function getRepoREADME(
  repo: string,
  fetcher: GitHubFetch = fetch,
): Promise<README | null> {
  try {
    const res = await fetcher(`https://api.github.com/repos/${repo}/readme`, {
      headers: githubApiHeaders(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;

    const readme = data as Partial<README>;
    if (
      readme.encoding !== "base64" ||
      typeof readme.content !== "string" ||
      typeof readme.path !== "string" ||
      typeof readme.html_url !== "string" ||
      typeof readme.download_url !== "string"
    ) {
      return null;
    }

    if (!decodeGitHubReadme(readme)) return null;

    return readme as README;
  } catch (error) {
    console.error("Error fetching GitHub repo README:", error);
    return null;
  }
}
