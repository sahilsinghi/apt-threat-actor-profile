import type { Metadata } from "next";
import { MITRE_VERSION } from "@/lib/types";
import { getAllActors } from "@/lib/mitre";

export const metadata: Metadata = {
  title: "About — APT Profiler",
  description: "Data sources, methodology, and privacy architecture for APT Profiler.",
};

export default function AboutPage() {
  const actorCount = getAllActors().length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">About APT Profiler</h1>
        <p className="text-muted-foreground mt-2">
          A free, open-source threat actor intelligence tool built for CTI analysts, SOC engineers, and security researchers.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Data Sources</h2>
        <div className="space-y-3">
          <div className="border border-border rounded-lg p-4">
            <p className="font-semibold">MITRE ATT&amp;CK {MITRE_VERSION}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {actorCount} documented threat groups with technique attributions, aliases, and external references.
              The STIX 2.1 bundle is vendored in the repository at <code className="bg-muted px-1 rounded">/data/mitre/enterprise-attack.json</code> for
              reproducibility and offline operation. Version-pinned to ATT&amp;CK v16.1.
            </p>
            <a
              href="https://attack.mitre.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-2 inline-block"
            >
              attack.mitre.org →
            </a>
          </div>
          <div className="border border-border rounded-lg p-4">
            <p className="font-semibold">abuse.ch ThreatFox</p>
            <p className="text-sm text-muted-foreground mt-1">
              Live IOC data fetched client-side via the ThreatFox public API (no API key required).
              IOCs are filtered by actor tag where ThreatFox tagging supports. Results are cached client-side for 1 hour.
              ThreatFox tagging is non-exhaustive — absence of IOCs does not indicate actor dormancy.
            </p>
            <a
              href="https://threatfox.abuse.ch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-2 inline-block"
            >
              threatfox.abuse.ch →
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Methodology</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <div>
            <p className="font-semibold text-foreground">TTP Coverage Computation</p>
            <p>Techniques are extracted from ATT&amp;CK STIX relationship objects of type <code className="bg-muted px-1 rounded">uses</code>
              where source_ref is an intrusion-set and target_ref is an attack-pattern. Only non-deprecated, non-revoked, non-subtechnique
              attack-patterns are counted. Tactic assignment uses the kill_chain_phases field.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Jaccard Similarity</p>
            <p>
              Comparison overlap is computed as |A ∩ B| / |A ∪ B| where A and B are sets of technique IDs for each actor.
              A score of 1.0 means identical technique sets; 0.0 means no overlap. This measures documented technique repertoire
              similarity only — it does not imply shared infrastructure, operators, or attribution confidence.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Recommended Detections</p>
            <p>
              Detection categories are derived from ATT&amp;CK technique-to-data-source mappings in the STIX bundle
              (x_mitre_data_sources field). These reflect what data sources would theoretically detect each documented technique.
              No editorial judgment is applied — this keeps recommendations defensible and auditable.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Actor Attribution Fields</p>
            <p>
              Country attribution, motivation classification, target regions, and target industries are
              inferred from the actor description text in the STIX bundle. These are heuristic extractions from MITRE&apos;s
              own descriptions and may not perfectly represent every nuance of the original attribution assessment.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Privacy Architecture</h2>
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            APT Profiler is built with a privacy-first architecture. No analytics, no telemetry, no third-party tracking scripts.
          </p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>MITRE ATT&amp;CK data is vendored in the repo — no runtime calls to MITRE servers</li>
            <li>ThreatFox IOC fetching is done client-side with 1-hour client-side caching only</li>
            <li>Saved dossiers are stored in browser localStorage — never sent to any server</li>
            <li>AI summaries (when enabled) use a server-side API route so the Anthropic key never reaches the browser</li>
            <li>No user data is collected, stored, or transmitted server-side</li>
          </ul>
        </div>
      </section>

      <section>
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 text-sm text-amber-800">
          <p className="font-bold mb-2">Disclaimer</p>
          <p>
            APT Profiler is an educational tool. All attribution data comes from MITRE ATT&amp;CK public assessments.
            This tool does not produce actionable threat intelligence. Real-world threat intelligence requires
            multi-source corroboration by qualified analysts and should incorporate classified intelligence,
            private sector reporting, and direct incident investigation. Do not use dossiers from this tool
            for blocking, attribution, or response decisions without independent validation.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Part of Sahil&apos;s Security Engineering Portfolio</h2>
        <p className="text-sm text-muted-foreground">
          This tool is part of a portfolio of security engineering projects by Sahil Singhi.
          It is designed to complement a SOAR alert triage pipeline — enrichment + actor attribution + recommended detections.
        </p>
        <div className="flex gap-3 mt-3">
          <a
            href="https://github.com/sahilsinghi/apt-threat-actor-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            GitHub Repository →
          </a>
        </div>
      </section>
    </div>
  );
}
