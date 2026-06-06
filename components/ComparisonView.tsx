"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ActorWithTechniques, ComparisonResult } from "@/lib/types";
import type { Actor } from "@/lib/types";
import { compareActors } from "@/lib/comparison";
import { ActorSelector } from "@/components/ActorSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { exportComparisonPDF } from "@/lib/pdf-report";
import { Download, GitCompare, Copy, Check } from "lucide-react";

interface ComparisonViewProps {
  actors: Pick<Actor, "id" | "name" | "aliases" | "country" | "motivation">[];
  initialA?: ActorWithTechniques;
  initialB?: ActorWithTechniques;
}

async function fetchActor(id: string): Promise<ActorWithTechniques | undefined> {
  try {
    const res = await fetch(`/api/actor/${id}`);
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
  }
}

export function ComparisonView({ actors, initialA, initialB }: ComparisonViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [actorA, setActorA] = useState<ActorWithTechniques | undefined>(initialA);
  const [actorB, setActorB] = useState<ActorWithTechniques | undefined>(initialB);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleSelectA(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("a", id);
    router.replace(`/compare?${params.toString()}`);
    const actor = await fetchActor(id);
    setActorA(actor);
  }

  async function handleSelectB(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("b", id);
    router.replace(`/compare?${params.toString()}`);
    const actor = await fetchActor(id);
    setActorB(actor);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExport() {
    if (!result) return;
    setExporting(true);
    try {
      await exportComparisonPDF(result);
    } finally {
      setExporting(false);
    }
  }

  const result: ComparisonResult | null =
    actorA && actorB ? compareActors(actorA, actorB) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
        <strong>Attribution caveat:</strong> Shared TTPs indicate overlapping technique repertoire documented by MITRE ATT&amp;CK.
        This does NOT imply shared infrastructure, operators, or campaigns. TTP overlap is one signal among many in attribution analysis.
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Actor Comparison</h1>
          <p className="text-sm text-muted-foreground mt-1">Side-by-side TTP analysis with Jaccard similarity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
            {copied ? <><Check className="w-4 h-4 text-green-500" />Copied!</> : <><Copy className="w-4 h-4" />Copy Link</>}
          </Button>
          {result && (
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting} className="gap-1.5">
              <Download className="w-4 h-4" />
              {exporting ? "Exporting..." : "Export PDF"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Actor A</p>
          <ActorSelector actors={actors} onSelect={handleSelectA} placeholder="Select first actor..." />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Actor B</p>
          <ActorSelector actors={actors} onSelect={handleSelectB} placeholder="Select second actor..." />
        </div>
      </div>

      {!actorA && !actorB && (
        <div className="text-center py-16 text-muted-foreground">
          <GitCompare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Select two actors to compare</p>
          <p className="text-sm mt-1">Side-by-side TTP analysis, target overlap, and Jaccard similarity score</p>
        </div>
      )}

      {(actorA || actorB) && !result && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Select both actors to see the comparison</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Similarity score */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{Math.round(result.jaccardSimilarity * 100)}%</p>
                  <p className="text-sm text-muted-foreground mt-1">Jaccard Similarity</p>
                  <p className="text-xs text-muted-foreground">Technique overlap</p>
                  <div className="mt-3">
                    <Progress value={result.jaccardSimilarity * 100} className="h-2" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold">{result.sharedTechniques.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Shared Techniques</p>
                  <p className="text-xs text-muted-foreground">Documented by both</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold">{result.sharedRegions.length}</p>
                  <p className="text-sm text-muted-foreground mt-1">Shared Target Regions</p>
                  <p className="text-xs text-muted-foreground">Geographic overlap</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side-by-side actor cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[result.actorA, result.actorB].map((actor, idx) => (
              <Card key={actor.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{actor.name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{actor.id}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{idx === 0 ? "Actor A" : "Actor B"}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Country</span>
                    <span className="font-medium">{actor.country}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Motivation</span>
                    <span className="font-medium capitalize">{actor.motivation}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Techniques</span>
                    <span className="font-medium">{actor.techniques.length}</span>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1.5">Target Regions</p>
                    <div className="flex flex-wrap gap-1">
                      {actor.targetRegions.map((r) => (
                        <Badge key={r} variant={result.sharedRegions.includes(r) ? "default" : "outline"} className="text-xs">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Technique breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-700">
                  Unique to {result.actorA.name} ({result.uniqueToA.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto space-y-1">
                {result.uniqueToA.slice(0, 20).map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-primary">{t.id}</span>
                    <span className="text-foreground truncate">{t.name}</span>
                  </div>
                ))}
                {result.uniqueToA.length > 20 && (
                  <p className="text-xs text-muted-foreground">+{result.uniqueToA.length - 20} more</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-700">
                  Shared ({result.sharedTechniques.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto space-y-1">
                {result.sharedTechniques.slice(0, 20).map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-primary">{t.id}</span>
                    <span className="text-foreground truncate">{t.name}</span>
                  </div>
                ))}
                {result.sharedTechniques.length > 20 && (
                  <p className="text-xs text-muted-foreground">+{result.sharedTechniques.length - 20} more</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-700">
                  Unique to {result.actorB.name} ({result.uniqueToB.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto space-y-1">
                {result.uniqueToB.slice(0, 20).map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-primary">{t.id}</span>
                    <span className="text-foreground truncate">{t.name}</span>
                  </div>
                ))}
                {result.uniqueToB.length > 20 && (
                  <p className="text-xs text-muted-foreground">+{result.uniqueToB.length - 20} more</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />
          <p className="text-xs text-muted-foreground">
            Jaccard similarity = |A ∩ B| / |A ∪ B| where A and B are sets of technique IDs.
            Shared TTPs indicate overlapping documented technique repertoire and should not be interpreted as shared infrastructure or operators.
            Data source: MITRE ATT&amp;CK v16.1.
          </p>
        </div>
      )}
    </div>
  );
}
