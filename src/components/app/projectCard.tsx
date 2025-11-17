"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify-icon/react";
import { Project } from "@/lib/projects";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const langColors: Record<string, string> = {
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-500",
    Python: "bg-green-500",
    default: "bg-gray-500",
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-150 hover:scale-105 hover:shadow-lg">
      <Link href={`/projects/${project.slug}`} className="flex flex-1 flex-col">
        <CardHeader className="flex-1 space-y-3 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="iconoir:repository" />
              <CardTitle className="line-clamp-1 text-lg">
                {project.title}
              </CardTitle>
            </div>
            {project.featured && (
              <Badge variant="secondary" className="text-xs">
                <Icon icon="mdi:star" />
                精選
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-3 text-sm">
            {project.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-auto pt-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {project.language && (
              <Badge variant="outline" className="text-xs">
                <div
                  className={`h-2 w-2 rounded-full ${
                    langColors[project.language] || langColors.default
                  } mr-1`}
                />
                {project.language}
              </Badge>
            )}
            {project.stars !== undefined && (
              <div className="text-muted-foreground flex items-center gap-1">
                <Icon icon="mdi:star-outline" />
                {project.stars}
              </div>
            )}
            {project.forks !== undefined && (
              <div className="text-muted-foreground flex items-center gap-1">
                <Icon icon="mdi:source-fork" />
                {project.forks}
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
