import { notFound } from "next/navigation";
import { Icon } from "@iconify-icon/react";

import { getGitHubStats } from "@/lib/github";
import { projects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

import { CodeBadge } from "@/components/app/codeBadge";

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
  console.table(githubStats);

  if (!project) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
    </div>
  );
}
