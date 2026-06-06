"use client";

import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import type { TacticCoverage, Technique } from "@/lib/types";
import { TACTIC_DISPLAY_NAMES } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TtpHeatmapProps {
  tacticCoverage: TacticCoverage[];
  actorName: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { subject: string; count: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
        <p className="font-semibold">{data.subject}</p>
        <p className="text-muted-foreground">{data.count} technique{data.count !== 1 ? "s" : ""}</p>
      </div>
    );
  }
  return null;
}

function TacticRow({ tactic }: { tactic: TacticCoverage }) {
  const [expanded, setExpanded] = useState(false);
  const displayName = TACTIC_DISPLAY_NAMES[tactic.tacticName] ?? tactic.tacticName;

  if (tactic.count === 0) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />}
        <span className="font-medium text-sm flex-1">{displayName}</span>
        <Badge variant="secondary" className="text-xs">{tactic.count}</Badge>
      </button>
      {expanded && (
        <div className="px-4 py-3 space-y-2 border-t border-border">
          {tactic.techniques.map((tech: Technique) => (
            <div key={tech.id} className="flex items-start gap-3">
              <a
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-primary hover:underline shrink-0"
              >
                {tech.id}
              </a>
              <span className="text-sm">{tech.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TtpHeatmap({ tacticCoverage, actorName }: TtpHeatmapProps) {
  const activeTactics = tacticCoverage.filter((t) => t.count > 0);
  const totalTechniques = tacticCoverage.reduce((sum, t) => sum + t.count, 0);
  const maxCount = Math.max(...tacticCoverage.map((t) => t.count), 1);

  const radarData = tacticCoverage.map((t) => ({
    subject: TACTIC_DISPLAY_NAMES[t.tacticName] ?? t.tacticName,
    count: t.count,
    fullMark: maxCount,
    tacticId: t.tacticName,
  }));

  if (totalTechniques === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">TTP Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No technique attribution documented for {actorName} in ATT&amp;CK v16.1.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="ttp-heatmap">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">TTP Coverage Heatmap</CardTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{totalTechniques} techniques</span>
            <span>·</span>
            <span>{activeTactics.length} of 14 tactics</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <Radar
                name={actorName}
                dataKey="count"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Techniques by Tactic</h4>
          <div className="space-y-1.5">
            {tacticCoverage.map((tactic) => (
              <TacticRow key={tactic.tacticName} tactic={tactic} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
