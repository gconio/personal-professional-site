# Patch — corso Intell Production

Questa patch inserisce il corso:

- `Intell Production — Strategie e tecniche per la realizzazione di un prodotto intelligence efficace`

La patch riallinea il catalogo Didattica a quattro corsi pubblici:

1. Fondamenti di intelligence
2. Analisi intelligence
3. Conflict Analysis
4. Intell Production

## File inclusi

- `src/content/corsi/fondamenti-di-intelligence.md`
- `src/content/corsi/analisi-intelligence.md`
- `src/content/corsi/conflict-analysis.md`
- `src/content/corsi/intell-production.md`
- `APPLICA_PATCH_INTELL_PRODUCTION.ps1`

## Applicazione consigliata

1. Estrai la patch nella root del progetto.
2. Copia la cartella `src/content/corsi/` nel progetto, sovrascrivendo i file esistenti.
3. Esegui lo script PowerShell:

```powershell
.\APPLICA_PATCH_INTELL_PRODUCTION.ps1
```

4. Verifica:

```powershell
npm run build
```

5. Pubblica:

```powershell
git add .
git commit -m "Add Intell Production course"
git push
```

Lo script rimuove eventuali vecchi file corso non più pubblici:

- `structured-analytic-techniques.md`
- `ach.md`
- `osint.md`
- `simulazioni-intelligence.md`
