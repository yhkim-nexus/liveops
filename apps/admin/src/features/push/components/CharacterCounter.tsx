"use client";

import { cn } from "@/lib/utils";

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharacterCounter({
  current,
  max,
  className,
}: CharacterCounterProps) {
  const colorClass =
    current >= max
      ? "text-red-500"
      : current >= max * 0.9
        ? "text-orange-500"
        : "text-muted-foreground";

  return (
    <span className={cn("text-xs tabular-nums", colorClass, className)}>
      {current}/{max}
    </span>
  );
}
