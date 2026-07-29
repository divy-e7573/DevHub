// Generic client-side helpers.
//
// `cn` is the standard shadcn/ui class-merging utility. Keep other small,
// dependency-free helpers here; do not let this become a junk drawer.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
