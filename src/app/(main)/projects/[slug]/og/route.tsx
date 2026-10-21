import { OgFrameProject, getOgImageResponse } from "@/lib/og";
import { getProjectBySlug } from "@/lib/projects";

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
  const project = getProjectBySlug(slug);

  if (!project) {
    return new Response("Not Found", { status: 404 });
  }

  const titleSize =
    project.title.length > 20 ? 60 : project.title.length > 12 ? 78 : 96;

  const imageResponse = await getOgImageResponse();
  return imageResponse(
    <OgFrameProject
      url={`yincheng.app/projects/${slug}`}
      type={typeLabel[project.presentation.type] ?? project.presentation.type}
      language={project.presentation.language}
      title={project.title}
      description={
        project.summary.length > 110
          ? `${project.summary.slice(0, 110)}…`
          : project.summary
      }
      titleSize={titleSize}
    />,
  );
}
