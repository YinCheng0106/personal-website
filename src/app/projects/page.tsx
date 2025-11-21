import { Metadata } from "next";
import { projects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

import { SectionTitle } from "@/components/app/sectionTitle";
import { ProjectBlock } from "@/components/app/projectBlock";

export const metadata: Metadata = {
  title: "專案",
  description: "展示我所有的專案",
};

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle title="專案" subtitle="我做的所有專案都在這裡展示" />
      {projects.length === 0 ? (
        <p className="text-muted-foreground justify-center text-center">
          目前沒有任何專案，請稍後再回來看看！
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project: Project) => (
            <ProjectBlock
              key={project.slug}
              type={project.type}
              logo={project.logo}
              title={project.title}
              description={project.description}
              link={`projects/${project.slug}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
