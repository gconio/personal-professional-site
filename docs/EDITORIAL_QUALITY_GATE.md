# Lab4Int Editorial Quality Gate v0.3

## Scopo

La v0.3 aggiunge alla validazione strutturale della v0.2.1 un livello di controllo qualitativo e un report leggibile da persone e sistemi.

## Modello di severità

- **Error**: incoerenza oggettiva che blocca la CI, ad esempio slug non valido, anno implausibile, tipo di asset incompatibile o YouTube ID malformato.
- **Warning**: opportunità editoriale o prestazionale che non blocca la pubblicazione, ad esempio titolo/descrizione fuori dalle soglie consigliate, immagine pesante, thumbnail assente o link non HTTPS.

## Soglie consigliate

- titolo: 20–70 caratteri;
- descrizione: 100–180 caratteri;
- slug: massimo 70 caratteri;
- immagine pesante: oltre 1,5 MB;
- PDF pesante: oltre 8 MB.

Le soglie sono euristiche e non modificano automaticamente i contenuti.

## Output

Il comando:

```text
npm run editorial:quality
```

genera:

```text
artifacts/editorial/editorial-quality-report.json
artifacts/editorial/EDITORIAL_QUALITY_REPORT.md
```

Gli artefatti sono esclusi dal versionamento e caricati dalla GitHub Action per sette giorni.

## Perimetro

La v0.3 non:

- modifica i contenuti editoriali;
- aggiunge dipendenze npm;
- esegue correzioni automatiche;
- effettua commit, push, merge o deploy;
- introduce scoring linguistico o valutazioni semantiche opache.
