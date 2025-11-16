"use client";

import Link from "next/link";
import { Icon } from "@iconify-icon/react";
import { Badge } from "@/components/ui/badge";

interface IconBadgeProps {
  icon: string;
  label: string;
  link?: string;
}

export function IconBadge({ icon, label, link }: IconBadgeProps) {
  if (!link) {
    return (
      <div>
        <Badge
          variant="secondary"
          className="items-center text-sm transition-opacity hover:opacity-80"
        >
          <Icon icon={icon} width={20} />
          <span className="ml-2 text-sm font-medium">{label}</span>
        </Badge>
      </div>
    );
  } else {
    return (
      <Link href={link} target="_blank">
        <Badge
          variant="secondary"
          className="cursor-pointer items-center transition-opacity hover:opacity-80"
        >
          <Icon icon={icon} width={20} />
          <span className="ml-2 text-sm font-medium">{label}</span>
        </Badge>
      </Link>
    );
  }
}
