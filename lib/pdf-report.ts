import type { ActorWithTechniques, ComparisonResult } from "./types";
import { TACTIC_DISPLAY_NAMES, MITRE_VERSION } from "./types";

async function loadJsPDF() {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  return { jsPDF, autoTable };
}

const COLORS = {
  primary: [37, 99, 235] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addCoverPage(doc: any, actor: ActorWithTechniques, date: string) {
  // Header bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 45, "F");

  // APT Profiler label
  doc.setFontSize(9);
  doc.setTextColor(200, 220, 255);
  doc.setFont("helvetica", "normal");
  doc.text("APT PROFILER · THREAT ACTOR DOSSIER", 15, 18);

  // Actor name
  doc.setFontSize(24);
  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.text(actor.name, 15, 35);

  // Aliases
  let y = 58;
  if (actor.aliases.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text(`Also known as: ${actor.aliases.slice(0, 5).join(", ")}`, 15, y);
    y += 10;
  }

  // Metadata grid
  const meta = [
    ["MITRE ID", actor.id],
    ["Attribution", actor.country],
    ["Motivation", actor.motivation],
    ["Techniques", String(actor.techniques.length)],
    ["Tactic Coverage", `${actor.tacticCoverage.filter((t) => t.count > 0).length} / 14`],
    ["Generated", date],
    ["Data Source", MITRE_VERSION],
  ];

  y += 5;
  function drawMetaCell(xi: number, label: string, value: string) {
    doc.setFillColor(...COLORS.bg);
    doc.roundedRect(xi, y, 85, 12, 2, 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.setFont("helvetica", "normal");
    doc.text(label.toUpperCase(), xi + 4, y + 5);
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.dark);
    doc.setFont("helvetica", "bold");
    doc.text(value, xi + 4, y + 10);
  }
  for (let i = 0; i < meta.length; i += 2) {
    drawMetaCell(15, meta[i][0], meta[i][1]);
    if (meta[i + 1]) drawMetaCell(110, meta[i + 1][0], meta[i + 1][1]);
    y += 16;
  }

  // Targets section
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("TARGET REGIONS", 15, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(9);
  doc.text(actor.targetRegions.join(" · "), 15, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("TARGET INDUSTRIES", 15, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.setFontSize(9);
  doc.text(actor.targetIndustries.join(" · "), 15, y);

  // Disclaimer footer
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 270, 210, 27, "F");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.amber);
  doc.setFont("helvetica", "bold");
  doc.text("⚠ EDUCATIONAL USE ONLY", 15, 280);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(
    "Attribution data sourced from MITRE ATT&CK v16.1 public assessments. Not actionable threat intelligence.",
    15, 287,
    { maxWidth: 180 }
  );
}

export async function exportDossierPDF(actor: ActorWithTechniques): Promise<void> {
  const { jsPDF, autoTable } = await loadJsPDF();
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // Cover page
  addCoverPage(doc as never, actor, date);

  // TTP Heatmap table (page 2)
  doc.addPage();
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 18, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("TTP Coverage by Tactic", 15, 12);

  const tacticRows = actor.tacticCoverage
    .filter((t) => t.count > 0)
    .map((t) => [
      TACTIC_DISPLAY_NAMES[t.tacticName] ?? t.tacticName,
      String(t.count),
      t.techniques.slice(0, 3).map((tech) => `${tech.id}: ${tech.name}`).join("\n"),
    ]);

  autoTable(doc as never, {
    startY: 25,
    head: [["Tactic", "# Techniques", "Sample Techniques"]],
    body: tacticRows,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: COLORS.bg },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 }, 1: { cellWidth: 25, halign: "center" }, 2: { cellWidth: 120 } },
  });

  // Top techniques (page 3)
  doc.addPage();
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 18, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("Top 10 Techniques", 15, 12);

  const techRows = actor.techniques.slice(0, 10).map((t) => [
    t.id,
    t.name,
    TACTIC_DISPLAY_NAMES[t.tactic] ?? t.tactic,
    t.dataSources.slice(0, 2).join(", "),
  ]);

  autoTable(doc as never, {
    startY: 25,
    head: [["ID", "Technique", "Tactic", "Data Sources"]],
    body: techRows,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: COLORS.bg },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 22, textColor: COLORS.primary }, 1: { cellWidth: 65 }, 2: { cellWidth: 40 }, 3: { cellWidth: 60 } },
  });

  // Recommended detections
  const detectionY = (doc as never as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("Recommended Detection Priorities", 15, detectionY);

  const detectionSources = [...new Set(actor.techniques.flatMap((t) => t.dataSources))].sort().slice(0, 12);
  const detectionRows = detectionSources.map((s) => [s]);

  autoTable(doc as never, {
    startY: detectionY + 5,
    head: [["Data Source (ATT&CK Mapping)"]],
    body: detectionRows,
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: COLORS.bg },
    tableWidth: 180,
  });

  doc.save(`${actor.name.replace(/\s+/g, "-")}-dossier-${date.replace(/\s/g, "-")}.pdf`);
}

export async function exportComparisonPDF(result: ComparisonResult): Promise<void> {
  const { jsPDF, autoTable } = await loadJsPDF();
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  // Cover
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 45, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 220, 255);
  doc.text("APT PROFILER · COMPARISON REPORT", 15, 18);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(`${result.actorA.name} vs ${result.actorB.name}`, 15, 35);

  let y = 58;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text("Overlap Metrics", 15, y);
  y += 10;

  const metrics = [
    ["Jaccard Similarity", `${Math.round(result.jaccardSimilarity * 100)}%`],
    ["Shared Techniques", String(result.sharedTechniques.length)],
    ["Shared Target Regions", result.sharedRegions.join(", ") || "None"],
    ["Shared Industries", result.sharedIndustries.join(", ") || "None"],
  ];

  autoTable(doc as never, {
    startY: y,
    body: metrics,
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: COLORS.bg },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
  });

  // Shared techniques
  doc.addPage();
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 18, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(`Shared Techniques (${result.sharedTechniques.length})`, 15, 12);

  autoTable(doc as never, {
    startY: 25,
    head: [["ID", "Technique", "Tactic"]],
    body: result.sharedTechniques.slice(0, 30).map((t) => [t.id, t.name, TACTIC_DISPLAY_NAMES[t.tactic] ?? t.tactic]),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: COLORS.primary, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: COLORS.bg },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 22, textColor: COLORS.primary } },
  });

  // Disclaimer
  doc.addPage();
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.amber);
  doc.text("Attribution Caveat", 15, 20);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text(
    "Shared TTPs indicate overlapping documented technique repertoire per MITRE ATT&CK v16.1. This does NOT imply shared infrastructure, operators, or campaigns. Jaccard similarity measures technique-set overlap only. This report is generated from public data and should not be treated as actionable threat intelligence.",
    15, 30,
    { maxWidth: 180 }
  );

  doc.save(`${result.actorA.name}-vs-${result.actorB.name}-comparison-${date.replace(/\s/g, "-")}.pdf`);
}
