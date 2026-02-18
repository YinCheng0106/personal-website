"use client";

import { Icon } from "@iconify-icon/react";

interface Props {
  logo: string;
  size: number;
}

export function LogoBadge({ logo, size = 24 }: Props) {
  return (
    <div
      className={`bg-background/50 transtion flex items-center rounded-md p-1 duration-200 hover:scale-110`}
    >
      <Icon icon={logo} width={size} height={size} />
    </div>
  );
}
