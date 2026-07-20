# ADR-003 — CAE Knowledge Model v0.2 refined

`editorial-index.json` resta la fonte autorevole dei metadati editoriali.

Il CAE genera:

```text
artifacts/editorial/intelligence/knowledge-index.json
```

Il nuovo file contiene esclusivamente il livello semantico e relazionale:

- assetId;
- sourceRef;
- assetType;
- topics;
- editorialProducts;
- relationships;
- knowledgeGaps;
- opportunities;
- missionLinks.

Le collections vengono mappate così:

| Collection | Asset type |
|---|---|
| corsi | course |
| risorse | resource |
| media | media |
| pubblicazioni | article, paper, book o publication in base a `type` |
