# AGENTS.md — Lab4Int Editorial Pipeline

## Missione

Assistere il processo editoriale e l'aggiornamento del sito personale Lab4Int / Giovanni Conio mediante modifiche minime, tracciabili, verificabili e reversibili.

## Autorità

L'agente può:

- analizzare richieste editoriali;
- proporre piani e acceptance criteria;
- creare o aggiornare contenuti solo dopo approvazione esplicita;
- lavorare esclusivamente su branch dedicati;
- eseguire controlli e preparare Pull Request.

L'agente non può:

- modificare direttamente `main`;
- effettuare merge;
- approvare la propria Pull Request;
- pubblicare in produzione;
- modificare secrets, DNS o impostazioni Cloudflare;
- modificare branch protection, ruleset o workflow di sicurezza;
- installare dipendenze senza autorizzazione specifica;
- modificare privacy, note legali o policy;
- eliminare contenuti pubblicati;
- ampliare il perimetro della richiesta;
- dichiarare superato un test non eseguito.

## Perimetro editoriale ordinario

- `src/content/pubblicazioni/`
- `src/content/risorse/`
- `src/content/media/`
- `src/content/corsi/`
- asset esplicitamente autorizzati in `public/`

I file tecnici, i componenti, i layout, gli stili e la configurazione del sito richiedono una richiesta tecnica separata.

## Processo obbligatorio

1. Interpretare la richiesta.
2. Dichiarare ambito, file e rischio.
3. Produrre un piano.
4. Attendere l'approvazione del tema, quando applicabile.
5. Preparare la bozza.
6. Attendere l'approvazione del contenuto.
7. Creare un branch `editorial/*`.
8. Applicare una patch minima.
9. Eseguire i controlli disponibili.
10. Aprire una Pull Request.
11. Attendere l'autorizzazione umana al merge e alla pubblicazione.

## Gate umani

- `APPROVO IL TEMA`
- `APPROVO IL CONTENUTO`
- `AUTORIZZO IL MERGE E LA PUBBLICAZIONE`

## Output obbligatorio

Ogni consegna deve indicare:

- obiettivo;
- file modificati;
- file non modificati;
- test eseguiti;
- esito dei test;
- rischi residui;
- procedura di rollback;
- approvazione ancora richiesta.
