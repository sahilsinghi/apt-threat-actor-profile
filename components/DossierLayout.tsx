"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ActorWithTechniques } from "@/lib/types";
import { MOTIVATION_COLORS } from "@/lib/types";
import { TtpHeatmap } from "@/components/TtpHeatmap";
import { TopTechniquesTable } from "@/components/TopTechniquesTable";
import { IocFeed } from "@/components/IocFeed";
import { RecommendedDetections } from "@/components/RecommendedDetections";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { saveDossier, removeDossier, isDossierSaved } from "@/lib/storage";
import { exportDossierPDF } from "@/lib/pdf-report";
import {
  Globe, Target, Briefcase, GitCompare, Bookmark, BookmarkCheck,
  Download, ExternalLink, Copy, Check, ArrowLeft
} from "lucide-react";

interface DossierLayoutProps {
  actor: ActorWithTechniques;
}

export function DossierLayout({ actor }: DossierLayoutProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(() => isDossierSaved(actor.id));
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  function handleSave() {
    if (saved) {
      removeDossier(actor.id);
      setSaved(false);
    } else {
      saveDossier({ actorId: actor.id, actorName: actor.name, savedAt: new Date().toISOString() });
      setSaved(true);
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleExportPDF() {
    setExporting(true);
    try {
      await exportDossierPDF(actor);
    } finally {
      setExporting(false);
    }
  }

  const mitreUrl = `https://attack.mitre.org/groups/${actor.id}/`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Disclaimer banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
        <strong>Educational use only.</strong> All attribution data comes from MITRE ATT&amp;CK v16.1 public assessments.
        Real-world threat intelligence requires multi-source corroboration and should not rely solely on this tool.
      </div>

      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-1.5">
            {saved ? <><BookmarkCheck className="w-4 h-4 text-primary" />Saved</> : <><Bookmark className="w-4 h-4" />Save</>}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
            {copied ? <><Check className="w-4 h-4 text-green-500" />Copied!</> : <><Copy className="w-4 h-4" />Copy Link</>}
          </Button>
          <Link href={`/compare?a=${actor.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <GitCompare className="w-4 h-4" /> Compare
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting} className="gap-1.5">
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </div>

      {/* Hero card */}
      <Card className="border-2">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{actor.name}</h1>
                <span className="font-mono text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">{actor.id}</span>
              </div>
              {actor.aliases.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {actor.aliases.slice(0, 6).map((alias) => (
                    <Badge key={alias} variant="secondary" className="text-xs">{alias}</Badge>
                  ))}
                  {actor.aliases.length > 6 && (
                    <Badge variant="secondary" className="text-xs">+{actor.aliases.length - 6} more</Badge>
                  )}
                </div>
              )}
            </div>
            <a href={mitreUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
                ATT&amp;CK Profile
              </Button>
            </a>
          </div>

          <Separator />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Attribution</p>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium">{actor.country}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Motivation</p>
              <span className={`text-xs px-2 py-1 rounded-full border font-medium ${MOTIVATION_COLORS[actor.motivation]}`}>
                {actor.motivation}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Techniques</p>
              <span className="text-sm font-medium">{actor.techniques.length}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Tactic Coverage</p>
              <span className="text-sm font-medium">
                {actor.tacticCoverage.filter((t) => t.count > 0).length} / 14
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                <Target className="w-3.5 h-3.5 inline mr-1" />Target Regions
              </p>
              <div className="flex flex-wrap gap-1.5">
                {actor.targetRegions.map((r) => (
                  <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                <Briefcase className="w-3.5 h-3.5 inline mr-1" />Target Industries
              </p>
              <div className="flex flex-wrap gap-1.5">
                {actor.targetIndustries.map((i) => (
                  <Badge key={i} variant="outline" className="text-xs">{i}</Badge>
                ))}
              </div>
            </div>
          </div>

          {actor.description && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Description</p>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{actor.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main sections */}
      <TtpHeatmap tacticCoverage={actor.tacticCoverage} actorName={actor.name} />
      <TopTechniquesTable techniques={actor.techniques} />
      <IocFeed actorName={actor.name} />
      <RecommendedDetections techniques={actor.techniques} />
      <ExecutiveSummary actor={actor} />
    </div>
  );
}
