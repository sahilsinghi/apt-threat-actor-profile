import { describe, it, expect } from "vitest";
import { getActorWithTechniques } from "@/lib/mitre";
import { compareActors } from "@/lib/comparison";

describe("comparison logic", () => {
  it("comparing an actor to itself gives 100% Jaccard", () => {
    const actor = getActorWithTechniques("G0007");
    expect(actor).toBeDefined();
    const result = compareActors(actor!, actor!);
    expect(result.jaccardSimilarity).toBe(1);
    expect(result.uniqueToA.length).toBe(0);
    expect(result.uniqueToB.length).toBe(0);
  });

  it("APT28 vs APT29 produces valid comparison", () => {
    const apt28 = getActorWithTechniques("G0007");
    const apt29 = getActorWithTechniques("G0016");
    expect(apt28).toBeDefined();
    expect(apt29).toBeDefined();
    const result = compareActors(apt28!, apt29!);
    expect(result.jaccardSimilarity).toBeGreaterThanOrEqual(0);
    expect(result.jaccardSimilarity).toBeLessThanOrEqual(1);
    expect(result.sharedTechniques.length).toBeGreaterThanOrEqual(0);
  });

  it("shared techniques are a subset of both actors techniques", () => {
    const a = getActorWithTechniques("G0007")!;
    const b = getActorWithTechniques("G0016")!;
    const result = compareActors(a, b);
    const aIds = new Set(a.techniques.map((t) => t.id));
    const bIds = new Set(b.techniques.map((t) => t.id));
    for (const t of result.sharedTechniques) {
      expect(aIds.has(t.id)).toBe(true);
      expect(bIds.has(t.id)).toBe(true);
    }
  });
});
