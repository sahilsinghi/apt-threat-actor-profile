export interface Actor {
  id: string;
  name: string;
  aliases: string[];
  country: string;
  motivation: "espionage" | "financial" | "hacktivism" | "destruction" | "unknown";
  targetRegions: string[];
  targetIndustries: string[];
  techniqueIds: string[];
  description: string;
  externalReferences: ExternalReference[];
}

export interface Technique {
  id: string;
  name: string;
  tactic: string;
  tacticId: string;
  description: string;
  dataSources: string[];
  url: string;
}

export interface ActorWithTechniques extends Actor {
  techniques: Technique[];
  tacticCoverage: TacticCoverage[];
}

export interface TacticCoverage {
  tacticId: string;
  tacticName: string;
  count: number;
  techniques: Technique[];
}

export interface IOC {
  id: string;
  iocType: string;
  iocValue: string;
  malwareFamily: string;
  firstSeen: string;
  lastSeen: string;
  confidence: number;
  tags: string[];
}

export interface ExternalReference {
  sourceName: string;
  url?: string;
  externalId?: string;
}

export interface ComparisonResult {
  actorA: ActorWithTechniques;
  actorB: ActorWithTechniques;
  sharedTechniques: Technique[];
  uniqueToA: Technique[];
  uniqueToB: Technique[];
  jaccardSimilarity: number;
  sharedRegions: string[];
  uniqueRegionsA: string[];
  uniqueRegionsB: string[];
  sharedIndustries: string[];
  uniqueIndustriesA: string[];
  uniqueIndustriesB: string[];
}

export interface SavedDossier {
  actorId: string;
  actorName: string;
  savedAt: string;
  summary?: string;
}

export const MITRE_VERSION = "ATT&CK v16.1";

export const TACTIC_ORDER = [
  "reconnaissance",
  "resource-development",
  "initial-access",
  "execution",
  "persistence",
  "privilege-escalation",
  "defense-evasion",
  "credential-access",
  "discovery",
  "lateral-movement",
  "collection",
  "command-and-control",
  "exfiltration",
  "impact",
];

export const TACTIC_DISPLAY_NAMES: Record<string, string> = {
  "reconnaissance": "Reconnaissance",
  "resource-development": "Resource Dev",
  "initial-access": "Initial Access",
  "execution": "Execution",
  "persistence": "Persistence",
  "privilege-escalation": "Priv Escalation",
  "defense-evasion": "Defense Evasion",
  "credential-access": "Credential Access",
  "discovery": "Discovery",
  "lateral-movement": "Lateral Movement",
  "collection": "Collection",
  "command-and-control": "C2",
  "exfiltration": "Exfiltration",
  "impact": "Impact",
};

export const MOTIVATION_COLORS: Record<string, string> = {
  espionage: "bg-blue-100 text-blue-800 border-blue-200",
  financial: "bg-green-100 text-green-800 border-green-200",
  hacktivism: "bg-orange-100 text-orange-800 border-orange-200",
  destruction: "bg-red-100 text-red-800 border-red-200",
  unknown: "bg-gray-100 text-gray-800 border-gray-200",
};
