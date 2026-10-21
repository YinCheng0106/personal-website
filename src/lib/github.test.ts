import { describe, expect, test } from "bun:test";

import { getGitHubStats, getProjectGitHubStats } from "@/lib/github";
import type { ProjectV2 } from "@/lib/project-v2";

function response(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("optional GitHub project metadata", () => {
  const baseProject = {
    id: "sample-project",
    slug: "sample-project",
    title: "Sample Project",
    summary: "Sample summary",
    presentation: { type: "app" },
    lifecycle: "active",
    publicationStatus: "published",
  } satisfies ProjectV2;

  test("does not call GitHub when a project has no primary repository", async () => {
    const calls: string[] = [];
    const project: ProjectV2 = {
      ...baseProject,
      repositories: [{ provider: "github", repository: "owner/secondary" }],
    };

    const stats = await getProjectGitHubStats(project, async (input) => {
      calls.push(String(input));
      return response(200, { visibility: "public" });
    });

    expect(stats).toBeNull();
    expect(calls).toEqual([]);
  });

  test("queries only the explicitly primary repository", async () => {
    const calls: string[] = [];
    const project: ProjectV2 = {
      ...baseProject,
      repositories: [
        { provider: "github", repository: "owner/secondary" },
        {
          provider: "github",
          repository: "owner/primary",
          isPrimary: true,
        },
      ],
    };

    await getProjectGitHubStats(project, async (input) => {
      const url = String(input);
      calls.push(url);
      if (url === "https://api.github.com/repos/owner/primary") {
        return response(200, { visibility: "public" });
      }
      return response(503, {});
    });

    expect(calls).toHaveLength(5);
    expect(calls.every((url) => url.includes("owner/primary"))).toBe(true);
  });

  test("returns no metadata for a private repository and makes no supplemental requests", async () => {
    const calls: string[] = [];
    const stats = await getGitHubStats("owner/private", async (input) => {
      calls.push(String(input));
      return response(200, { visibility: "private" });
    });

    expect(stats).toBeNull();
    expect(calls).toEqual(["https://api.github.com/repos/owner/private"]);
  });

  test("treats GitHub API failure as missing supplemental metadata", async () => {
    const stats = await getGitHubStats("owner/project", async () =>
      response(503, { message: "unavailable" }),
    );
    expect(stats).toBeNull();
  });

  test("keeps core public repository fields when supplemental endpoints fail", async () => {
    const calls: string[] = [];
    const stats = await getGitHubStats("owner/project", async (input) => {
      const url = String(input);
      calls.push(url);
      if (url === "https://api.github.com/repos/owner/project") {
        return response(200, {
          visibility: "public",
          stargazers_count: 12,
          watchers_count: 4,
          forks_count: 2,
          description: "Optional GitHub description",
        });
      }
      return response(503, {});
    });

    expect(stats?.stars).toBe(12);
    expect(stats?.forks).toBe(2);
    expect(stats?.github_description).toBe("Optional GitHub description");
    expect(stats?.readme).toBeNull();
    expect(calls).toHaveLength(5);
  });

  test("converts thrown network errors into absent metadata", async () => {
    const stats = await getGitHubStats("owner/project", async () => {
      throw new Error("network unavailable");
    });
    expect(stats).toBeNull();
  });
});
