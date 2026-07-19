# Lab4Int Editorial Governance

La milestone v0.4 aggiunge un report di governance non bloccante alla pipeline editoriale.

## Comando

```bash
npm run editorial:governance
```

Output:

- `artifacts/editorial/editorial-governance-report.json`
- `artifacts/editorial/EDITORIAL_GOVERNANCE_REPORT.md`

La data di riferimento è quella corrente. Per ottenere risultati deterministici:

```bash
EDITORIAL_AS_OF_DATE=2026-07-19 npm run editorial:governance
```

In PowerShell:

```powershell
$env:EDITORIAL_AS_OF_DATE = "2026-07-19"
npm run editorial:governance
Remove-Item Env:EDITORIAL_AS_OF_DATE
```

## Stati

- `current`: entro la soglia ordinaria della collezione;
- `review-due`: revisione consigliata;
- `stale`: revisione prioritaria;
- `undated`: nessuna data utile disponibile.

## Priorità

- `P0`: riservata agli errori bloccanti della pipeline;
- `P1`: intervento prioritario;
- `P2`: revisione programmabile;
- `P3`: nessuna azione immediata.

## Sorgenti temporali

Il report usa, in ordine di precedenza, `lastReviewed` quando presente e poi i campi già disponibili nella collezione (`date`, `visibleFrom` o `year`). Il campo `year` è interpretato convenzionalmente come il 1° luglio dell'anno indicato.

Le pubblicazioni adottano soglie ampie perché il loro valore è anche archivistico. Risorse e media adottano soglie più brevi, coerenti con la maggiore volatilità dei collegamenti e dei contenuti esterni. I corsi senza `lastReviewed` risultano `undated`.

Il report non modifica alcun contenuto e non rende fallita la CI in presenza di elementi `review-due`, `stale` o `undated`.
