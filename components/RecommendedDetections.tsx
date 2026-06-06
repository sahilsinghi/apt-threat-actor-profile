import type { Technique } from "@/lib/types";
import { getRecommendedDetections } from "@/lib/mitre";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Eye } from "lucide-react";

interface RecommendedDetectionsProps {
  techniques: Technique[];
}

export function RecommendedDetections({ techniques }: RecommendedDetectionsProps) {
  const detections = getRecommendedDetections(techniques);

  const categoryIcons: Record<string, string> = {
    "Process": "⚙️",
    "Network": "🌐",
    "File": "📄",
    "Registry": "🗂️",
    "Command": "💻",
    "Authentication": "🔑",
    "Cloud": "☁️",
    "Container": "📦",
    "Application": "📱",
    "User": "👤",
  };

  function getIcon(source: string): string {
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (source.toLowerCase().includes(key.toLowerCase())) return icon;
    }
    return "🔍";
  }

  if (detections.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Recommended Detections</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No detection data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recommended Detections</CardTitle>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            <span>Derived from ATT&amp;CK data sources</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Detection priorities are derived from ATT&amp;CK technique-to-data-source mappings. Priorities reflect documented usage — not editorial opinion.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {detections.map((source) => (
            <div
              key={source}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <span className="text-base shrink-0">{getIcon(source)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{source}</p>
              </div>
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground pt-1 border-t border-border">
          Validate coverage against ATT&amp;CK Navigator for this actor. Cross-reference with your SIEM data source inventory.
        </p>
      </CardContent>
    </Card>
  );
}
