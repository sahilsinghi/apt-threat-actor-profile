# Privacy Architecture

APT Profiler is built privacy-first. No analytics, no telemetry, no third-party tracking scripts.

## What Runs Where

| Component | Runs on | Data leaving device? |
|---|---|---|
| MITRE ATT&CK data | Browser (bundled in repo) | No — no MITRE API calls at runtime |
| ThreatFox IOC fetch | Browser → abuse.ch API | Yes — actor tag sent to ThreatFox API |
| Saved dossiers | Browser localStorage | No |
| AI summary | Browser → Vercel API route → Anthropic | Actor metadata sent to Anthropic API |
| Analytics | None | N/A |

## Anthropic API Call Lifecycle

1. User clicks "Generate AI Summary" in the browser
2. Browser calls `/api/summary` (Next.js API route on Vercel)
3. Vercel server calls Anthropic API using `ANTHROPIC_API_KEY` env var
4. Summary text is returned to the browser
5. The API key never reaches the browser

Actor metadata sent to Anthropic: name, aliases, country, motivation, target regions/industries, top technique names, tactic count. No user identity data is sent.

## Threat Model

- No user data is collected or stored server-side
- No session cookies, no login, no accounts
- ThreatFox receives only the actor tag you search (no user IP attribution by us)
- Anthropic receives structured actor metadata (not user identity)
- localStorage data is private to your browser; it cannot be read by any server

## No Analytics

Even privacy-respecting analytics (Plausible, Fathom) are not included. The CTI audience is privacy-sensitive and analytics would undermine tool credibility.
