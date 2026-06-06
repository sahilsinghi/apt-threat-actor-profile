import type { ActorWithTechniques } from "./types";

export async function generateExecutiveSummary(actor: ActorWithTechniques): Promise<string> {
  try {
    const response = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actorId: actor.id,
        actorName: actor.name,
        aliases: actor.aliases,
        country: actor.country,
        motivation: actor.motivation,
        targetRegions: actor.targetRegions,
        targetIndustries: actor.targetIndustries,
        topTechniques: actor.techniques.slice(0, 10).map((t) => t.name),
        tacticCount: actor.tacticCoverage.filter((t) => t.count > 0).length,
      }),
    });

    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    return data.summary;
  } catch {
    return generateTemplateSummary(actor);
  }
}

export function generateTemplateSummary(actor: ActorWithTechniques): string {
  const topTactics = actor.tacticCoverage
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((t) => t.tacticName.replace(/-/g, " "))
    .join(", ");

  const topTechs = actor.techniques
    .slice(0, 3)
    .map((t) => t.name)
    .join(", ");

  const para1 = `${actor.name} (also tracked as ${actor.aliases.slice(0, 3).join(", ") || "no known aliases"}) is a ${actor.motivation}-motivated threat actor attributed to ${actor.country}. The group primarily targets organizations across ${actor.targetRegions.slice(0, 3).join(", ")}, with a focus on the ${actor.targetIndustries.slice(0, 3).join(", ")} sectors. Attribution is based on MITRE ATT&CK v16.1 public intelligence assessments.`;

  const para2 = `The group has documented use of ${actor.techniques.length} distinct techniques across ${actor.tacticCoverage.filter((t) => t.count > 0).length} ATT&CK tactic categories. Primary tactic areas include ${topTactics || "multiple ATT&CK tactics"}. Notably observed techniques include ${topTechs || "various TTPs documented in the ATT&CK corpus"}, reflecting the group's operational tradecraft.`;

  const para3 = `Detection priorities should focus on the data sources most relevant to this actor's documented TTPs. Security teams are advised to validate coverage against the ATT&CK Navigator layer for this group and to cross-reference findings with additional intelligence sources. This profile is generated from public MITRE ATT&CK data and should not be treated as actionable threat intelligence without multi-source corroboration.`;

  return `${para1}\n\n${para2}\n\n${para3}`;
}
