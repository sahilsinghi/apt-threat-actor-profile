import type { ActorWithTechniques, ComparisonResult } from "./types";

export function compareActors(a: ActorWithTechniques, b: ActorWithTechniques): ComparisonResult {
  const setA = new Set(a.techniques.map((t) => t.id));
  const setB = new Set(b.techniques.map((t) => t.id));

  const sharedIds = [...setA].filter((id) => setB.has(id));
  const sharedTechniques = a.techniques.filter((t) => sharedIds.includes(t.id));
  const uniqueToA = a.techniques.filter((t) => !setB.has(t.id));
  const uniqueToB = b.techniques.filter((t) => !setA.has(t.id));

  const union = new Set([...setA, ...setB]).size;
  const jaccardSimilarity = union === 0 ? 0 : Math.round((sharedIds.length / union) * 100) / 100;

  const regSetA = new Set(a.targetRegions);
  const regSetB = new Set(b.targetRegions);
  const sharedRegions = [...regSetA].filter((r) => regSetB.has(r));
  const uniqueRegionsA = [...regSetA].filter((r) => !regSetB.has(r));
  const uniqueRegionsB = [...regSetB].filter((r) => !regSetA.has(r));

  const indSetA = new Set(a.targetIndustries);
  const indSetB = new Set(b.targetIndustries);
  const sharedIndustries = [...indSetA].filter((i) => indSetB.has(i));
  const uniqueIndustriesA = [...indSetA].filter((i) => !indSetB.has(i));
  const uniqueIndustriesB = [...indSetB].filter((i) => !indSetA.has(i));

  return {
    actorA: a,
    actorB: b,
    sharedTechniques,
    uniqueToA,
    uniqueToB,
    jaccardSimilarity,
    sharedRegions,
    uniqueRegionsA,
    uniqueRegionsB,
    sharedIndustries,
    uniqueIndustriesA,
    uniqueIndustriesB,
  };
}
