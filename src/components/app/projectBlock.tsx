"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Icon } from "@iconify-icon/react";
import { Badge } from "@/components/ui/badge";

type Props = {
  type: string;
  logo?: string;
  title: string;
  description: string;
  link: string;
};

const typeIcon: Record<string, string> = {
  website: "iconoir:web-window",
  bot: "mdi:robot-outline",
  app: "mdi:cellphone-iphone",
  tools: "mdi:tools",
  library: "mdi:library-books",
};

export function ProjectBlock({ type, logo, title, description, link }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link
        href={link}
        target="_self"
        className="hover:bg-muted/20 block rounded-sm p-5 transition-all duration-300 hover:shadow-md"
        aria-label={`View ${title} ${type}`}
      >
        <div className="flex items-start justify-center gap-4">
          <div className="shrink-0">
            {logo ? (
              <div className="relative aspect-square h-14 w-14 overflow-hidden rounded-md">
                <Image
                  src={logo}
                  alt={`${title} logo`}
                  width={56}
                  height={56}
                  className="object-contain transition-all duration-300 group-hover:brightness-100 group-hover:contrast-110"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center">
                <Icon
                  icon={typeIcon[type] || "iconoir:code"}
                  width={56}
                  height={56}
                  className="text-muted-foreground group-hover:text-foreground transition-colors duration-150"
                />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-muted-foreground group-hover:text-foreground text-lg font-semibold transition-colors duration-150">
                {title}
              </h3>
              <Badge
                variant="secondary"
                className="text-muted-foreground group-hover:text-foreground text-xs transition-colors duration-150"
              >
                {type}
              </Badge>
            </div>
            <p className="text-muted-foreground/50 group-hover:text-foreground line-clamp-1 text-sm transition-colors duration-150">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
