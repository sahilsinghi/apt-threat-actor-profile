import type { Actor, ActorWithTechniques, Technique, TacticCoverage } from "./types";
import { TACTIC_ORDER } from "./types";

interface StixObject {
  type: string;
  id: string;
  name?: string;
  description?: string;
  aliases?: string[];
  kill_chain_phases?: Array<{ kill_chain_name: string; phase_name: string }>;
  x_mitre_data_sources?: string[];
  external_references?: Array<{
    source_name: string;
    url?: string;
    external_id?: string;
  }>;
  relationship_type?: string;
  source_ref?: string;
  target_ref?: string;
  x_mitre_deprecated?: boolean;
  revoked?: boolean;
  x_mitre_is_subtechnique?: boolean;
}

interface StixBundle {
  objects: StixObject[];
}

let _bundle: StixBundle | null = null;
let _actors: Actor[] | null = null;
let _techniques: Map<string, Technique> | null = null;
let _actorTechniqueMap: Map<string, string[]> | null = null;

function getBundle(): StixBundle {
  if (_bundle) return _bundle;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  _bundle = require("../data/mitre/enterprise-attack.json") as StixBundle;
  return _bundle;
}

function inferCountry(description: string, aliases: string[]): string {
  const text = (description + " " + aliases.join(" ")).toLowerCase();
  if (text.includes("russia") || text.includes("russian") || text.includes("apt28") || text.includes("apt29") || text.includes("sandworm")) return "Russia";
  if (text.includes("china") || text.includes("chinese") || text.includes("pla") || text.includes("mustang panda") || text.includes("apt41") || text.includes("apt40") || text.includes("apt1")) return "China";
  if (text.includes("north korea") || text.includes("dprk") || text.includes("lazarus") || text.includes("kimsuky") || text.includes("apt38")) return "North Korea";
  if (text.includes("iran") || text.includes("iranian") || text.includes("apt33") || text.includes("apt34") || text.includes("apt35") || text.includes("charming kitten")) return "Iran";
  if (text.includes("vietnam")) return "Vietnam";
  if (text.includes("india")) return "India";
  if (text.includes("pakistan")) return "Pakistan";
  if (text.includes("turkey")) return "Turkey";
  if (text.includes("israel")) return "Israel";
  if (text.includes("united states") || text.includes("u.s.") || text.includes("nsa")) return "United States";
  return "Unknown";
}

function inferMotivation(description: string, name: string): Actor["motivation"] {
  const text = (description + " " + name).toLowerCase();
  if (text.includes("financial") || text.includes("money") || text.includes("profit") || text.includes("fraud") || text.includes("fin7") || text.includes("carbanak")) return "financial";
  if (text.includes("hacktivism") || text.includes("activist") || text.includes("political statement")) return "hacktivism";
  if (text.includes("destructive") || text.includes("wiper") || text.includes("sabotage") || text.includes("disruption") || text.includes("sandworm")) return "destruction";
  if (text.includes("espionage") || text.includes("intelligence") || text.includes("state-sponsored") || text.includes("nation-state") || text.includes("apt")) return "espionage";
  return "unknown";
}

function extractTargetRegions(description: string): string[] {
  const regions: string[] = [];
  const regionMap: Record<string, string> = {
    "united states": "North America",
    "u.s.": "North America",
    "canada": "North America",
    "europe": "Europe",
    "european": "Europe",
    "germany": "Europe",
    "france": "Europe",
    "ukraine": "Europe",
    "middle east": "Middle East",
    "saudi": "Middle East",
    "israel": "Middle East",
    "iran": "Middle East",
    "south korea": "East Asia",
    "japan": "East Asia",
    "taiwan": "East Asia",
    "china": "East Asia",
    "southeast asia": "Southeast Asia",
    "india": "South Asia",
    "pakistan": "South Asia",
    "africa": "Africa",
    "latin america": "Latin America",
    "south america": "Latin America",
    "australia": "Oceania",
    "global": "Global",
    "worldwide": "Global",
  };
  const text = description.toLowerCase();
  const found = new Set<string>();
  for (const [keyword, region] of Object.entries(regionMap)) {
    if (text.includes(keyword) && !found.has(region)) {
      found.add(region);
      regions.push(region);
    }
  }
  return regions.length > 0 ? regions : ["Global"];
}

function extractTargetIndustries(description: string): string[] {
  const industries: string[] = [];
  const industryMap: Record<string, string> = {
    "government": "Government",
    "defense": "Defense",
    "military": "Defense",
    "energy": "Energy",
    "oil": "Energy",
    "gas": "Energy",
    "financial": "Finance",
    "banking": "Finance",
    "healthcare": "Healthcare",
    "hospital": "Healthcare",
    "pharmaceutical": "Healthcare",
    "technology": "Technology",
    "telecom": "Telecommunications",
    "telecommunications": "Telecommunications",
    "aerospace": "Aerospace",
    "aviation": "Aviation",
    "transport": "Transportation",
    "education": "Education",
    "academic": "Education",
    "media": "Media",
    "manufacturing": "Manufacturing",
    "retail": "Retail",
    "critical infrastructure": "Critical Infrastructure",
  };
  const text = description.toLowerCase();
  const found = new Set<string>();
  for (const [keyword, industry] of Object.entries(industryMap)) {
    if (text.includes(keyword) && !found.has(industry)) {
      found.add(industry);
      industries.push(industry);
    }
  }
  return industries.length > 0 ? industries : ["Multiple Sectors"];
}

