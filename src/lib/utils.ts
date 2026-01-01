import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const API_BASE = "https://miniapp.kitsura.fun/miniapp";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
