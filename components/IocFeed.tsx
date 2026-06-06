"use client";

import { useEffect, useState } from "react";
import { fetchIOCsForActor } from "@/lib/threatfox";
import type { IOC } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, Shield } from "lucide-react";

interface IocFeedProps {
  actorName: string;
}

const iocTypeColors: Record<string, string> = {
  "ip:port": "bg-orange-50 text-orange-700 border-orange-200",
  "domain": "bg-blue-50 text-blue-700 border-blue-200",
  "url": "bg-purple-50 text-purple-700 border-purple-200",
  "md5_hash": "bg-gray-50 text-gray-700 border-gray-200",
  "sha256_hash": "bg-gray-50 text-gray-700 border-gray-200",
  "sha1_hash": "bg-gray-50 text-gray-700 border-gray-200",
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr.split(" ")[0];
  }
}

export function IocFeed({ actorName }: IocFeedProps) {
  const [iocs, setIocs] = useState<IOC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchIOCsForActor(actorName)
      .then((data) => {
        if (!cancelled) {
          setIocs(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [actorName]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent IOCs</CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span>abuse.ch ThreatFox</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Fetching live IOC data from ThreatFox...</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 py-4 px-4 bg-orange-50 rounded-lg border border-orange-200">
            <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800">ThreatFox API unavailable</p>
              <p className="text-orange-700 mt-0.5">Unable to reach abuse.ch ThreatFox API. Check your connection or try again later.</p>
            </div>
          </div>
        )}

        {!loading && !error && iocs.length === 0 && (
          <div className="flex items-start gap-3 py-4 px-4 bg-muted/30 rounded-lg border border-border">
            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">No IOCs found in ThreatFox for {actorName}</p>
              <p className="text-muted-foreground mt-0.5">
                This does not mean the actor is dormant. ThreatFox tagging is non-exhaustive and many APT groups have limited community tagging coverage.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && iocs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Type</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">IOC Value</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Malware</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wide">First Seen</th>
                </tr>
              </thead>
              <tbody>
                {iocs.slice(0, 15).map((ioc) => (
                  <tr key={ioc.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className={`text-xs font-mono ${iocTypeColors[ioc.iocType] ?? "bg-gray-50 text-gray-700"}`}>
                        {ioc.iocType}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs max-w-xs truncate">{ioc.iocValue}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{ioc.malwareFamily}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(ioc.firstSeen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-3 px-1">
              Showing {Math.min(iocs.length, 15)} of {iocs.length} IOCs. Source: ThreatFox (abuse.ch). Last updated: now.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