function parseTechniques(): Map<string, Technique> {
  if (_techniques) return _techniques;
  const bundle = getBundle();
  const tacticMap = new Map<string, string>();

  bundle.objects
    .filter((o) => o.type === "x-mitre-tactic")
    .forEach((t) => {
      const ref = t.external_references?.find((r) => r.source_name === "mitre-attack");
      if (ref?.external_id) tacticMap.set(t.name?.toLowerCase().replace(/\s+/g, "-") ?? "", ref.external_id);
    });

  _techniques = new Map();
  bundle.objects
    .filter(
      (o) =>
        o.type === "attack-pattern" &&
        !o.x_mitre_deprecated &&
        !o.revoked &&
        !o.x_mitre_is_subtechnique
    )
    .forEach((obj) => {
      const ref = obj.external_references?.find((r) => r.source_name === "mitre-attack");
      if (!ref?.external_id) return;
      const phase = obj.kill_chain_phases?.find((p) => p.kill_chain_name === "mitre-attack");
      const tacticName = phase?.phase_name ?? "unknown";
      _techniques!.set(obj.id, {
        id: ref.external_id,
        name: obj.name ?? "",
        tactic: tacticName,
        tacticId: tacticMap.get(tacticName) ?? "",
        description: obj.description ?? "",
        dataSources: obj.x_mitre_data_sources ?? [],
        url: ref.url ?? `https://attack.mitre.org/techniques/${ref.external_id}/`,
      });
    });

  return _techniques;
}

function parseActorTechniqueMap(): Map<string, string[]> {
  if (_actorTechniqueMap) return _actorTechniqueMap;
  const bundle = getBundle();
  _actorTechniqueMap = new Map();
  bundle.objects
    .filter(
      (o) =>
        o.type === "relationship" &&
        o.relationship_type === "uses" &&
        o.source_ref?.startsWith("intrusion-set--") &&
        o.target_ref?.startsWith("attack-pattern--")
    )
    .forEach((rel) => {
      const actorId = rel.source_ref!;
      const existing = _actorTechniqueMap!.get(actorId) ?? [];
      existing.push(rel.target_ref!);
      _actorTechniqueMap!.set(actorId, existing);
    });
  return _actorTechniqueMap;
}

export function getAllActors(): Actor[] {
  if (_actors) return _actors;
  const bundle = getBundle();
  const actorTechMap = parseActorTechniqueMap();
  const techniqueMap = parseTechniques();

  _actors = bundle.objects
    .filter((o) => o.type === "intrusion-set" && !o.x_mitre_deprecated && !o.revoked)
    .map((obj): Actor => {
      const extRef = obj.external_references?.find((r) => r.source_name === "mitre-attack");
      const stixTechIds = actorTechMap.get(obj.id) ?? [];
      const validTechIds = stixTechIds
        .map((stixId) => techniqueMap.get(stixId))
        .filter(Boolean)
        .map((t) => t!.id);

      return {
        id: extRef?.external_id ?? obj.id,
        name: obj.name ?? "",
        aliases: obj.aliases?.filter((a) => a !== obj.name) ?? [],
        country: inferCountry(obj.description ?? "", obj.aliases ?? []),
        motivation: inferMotivation(obj.description ?? "", obj.name ?? ""),
        targetRegions: extractTargetRegions(obj.description ?? ""),
        targetIndustries: extractTargetIndustries(obj.description ?? ""),
        techniqueIds: validTechIds,
        description: obj.description ?? "",
        externalReferences: (obj.external_references ?? []).map((r) => ({
          sourceName: r.source_name,
          url: r.url,
          externalId: r.external_id,
        })),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return _actors;
}

export function getActorById(id: string): Actor | undefined {
  return getAllActors().find((a) => a.id === id);
}

export function getActorWithTechniques(id: string): ActorWithTechniques | undefined {
  const actor = getActorById(id);
  if (!actor) return undefined;
  const bundle = getBundle();
  const techniqueMap = parseTechniques();
  const actorTechMap = parseActorTechniqueMap();

  const stixObj = bundle.objects.find(
    (o) =>
      o.type === "intrusion-set" &&
      o.external_references?.some((r) => r.external_id === id)
  );
  if (!stixObj) return undefined;

  const stixTechIds = actorTechMap.get(stixObj.id) ?? [];
  const techniques: Technique[] = stixTechIds
    .map((stixId) => techniqueMap.get(stixId))
    .filter(Boolean) as Technique[];

  const tacticMap = new Map<string, TacticCoverage>();
  for (const tactic of TACTIC_ORDER) {
    tacticMap.set(tactic, {
      tacticId: tactic,
      tacticName: tactic,
      count: 0,
      techniques: [],
    });
  }
  for (const tech of techniques) {
    const entry = tacticMap.get(tech.tactic);
    if (entry) {
      entry.count++;
      entry.techniques.push(tech);
    }
  }

  return {
    ...actor,
    techniques,
    tacticCoverage: Array.from(tacticMap.values()),
  };
}

export function getRecommendedDetections(techniques: Technique[]): string[] {
  const sources = new Set<string>();
  for (const tech of techniques) {
    for (const ds of tech.dataSources) {
      sources.add(ds);
    }
  }
  return Array.from(sources)
    .sort()
    .slice(0, 15);
}

export function computeJaccard(a: Actor, b: Actor): number {
  const setA = new Set(a.techniqueIds);
  const setB = new Set(b.techniqueIds);
  const intersection = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;
  return Math.round((intersection / union) * 100) / 100;
}

export function getActorsIndex() {
  return getAllActors().map(({ id, name, aliases, country, motivation }) => ({
    id,
    name,
    aliases,
    country,
    motivation,
  }));
}
