export function splitDetails(details: string | null): { description: string; data: Record<string, unknown> | null } {
  if (!details) return { description: "—", data: null };
  const braceIdx = details.indexOf("{");
  if (braceIdx === -1) return { description: details, data: null };
  const description = details.slice(0, braceIdx).replace(/:\s*$/, "").trim();
  try {
    const data = JSON.parse(details.slice(braceIdx)) as Record<string, unknown>;
    return { description: description || "Szczegóły", data };
  } catch {
    return { description: details, data: null };
  }
}