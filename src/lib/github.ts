export async function getGitHubStats(repo: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
    };
  } catch (error) {
    console.error("Error fetching GitHub repo data:", error);
    return null;
  }
}
