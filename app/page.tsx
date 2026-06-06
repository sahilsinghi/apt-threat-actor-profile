import { getAllActors } from "@/lib/mitre";
import { ActorSelector } from "@/components/ActorSelector";
import { Shield, Zap, GitCompare, Download, Search } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const actors = getAllActors().map(({ id, name, aliases, country, motivation }) => ({
    id, name, aliases, country, motivation,
  }));

  const featured = [
    { id: "G0007", name: "APT28 / Fancy Bear", country: "Russia", motivation: "espionage" },
    { id: "G0016", name: "APT29 / Cozy Bear", country: "Russia", motivation: "espionage" },
    { id: "G0032", name: "Lazarus Group", country: "North Korea", motivation: "financial" },
    { id: "G0096", name: "APT41", country: "China", motivation: "espionage" },
    { id: "G0034", name: "Sandworm Team", country: "Russia", motivation: "destruction" },
    { id: "G0046", name: "FIN7", country: "Unknown", motivation: "financial" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20">
            <Shield className="w-3.5 h-3.5" />
            MITRE ATT&amp;CK v16.1 · 159 Documented Groups
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            APT Threat Actor<br />
            <span className="text-primary">Intelligence Dossiers</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select any APT group to generate a polished one-page dossier — TTP heatmap, top techniques,
            live IOC feed, recommended detections, and AI-generated executive summary.
          </p>
          <div className="max-w-xl mx-auto">
            <ActorSelector actors={actors} placeholder="Search APT28, Lazarus Group, APT41..." />
          </div>
          <p className="text-xs text-muted-foreground">
            {actors.length} documented threat actors · Data: MITRE ATT&amp;CK + abuse.ch ThreatFox
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Search, title: "150+ Actors", desc: "Full MITRE ATT&CK Groups corpus" },
            { icon: Zap, title: "Live IOC Feed", desc: "Real-time abuse.ch ThreatFox data" },
            { icon: GitCompare, title: "Side-by-Side Compare", desc: "Jaccard similarity analysis" },
            { icon: Download, title: "PDF Export", desc: "Polished multi-page dossiers" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured actors */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-lg font-bold mb-4">Featured Actors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {featured.map((actor) => (
            <Link key={actor.id} href={`/actor/${actor.id}`}>
              <div className="group border border-border rounded-lg p-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{actor.name}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{actor.id}</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{actor.country}</span>
                </div>
                <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium
                  ${actor.motivation === "espionage" ? "bg-blue-100 text-blue-700" : ""}
                  ${actor.motivation === "financial" ? "bg-green-100 text-green-700" : ""}
                  ${actor.motivation === "destruction" ? "bg-red-100 text-red-700" : ""}
                `}>
                  {actor.motivation}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link href="/compare?a=G0007&b=G0016">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <GitCompare className="w-4 h-4" />
              Try APT28 vs APT29 comparison →
            </button>
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 text-xs text-amber-800">
          <strong>Educational use only.</strong> All data sourced from MITRE ATT&amp;CK v16.1 public assessments and abuse.ch ThreatFox.
          This tool does not produce actionable threat intelligence. Real-world attribution requires multi-source corroboration by qualified analysts.
          Do not use this data for blocking or response decisions without independent validation.
        </div>
      </section>
    </div>
  );
}
