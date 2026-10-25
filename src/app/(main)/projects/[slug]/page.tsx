import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Icon } from "@iconify-icon/react";
import { formatDistance } from "date-fns";
import { zhTW } from "date-fns/locale";

import { getProjectGitHubStats, Contributor } from "@/lib/github";
import {
  getProjectBySlug,
  getProjectRobotsMetadata,
  typeIcon,
} from "@/lib/projects";

import { Badge } from "@/components/ui/badge";
import { LanguageStatsBar } from "@/components/app/langStatsBar";
import GitHubReadmeView from "@/components/app/githubReadme";
import { getPublicCaseStudy } from "@/lib/case-studies";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "專案不存在",
      description: "找不到您所尋找的專案。",
      robots: { index: false, follow: false },
    };
  }

  const description = project.summary;

  return {
    title: project.title,
    description,
    alternates: {
      canonical: `https://yincheng.app/projects/${project.slug}`,
    },
    ...(getProjectRobotsMetadata(project) && {
      robots: getProjectRobotsMetadata(project),
    }),
    openGraph: {
      title: project.title,
      description,
      url: `https://yincheng.app/projects/${slug}`,
      type: "website",
      images: [
        {
          url: `https://yincheng.app/projects/${slug}/og`,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [`https://yincheng.app/projects/${slug}/og`],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  const project = getProjectBySlug(slug);

  if (!project) {
    return notFound();
  }

  const [githubStats, caseStudy] = await Promise.all([
    getProjectGitHubStats(project),
    getPublicCaseStudy(project.id),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="grid grid-cols-1 md:flex items-center justify-between border-b pb-4">
        {/* Project Tilte & Slug */}
        <div className="flex items-center gap-4">
          <Icon
            icon={typeIcon[project.presentation.type] || "iconoir:repository"}
            width={48}
            height={48}
          />
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            {
              project.slug !== project.title
                ? <p className="text-gray-600">{project.slug}</p>
                : null
            }
          </div>
        </div>

        <div className="min-w-0 flex flex-col md:items-end mt-2 md:mt-0">
          {/* GitHub Stats */}
          <div className="flex min-w-0 flex-wrap justify-between gap-x-4 gap-y-2 md:flex-col md:items-end">
            <div className="flex flex-wrap items-center gap-4">
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
            {/* GitHub License */}
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 md:justify-end">
              {project.repositories?.map((repository) => (
                <Link
                  key={repository.repository}
                  href={`https://github.com/${repository.repository}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link flex min-w-0 max-w-full items-center gap-1"
                >
                  <Icon icon="ri:github-line" className="shrink-0" />
                  <span className="min-w-0 [overflow-wrap:anywhere]">
                    {project.repositories?.length === 1
                      ? "GitHub"
                      : repository.repository}
                  </span>
                  {repository.isPrimary && (
                    <span className="text-muted-foreground shrink-0 text-xs">主要</span>
                  )}
                </Link>
              ))}
              {githubStats?.license?.name && (
                <div className="text-muted-foreground flex min-w-0 max-w-full items-center gap-1">
                  <Link
                    href={
                      `https://choosealicense.com/licenses/${githubStats.license.key}` ||
                      "#"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link flex min-w-0 items-center gap-1"
                  >
                    <Icon icon="mdi:scale-balance" className="shrink-0" />
                    <span className="min-w-0 [overflow-wrap:anywhere]">
                      {githubStats.license.spdx_id}
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {githubStats?.homepage && (
            <Link
              href={githubStats.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="link flex items-center gap-1 "
            >
              <Icon icon="mdi:web" />
              <span className="line-clamp-1">
                {githubStats.homepage.replace(/^https?:\/\//, "")}
              </span>
            </Link>
          )}
        </div>
      </header>

      {caseStudy && (
        <p className="mt-6">
          <Link href={caseStudy.href} className="link underline underline-offset-4">
            閱讀 {project.title} 開發紀錄
          </Link>
        </p>
      )}

      <main className="mt-8 grid w-full gap-8 md:grid-cols-4">
        <div className="min-w-0 md:col-span-3">
          <div className="prose dark:prose-invert prose-pre:bg-transparent prose-code:before:content-none prose-code:after:content-none max-w-none [&_:not(pre)>code]:[overflow-wrap:anywhere]">
            {project.repositories?.length ? (
              <GitHubReadmeView readme={githubStats?.readme} />
            ) : (
              <p className="text-muted-foreground">
                此專案尚未提供公開儲存庫或 README。
              </p>
            )}
          </div>
        </div>
        <div className="divide-accent mb-auto grid min-w-0 grid-cols-1 divide-y md:col-span-1">
          <div className="flex flex-col gap-2 py-4">
            <h2 className="text-lg font-semibold">簡介</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.summary
                ? <p>{project.summary}</p>
                : githubStats?.github_description
                  ? <p>{githubStats.github_description}</p>
                  : <p className="text-muted-foreground">無簡介</p>}
            </div>
          </div>

          {project.contributionEvidence?.length ? (
            <div className="flex flex-col gap-2 py-4">
              <h2 className="text-lg font-semibold">相關連結</h2>
              <div className="mt-2 flex flex-col gap-2">
                {project.contributionEvidence.map((evidence) => (
                  <Link
                    key={`${evidence.label}-${evidence.href}`}
                    href={evidence.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    {evidence.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 py-4">
            <h2 className="text-lg font-semibold">主題</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {githubStats?.topics?.length ? (
                githubStats.topics.map((topic: string) => (
                  <Badge key={topic} variant="outline" className="px-2 hover:bg-accent transition-colors">
                    {topic}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">無類別標籤</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 py-4">
            <h2 className="text-lg font-semibold">版本</h2>
            <div className="mt-2 flex flex-wrap">
              {githubStats?.releases?.[0] ? (
                <Link
                  href={githubStats.releases[0].html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group link-accent"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="mdi:tag-outline"
                      className="group-hover:text-green-500/20 link text-green-500"
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
                  className="link-accent flex min-w-0 max-w-full flex-wrap items-center gap-2"
                >
                  <Image
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    width={32}
                    height={32}
                    className={
                      contributor.type === "User"
                        ? "shrink-0 rounded-full"
                        : "shrink-0 rounded-sm"
                    }
                  />
                  <span className="min-w-0 max-w-full font-bold [overflow-wrap:anywhere]">
                    {contributor.login}
                  </span>
                  {contributor.type === "User" ? (
                    <Badge variant="secondary">User</Badge>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>

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
