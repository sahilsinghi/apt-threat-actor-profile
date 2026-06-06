import type { IOC } from "./types";

const THREATFOX_API = "https://threatfox-api.abuse.ch/api/v1/";
const CACHE_TTL_MS = 60 * 60 * 1000;

const iocCache = new Map<string, { data: IOC[]; fetchedAt: number }>();

const ACTOR_TAG_MAP: Record<string, string[]> = {
  "APT28": ["apt28", "fancy-bear", "sofacy"],
  "APT29": ["apt29", "cozy-bear", "nobelium"],
  "APT41": ["apt41", "double-dragon", "barium"],
  "APT32": ["apt32", "oceanlotus"],
  "Lazarus Group": ["lazarus", "hidden-cobra"],
  "Kimsuky": ["kimsuky", "thallium"],
  "APT33": ["apt33", "elfin", "refined-kitten"],
  "APT34": ["apt34", "oilrig", "helix-kitten"],
  "FIN7": ["fin7", "carbanak"],
  "Sandworm Team": ["sandworm", "voodoo-bear"],
  "Mustang Panda": ["mustang-panda", "bronze-president", "ta416"],
};

function getTagsForActor(actorName: string): string[] {
  for (const [key, tags] of Object.entries(ACTOR_TAG_MAP)) {
    if (actorName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(actorName.toLowerCase())) {
      return tags;
    }
  }
  return [actorName.toLowerCase().replace(/\s+/g, "-")];
}

export async function fetchIOCsForActor(actorName: string): Promise<IOC[]> {
  const cacheKey = actorName.toLowerCase();
  const cached = iocCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const tags = getTagsForActor(actorName);
  const allIOCs: IOC[] = [];

  try {
    for (const tag of tags.slice(0, 2)) {
      const response = await fetch(THREATFOX_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: "taginfo",
          tag,
          limit: 20,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) continue;
      const data = await response.json();
      if (data.query_status !== "ok" || !data.data) continue;

      for (const ioc of data.data) {
        allIOCs.push({
          id: ioc.id ?? String(Math.random()),
          iocType: ioc.ioc_type ?? "unknown",
          iocValue: ioc.ioc ?? "",
          malwareFamily: ioc.malware ?? "unknown",
          firstSeen: ioc.first_seen ?? "",
          lastSeen: ioc.last_seen ?? "",
          confidence: ioc.confidence_level ?? 0,
          tags: ioc.tags ?? [],
        });
      }
    }
  } catch {
    // Network failure — return empty with no throw
    return [];
  }

  const unique = allIOCs.filter(
    (ioc, i, arr) => arr.findIndex((x) => x.iocValue === ioc.iocValue) === i
  );

  iocCache.set(cacheKey, { data: unique, fetchedAt: Date.now() });
  return unique;
}
