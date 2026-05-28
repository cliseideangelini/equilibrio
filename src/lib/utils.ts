import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalNow(): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false
  });
  const parts = formatter.formatToParts(now);
  const dateMap = parts.reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {} as Record<string, string>);

  return new Date(
    parseInt(dateMap.year, 10),
    parseInt(dateMap.month, 10) - 1,
    parseInt(dateMap.day, 10),
    parseInt(dateMap.hour, 10),
    parseInt(dateMap.minute, 10),
    parseInt(dateMap.second, 10)
  );
}
