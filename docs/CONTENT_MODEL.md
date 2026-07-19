# Content Model Baseline

Questo documento fotografa il modello iniziale senza modificare gli schemi Astro esistenti.

## Collezioni osservate

- `src/content/pubblicazioni/`
- `src/content/risorse/`
- `src/content/media/`
- `src/content/corsi/`
- altre collezioni già gestite dal progetto

## Regola v0.1

La pipeline non introduce nuovi campi obbligatori e non modifica `content.config.ts`.

Ogni nuovo file deve replicare il frontmatter di un contenuto esistente appartenente alla stessa collezione.

## Risorse

Campi osservati nel repository:

- `title`
- `description`
- `type`
- `author` o `institution`, quando applicabile
- `year`, quando applicabile
- `category`
- `level`
- `language`
- `link`, quando applicabile
- `featured`
- `order`
- `tags`

## Controlli manuali obbligatori

- categoria già ammessa dalla collezione;
- URL coerente e verificato;
- assenza di duplicati;
- descrizione non promozionale;
- corretta attribuzione della fonte;
- codifica UTF-8.

## Evoluzione

La validazione semantica e l'eventuale campo di stato editoriale saranno introdotti solo dopo l'esame del file `src/content.config.ts` aggiornato e delle logiche di pubblicazione programmata già presenti.
