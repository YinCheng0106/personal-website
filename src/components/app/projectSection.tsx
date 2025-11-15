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
    })
  );

  const featuredProjects = projectsWithStats.filter((p) => p.featured);

  return (
    <section id="projects" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionTitle
          title="精選專案"
          subtitle="我用心打造的作品，點擊卡片可查看詳細介紹"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>

        {featuredProjects.length === 0 && (
          <p className="text-center text-muted-foreground">暫無精選專案</p>
        )}
      </div>
    </section>
  );
}