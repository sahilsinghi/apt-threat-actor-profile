import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APT Profiler — Threat Actor Intelligence",
  description:
    "Generate polished APT threat actor dossiers from MITRE ATT&CK Groups corpus. TTP heatmaps, IOC feeds, detection priorities, and side-by-side comparison.",
  keywords: ["APT", "MITRE ATT&CK", "threat intelligence", "CTI", "threat actor", "dossier"],
  openGraph: {
    title: "APT Profiler",
    description: "MITRE ATT&CK-powered threat actor intelligence dossiers",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-xs">AP</span>
              </div>
              <span className="font-bold text-sm">APT Profiler</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">by Sahil Singhi</span>
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">Actors</a>
              <a href="/compare" className="text-muted-foreground hover:text-foreground transition-colors">Compare</a>
              <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a
                href="https://github.com/sahilsinghi/apt-threat-actor-profile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-border mt-16 py-8 text-center text-xs text-muted-foreground">
          <p>APT Profiler · Data: MITRE ATT&amp;CK v16.1 + abuse.ch ThreatFox · Built by Sahil Singhi</p>
          <p className="mt-1">Educational use only. Not actionable threat intelligence.</p>
        </footer>
      </body>
    </html>
  );
}
