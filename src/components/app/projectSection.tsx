import { ProjectCard } from "@/components/app/projectCard";
import { projects } from "@/lib/projects";
import { getProjectGitHubStats } from "@/lib/github";
import { SectionTitle } from "@/components/app/sectionTitle";

export async function ProjectSection() {
  const featuredProjects = await Promise.all(
    projects
      .filter((project) => project.presentation.featured)
      .map(async (project) => {
        const stats = await getProjectGitHubStats(project);
        return { project, stats };
      }),
  );

  return (
    <section className="px-4 py-40 select-none">
      <div id="projects" className="mx-auto max-w-6xl">
        <SectionTitle
          title="精選專案"
          subtitle="點擊可查看詳細介紹"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...featuredProjects]
            .sort((a, b) => a.project.title.localeCompare(b.project.title))
            .map(({ project, stats }) => (
              <ProjectCard key={project.slug} project={project} stats={stats} />
            ))}
        </div>

        {featuredProjects.length === 0 && (
          <p className="text-muted-foreground text-center">暫無精選專案</p>
        )}
      </div>
    </section>
  );
}
