import { ProjectCard } from "@/components/app/projectCard";
import { projects } from "@/lib/projects";
import { getGitHubStats } from "@/lib/github";
import { SectionTitle } from "@/components/app/sectionTitle";

export async function ProjectSection() {
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      if (project.github) {
        const stats = await getGitHubStats(project.github);
        if (stats) {
          return { ...project, ...stats };
        }
      }
      return project;
    }),
  );

  const featuredProjects = projectsWithStats.filter((p) => p.featured);

  return (
    <section className="px-4 py-40 select-none">
      <div id="projects" className="mx-auto max-w-6xl">
        <SectionTitle
          title="精選專案"
          subtitle="點擊可查看詳細介紹"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        {featuredProjects.length === 0 && (
          <p className="text-muted-foreground text-center">暫無精選專案</p>
        )}
      </div>
    </section>
  );
}
