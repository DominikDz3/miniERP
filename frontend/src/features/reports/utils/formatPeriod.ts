import type { Granularity } from "../types/reports";

export function formatPeriod(iso: string, granularity: Granularity): string {
  const d = new Date(iso);
  if (granularity === "month") {
    return d.toLocaleDateString("pl-PL", { month: "long", year: "numeric" }); 
  }
  if (granularity === "week") {
    const end = new Date(d);
    end.setDate(d.getDate() + 6);
    return `${d.toLocaleDateString("pl-PL")} – ${end.toLocaleDateString("pl-PL")}`;
  }
  return d.toLocaleDateString("pl-PL");
}