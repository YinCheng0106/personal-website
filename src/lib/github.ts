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
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export async function getGitHubStats(repo: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const releases: Releases[] = await getRepoRelease(repo);
    const languages: Languages = await getRepoLanguage(repo);
    const contributors: Contributor[] = await gerRepoContributors(repo);
    const readme: README = await getRepoREADME(repo);

    const data = await res.json();
    return {
      owner: data.owner,
      visibility: data.visibility,
      topics: data.topics,
      license: data.license,
      stars: data.stargazers_count,
      watchers: data.watchers_count,
      forks: data.forks_count,
      description: data.description,
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

const getRepoLanguage = async (repo: string) => {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/languages`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
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

const gerRepoContributors = async (repo: string) => {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contributors`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
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

export async function getRepoRelease(repo: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
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

export async function getRepoREADME(repo: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/readme`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching GitHub repo README:", error);
    return null;
  }
}
