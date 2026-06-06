import type { SavedDossier } from "./types";

const STORAGE_KEY = "apt-profiler-saved-dossiers";

export function getSavedDossiers(): SavedDossier[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDossier(dossier: SavedDossier): void {
  const existing = getSavedDossiers().filter((d) => d.actorId !== dossier.actorId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([dossier, ...existing].slice(0, 20)));
}

export function removeDossier(actorId: string): void {
  const updated = getSavedDossiers().filter((d) => d.actorId !== actorId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function isDossierSaved(actorId: string): boolean {
  return getSavedDossiers().some((d) => d.actorId === actorId);
}
