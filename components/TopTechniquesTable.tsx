"use client";

import { ExternalLink } from "lucide-react";
import type { Technique } from "@/lib/types";
import { TACTIC_DISPLAY_NAMES } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopTechniquesTableProps {
  techniques: Technique[];
}

const tacticColors: Record<string, string> = {
  "initial-access": "bg-red-50 text-red-700 border-red-200",
  "execution": "bg-orange-50 text-orange-700 border-orange-200",
  "persistence": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "privilege-escalation": "bg-amber-50 text-amber-700 border-amber-200",
  "defense-evasion": "bg-lime-50 text-lime-700 border-lime-200",
  "credential-access": "bg-green-50 text-green-700 border-green-200",
  "discovery": "bg-teal-50 text-teal-700 border-teal-200",
  "lateral-movement": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "collection": "bg-sky-50 text-sky-700 border-sky-200",
  "command-and-control": "bg-blue-50 text-blue-700 border-blue-200",
  "exfiltration": "bg-violet-50 text-violet-700 border-violet-200",
  "impact": "bg-red-50 text-red-800 border-red-300",
  "reconnaissance": "bg-slate-50 text-slate-700 border-slate-200",
  "resource-development": "bg-zinc-50 text-zinc-700 border-zinc-200",
};

export function TopTechniquesTable({ techniques }: TopTechniquesTableProps) {
  const top = techniques.slice(0, 10);

  if (top.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Top Techniques</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No technique attribution documented.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Top Techniques</CardTitle>
          <span className="text-sm text-muted-foreground">Showing {top.length} of {techniques.length}</span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-24">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Technique</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Tactic</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide w-10"></th>
              </tr>
            </thead>
            <tbody>
              {top.map((tech, i) => (
                <tr key={tech.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-primary">{tech.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{tech.name}</span>
                    {tech.dataSources.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                        {tech.dataSources.slice(0, 2).join(" · ")}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${tacticColors[tech.tactic] ?? "bg-gray-50 text-gray-700"}`}
                    >
                      {TACTIC_DISPLAY_NAMES[tech.tactic] ?? tech.tactic}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={tech.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      title="View on ATT&CK"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
