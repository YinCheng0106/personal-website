"use client";

import { cn } from "@/lib/utils"

export function Callout({ 
  children, 
  type = "info" 
}: { 
  children: React.ReactNode
  type?: "info" | "warning" | "tip" | "error"
}) {
  const styles = {
    info: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
    tip: "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300",
    error: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  }

  return (
    <div className={cn("my-8 rounded-xl border p-6", styles[type])}>
      {children}
    </div>
  )
}