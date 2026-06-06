import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllActors, getActorWithTechniques } from "@/lib/mitre";
import { ComparisonView } from "@/components/ComparisonView";

export const metadata: Metadata = {
  title: "Compare Actors — APT Profiler",
  description: "Side-by-side comparison of two APT groups with Jaccard similarity, TTP overlap, and target analysis.",
};

interface SearchParams {
  searchParams: Promise<{ a?: string; b?: string }>;
}

export default async function ComparePage({ searchParams }: SearchParams) {
  const { a, b } = await searchParams;
  const actors = getAllActors().map(({ id, name, aliases, country, motivation }) => ({
    id, name, aliases, country, motivation,
  }));

  const actorA = a ? getActorWithTechniques(a) : undefined;
  const actorB = b ? getActorWithTechniques(b) : undefined;

  function getActorData(id: string) {
    return getActorWithTechniques(id);
  }

  return (
    <Suspense>
      <ComparisonView
        actors={actors}
        initialA={actorA}
        initialB={actorB}
        getActorData={getActorData}
      />
    </Suspense>
  );
}
