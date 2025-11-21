import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Icon } from "@iconify-icon/react";
import { formatDistance } from "date-fns";
import { zhTW } from "date-fns/locale";
import remarkGfm from "remark-gfm";

import { getGitHubStats, Contributor } from "@/lib/github";
import { projects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

import { Badge } from "@/components/ui/badge";
import { LanguageStatsBar } from "@/components/app/langStatsBar";
import { MDXComponents } from "@/components/mdx/mdx-components";
import { MDXRemote } from "next-mdx-remote/rsc";

type Props = {
  params: Promise<{ slug: string }>;
};

const typeIcon: Record<string, string> = {
  website: "iconoir:web-window",
  bot: "mdi:robot-outline",
  app: "mdi:cellphone-iphone",
  tools: "mdi:tools",
  library: "mdi:library-books",
};

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  const project: Project | undefined = projects.find((p) => p.slug === slug);

  const githubStats = project?.github
    ? await getGitHubStats(project.github)
    : null;

  if (!project) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between border-b pb-4">
        {/* Project Title and Type */}
        <div className="flex items-center gap-4">
          <Icon
            icon={typeIcon[project.type] || "iconoir:repository"}
            width={48}
            height={48}
          />
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-gray-600">{project.slug}</p>
          </div>
        </div>

        {/* GitHub Stats and Links */}
        <div className="flex flex-col items-end">
          {/* GitHub Stats */}
          <div className="flex items-center gap-4">
            {githubStats?.stars !== undefined && (
              <div className="text-muted-foreground flex items-center gap-1">
                <Icon icon="mdi:star-outline" />
                {githubStats.stars}
              </div>
            )}
            {githubStats?.forks !== undefined && (
              <div className="text-muted-foreground flex items-center gap-1">
                <Icon icon="mdi:source-fork" />
                {githubStats.forks}
              </div>
            )}
            {githubStats?.watchers !== undefined && (
              <div className="text-muted-foreground flex items-center gap-1">
                <Icon icon="mdi:eye-outline" />
                {githubStats.watchers}
              </div>
            )}
          </div>

          {/* GitHub Link and License */}
          <div className="flex gap-2">
            <Link
              href={`https://github.com/${project.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link flex items-center gap-1"
            >
              <Icon icon="ri:github-line" />
              GitHub
            </Link>
            {githubStats?.license?.name && (
              <div className="text-muted-foreground flex items-center gap-1">
                <Link
                  href={
                    `https://choosealicense.com/licenses/${githubStats.license.key}` ||
                    "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link flex items-center gap-1"
                >
                  <Icon icon="mdi:scale-balance" />
                  {githubStats.license.spdx_id}
                </Link>
              </div>
            )}
          </div>

          {githubStats?.homepage && (
            <Link
              href={githubStats.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="link flex items-center gap-1"
            >
              <Icon icon="mdi:web" />
              {githubStats.homepage.replace(/^https?:\/\//, "")}
            </Link>
          )}
        </div>
      </header>

      <main className="mt-8 grid w-full gap-8 md:grid-cols-4">
        <div className="md:col-span-3">
          {/* README Content */}
          <div className="prose dark:prose-invert max-w-none">
            {githubStats?.readme?.content ? (
              <MDXRemote
                source={Buffer.from(
                  githubStats.readme.content,
                  "base64",
                ).toString("utf-8")}
                components={MDXComponents({})}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                  },
                }}
              />
            ) : (
              <p className="text-muted-foreground">無 README 資料</p>
            )}
          </div>
        </div>
        <div className="divide-accent mb-auto grid grid-cols-1 divide-y md:col-span-1">
          {/* GitHub Project Details */}
          <div className="flex flex-col gap-2 py-4">
            <h2 className="text-lg font-semibold">簡介</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {githubStats?.description ? (
                <p>{githubStats.description}</p>
              ) : (
                <p className="text-muted-foreground">無簡介</p>
              )}
            </div>
          </div>

          {/* Topics */}
          <div className="flex flex-col gap-2 py-4">
            <h2 className="text-lg font-semibold">主題</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {githubStats?.topics.length ? (
                githubStats.topics.map((topic: string) => (
                  <Badge key={topic} variant="outline" className="px-2">
                    {topic}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">無類別標籤</p>
              )}
            </div>
          </div>

          {/* Releases */}
          <div className="flex flex-col gap-2 py-4">
            <h2 className="text-lg font-semibold">版本</h2>
            <div className="mt-2 flex flex-wrap">
              {githubStats?.releases[0] ? (
                <Link
                  href={githubStats.releases[0].html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group link-accent"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="mdi:tag-outline"
                      className="group-hover:text-accent link text-green-500"
                      width="24"
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-base font-bold">
                        {githubStats.releases[0].name}
                      </span>
                      <span className="group-hover:text-accent link text-muted-foreground text-xs">
                        {formatDistance(
                          new Date(githubStats.releases[0].published_at),
                          new Date(),
                          { addSuffix: true, locale: zhTW },
                        )}
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <p className="text-muted-foreground">無版本資料</p>
              )}
            </div>
          </div>

          {/* Contributors */}
          <div className="flex flex-col gap-2 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">貢獻者</h2>
              <Badge variant="outline" className="px-2">
                {githubStats?.contributors?.length || 0}
              </Badge>
            </div>
            <div className="mt-2 flex flex-col flex-wrap gap-2">
              {githubStats?.contributors?.map((contributor: Contributor) => (
                <Link
                  key={contributor.id}
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent flex items-center gap-2"
                >
                  <Image
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    width={32}
                    height={32}
                    className={
                      contributor.type === "User"
                        ? "rounded-full"
                        : "rounded-sm"
                    }
                  />
                  <span className="font-bold">{contributor.login}</span>
                  {contributor.type === "User" ? (
                    <Badge variant="secondary">User</Badge>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="flex flex-col gap-2 py-4">
            <h2 className="text-lg font-semibold">語言</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {githubStats?.languages ? (
                <LanguageStatsBar data={githubStats.languages} />
              ) : (
                <p className="text-muted-foreground">無語言資料</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
