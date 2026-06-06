"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import type { Actor } from "@/lib/types";

interface ActorSelectorProps {
  actors: Pick<Actor, "id" | "name" | "aliases" | "country" | "motivation">[];
  onSelect?: (actorId: string) => void;
  placeholder?: string;
  className?: string;
}

export function ActorSelector({ actors, onSelect, placeholder = "Search 150+ APT groups...", className }: ActorSelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return actors.slice(0, 30);
    const q = query.toLowerCase();
    return actors
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.aliases.some((alias) => alias.toLowerCase().includes(q)) ||
          a.id.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [actors, query]);

  function handleSelect(actor: Pick<Actor, "id" | "name" | "aliases" | "country" | "motivation">) {
    setOpen(false);
    setQuery("");
    if (onSelect) {
      onSelect(actor.id);
    } else {
      router.push(`/actor/${actor.id}`);
    }
  }

  const motivationColors: Record<string, string> = {
    espionage: "bg-blue-100 text-blue-700",
    financial: "bg-green-100 text-green-700",
    hacktivism: "bg-orange-100 text-orange-700",
    destruction: "bg-red-100 text-red-700",
    unknown: "bg-gray-100 text-gray-600",
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        className="flex items-center gap-2 w-full border border-border rounded-lg px-4 py-3 bg-background cursor-text shadow-sm hover:border-primary/50 transition-colors"
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-xl overflow-hidden">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No actors found for &quot;{query}&quot;
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {!query && (
                  <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border bg-muted/30">
                    Showing top 30 of {actors.length} actors — type to search all
                  </div>
                )}
                {filtered.map((actor) => (
                  <button
                    key={actor.id}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
                    onClick={() => handleSelect(actor)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{actor.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{actor.id}</span>
                      </div>
                      {actor.aliases.length > 0 && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {actor.aliases.slice(0, 3).join(" · ")}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{actor.country}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${motivationColors[actor.motivation] ?? motivationColors.unknown}`}>
                        {actor.motivation}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
