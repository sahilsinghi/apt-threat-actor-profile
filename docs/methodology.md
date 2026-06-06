# Methodology

## TTP Coverage Computation

Techniques are extracted from ATT&CK STIX relationship objects of type `uses` where `source_ref` is an `intrusion-set` and `target_ref` is an `attack-pattern`. Only non-deprecated, non-revoked, non-subtechnique attack-patterns are counted. Tactic assignment uses the `kill_chain_phases` field on each attack-pattern.

## Jaccard Similarity

Comparison overlap is computed as:

```
|A ∩ B| / |A ∪ B|
```

Where A and B are sets of technique IDs for each actor. A score of 1.0 means identical technique sets; 0.0 means no overlap. This measures documented technique repertoire similarity only — it does not imply shared infrastructure, operators, or attribution confidence.

## Recommended Detections

Detection categories are derived from ATT&CK technique-to-data-source mappings in the STIX bundle (`x_mitre_data_sources` field on attack-pattern objects). These reflect what data sources would theoretically detect each documented technique. No editorial judgment is applied — this keeps recommendations defensible and auditable.

## Attribution Fields

Country attribution, motivation classification, target regions, and target industries are inferred from the actor description text in the STIX bundle. These are heuristic extractions from MITRE's own descriptions and may not perfectly represent every nuance of the original attribution assessment.
