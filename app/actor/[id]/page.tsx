import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllActors, getActorWithTechniques } from "@/lib/mitre";
import { DossierLayout } from "@/components/DossierLayout";

interface Params {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getAllActors().map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const actor = getActorWithTechniques(id);
  if (!actor) return { title: "Actor Not Found" };
  return {
    title: `${actor.name} (${actor.id}) — APT Profiler`,
    description: `Threat actor dossier for ${actor.name}. ${actor.techniques.length} techniques across ${actor.tacticCoverage.filter((t) => t.count > 0).length} MITRE ATT&CK tactics.`,
  };
}

export default async function ActorPage({ params }: Params) {
  const { id } = await params;
  const actor = getActorWithTechniques(id);
  if (!actor) notFound();

  return <DossierLayout actor={actor} />;
}
