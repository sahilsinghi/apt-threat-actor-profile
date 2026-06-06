import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 503 });
  }

  const body = await req.json();
  const { actorName, aliases, country, motivation, targetRegions, targetIndustries, topTechniques, tacticCount } = body;

  const prompt = `You are a senior CTI analyst. Generate a concise 3-paragraph executive summary for the following threat actor profile. Write for a technical audience (SOC L2 / CTI analyst). Do not add headers or bullet points — plain paragraphs only.

Actor: ${actorName}
Also known as: ${aliases.join(", ") || "no known aliases"}
Attributed country: ${country}
Primary motivation: ${motivation}
Target regions: ${targetRegions.join(", ")}
Target industries: ${targetIndustries.join(", ")}
MITRE ATT&CK tactics covered: ${tacticCount} of 14
Top techniques: ${topTechniques.join(", ")}

Paragraph 1: Who the actor is, attribution context, and primary motivation.
Paragraph 2: Operational profile — target sectors, geographic focus, and notable TTPs.
Paragraph 3: Detection and response implications, and a clear disclaimer that this is based on public MITRE ATT&CK data and requires multi-source corroboration for actionable intelligence.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text ?? "";
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("Summary generation failed:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
