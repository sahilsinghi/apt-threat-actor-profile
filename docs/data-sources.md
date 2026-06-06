# Data Sources

## MITRE ATT&CK v16.1 STIX Bundle

- **File:** `/data/mitre/enterprise-attack.json`
- **Source:** https://github.com/mitre/cti/tree/ATT%26CK-v16.1
- **Version pinned:** ATT&CK v16.1 (released October 2024)
- **Contents:** 21,315 STIX objects including 159 intrusion-sets, 203 attack-patterns, tactics, and relationship objects
- **License:** Apache 2.0

The bundle is committed to the repository for reproducibility and offline operation. This makes the app immune to MITRE API changes and version-pins the data for audit-trail purposes.

### How to Update

To update to a newer ATT&CK release:

```bash
# Replace v17.0 with the target version
curl -L "https://github.com/mitre/cti/raw/ATT%26CK-v17.0/enterprise-attack/enterprise-attack.json" \
  -o data/mitre/enterprise-attack.json

# Then update the version constant
# Edit lib/types.ts: MITRE_VERSION = "ATT&CK v17.0"
```

Commit the updated bundle with the ATT&CK version in the commit message for clear audit trail.

## abuse.ch ThreatFox

- **Endpoint:** `https://threatfox-api.abuse.ch/api/v1/`
- **Auth:** No API key required (public API)
- **Query type:** `taginfo` — searches IOCs by actor tag
- **Rate limit:** Reasonable use; no documented hard limit
- **Coverage:** Non-exhaustive — many APT groups have limited or no ThreatFox tagging

ThreatFox tagging is community-driven and uneven. Some high-profile actors (APT28, Lazarus) have better coverage than others. Empty IOC states are explicitly labeled as non-exhaustive.

## Anthropic Claude Sonnet 4.6 (Optional)

- Used only for AI-generated executive summaries
- Called server-side via `/api/summary` route
- Requires `ANTHROPIC_API_KEY` environment variable
- Falls back to deterministic templated summary when key is absent
- Approximate cost: ~INR 0.05 per summary at claude-sonnet-4-6 pricing
