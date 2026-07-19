# Controlled Editorial Update Contract — v0.2.1

## Scopo

La pipeline v0.2 controlla la trasformazione di un contenuto approvato in una modifica verificabile del repository.

## Contratto di ingresso

Un aggiornamento editoriale deve dichiarare:

- classe E0–E4;
- contenuto o correzione approvati;
- collezione di destinazione;
- slug proposto;
- fonti;
- asset;
- file che si prevede di modificare.

## Perimetro ordinario

I branch `editorial/*` possono modificare soltanto:

- `src/content/corsi/`
- `src/content/media/`
- `src/content/pubblicazioni/`
- `src/content/risorse/`
- `public/images/`
- `public/docs/`
- `docs/EDITORIAL_DELIVERY_LOG.md`

Ogni modifica a componenti, pagine, stili, configurazioni, workflow, dipendenze o contenuti legali richiede un branch e un workflow tecnico separati.

## Controlli automatici

1. conformità minima del frontmatter;
2. tipo dei principali campi;
3. URL esterni nei campi previsti;
4. asset locali esistenti;
5. titoli duplicati nella stessa collezione;
6. URL duplicati nelle risorse;
7. `youtubeId` duplicati nei media;
8. build Astro;
9. collegamenti locali presenti nell'output generato;
10. inventario editoriale JSON e Markdown.

## Autorità

Il superamento dei controlli non equivale ad approvazione editoriale.

L'agente e la CI non possono:

- autorizzare il contenuto;
- effettuare merge;
- pubblicare;
- modificare le regole di protezione;
- ignorare un errore di validazione.

## Output

La CI produce l'artifact `editorial-validation-artifacts`, contenente:

- sito statico generato;
- `artifacts/editorial/editorial-index.json`;
- `artifacts/editorial/CONTENT_INVENTORY.md`.

## Chiusura

Il task si chiude soltanto dopo:

- controlli verdi;
- verifica della preview;
- autorizzazione umana;
- merge;
- verifica del sito pubblicato.
