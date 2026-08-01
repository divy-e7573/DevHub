import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
