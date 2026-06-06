import { describe, it, expect } from "vitest";
import { getAllActors, getActorById, getActorWithTechniques, computeJaccard } from "@/lib/mitre";

describe("MITRE parser", () => {
  it("loads 100+ actors", () => {
    const actors = getAllActors();
    expect(actors.length).toBeGreaterThan(100);
  });

  it("each actor has an id and name", () => {
    const actors = getAllActors();
    for (const actor of actors) {
      expect(actor.id).toBeTruthy();
      expect(actor.name).toBeTruthy();
    }
  });

  it("finds APT28 by ID G0007", () => {
    const actor = getActorById("G0007");
    expect(actor).toBeDefined();
    expect(actor!.name).toBe("APT28");
  });

  it("APT28 has techniques", () => {
    const actor = getActorWithTechniques("G0007");
    expect(actor).toBeDefined();
    expect(actor!.techniques.length).toBeGreaterThan(5);
  });

  it("tactic coverage has 14 entries", () => {
    const actor = getActorWithTechniques("G0007");
    expect(actor!.tacticCoverage.length).toBe(14);
  });

  it("Jaccard similarity is 0 for identical technique sets", () => {
    const a = getAllActors()[0];
    expect(computeJaccard(a, a)).toBe(1);
  });
});
