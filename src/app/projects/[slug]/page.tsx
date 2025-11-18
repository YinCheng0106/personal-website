import { notFound } from "next/navigation";

import { projects } from "@/lib/projects";
import type { Project } from "@/lib/projects";

type Props = {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  const project: Project | undefined = projects.find((p) => p.slug === slug);

  if (!project) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">{project.title}</h1>
      <p className="mb-6">{project.description}</p>
      {/* Add more project details here as needed */}
    </div>
  );
}