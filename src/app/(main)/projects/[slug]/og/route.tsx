import { OgFrameProject, getOgImageResponse } from "@/lib/og";
import { projects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

const typeLabel: Record<string, string> = {
  website: "Website",
  bot: "Bot",
  app: "App",
  tools: "Tools",
  library: "Library",
  package: "Package",
  api: "API",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const project: Project | undefined = projects.find((p) => p.slug === slug);

  if (!project) {
    return new Response("Not Found", { status: 404 });
  }

  const titleSize =
    project.title.length > 20 ? 60 : project.title.length > 12 ? 78 : 96;

  const description =
    project.description.length > 110
      ? `${project.description.slice(0, 110)}…`
      : project.description;

  const imageResponse = await getOgImageResponse();
  return imageResponse(
    <OgFrameProject
      url={`yincheng.app/projects/${slug}`}
      type={typeLabel[project.type] ?? project.type}
      language={project.language}
      title={project.title}
      description={description}
      titleSize={titleSize}
    />,
  );
}
