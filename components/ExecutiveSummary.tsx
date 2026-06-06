"use client";

import { useState } from "react";
import { generateExecutiveSummary, generateTemplateSummary } from "@/lib/claude";
import type { ActorWithTechniques } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RefreshCw, FileText } from "lucide-react";

interface ExecutiveSummaryProps {
  actor: ActorWithTechniques;
  hasApiKey: boolean;
}

export function ExecutiveSummary({ actor, hasApiKey }: ExecutiveSummaryProps) {
  const [summary, setSummary] = useState<string>(() => generateTemplateSummary(actor));
  const [loading, setLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  async function handleGenerateAI() {
    setLoading(true);
    try {
      const result = await generateExecutiveSummary(actor);
      setSummary(result);
      setIsAiGenerated(true);
    } finally {
      setLoading(false);
    }
  }

  function handleResetTemplate() {
    setSummary(generateTemplateSummary(actor));
    setIsAiGenerated(false);
  }

  const paragraphs = summary.split("\n\n").filter(Boolean);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base">Executive Summary</CardTitle>
          <div className="flex items-center gap-2">
            {isAiGenerated ? (
              <>
                <div className="flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 border border-purple-200 px-2 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>AI-generated</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleResetTemplate} className="text-xs h-7">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  <FileText className="w-3 h-3" />
                  <span>Template</span>
                </div>
                {hasApiKey && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAI}
                    disabled={loading}
                    className="text-xs h-7 gap-1.5"
                  >
                    {loading ? (
                      <><Loader2 className="w-3 h-3 animate-spin" />Generating...</>
                    ) : (
                      <><Sparkles className="w-3 h-3" />Generate AI Summary</>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">{para}</p>
        ))}
        {!hasApiKey && (
          <p className="text-xs text-muted-foreground border-t border-border pt-3">
            AI-generated summaries require an Anthropic API key configured in Vercel environment variables.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
