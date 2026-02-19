"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBadge } from "@/components/app/codeBadge";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify-icon/react";
import { Project } from "@/lib/projects";
import { motion } from "motion/react"

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
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
                <CodeBadge lang={project.language} type="icon" />
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
    </motion.div>
  );
}
