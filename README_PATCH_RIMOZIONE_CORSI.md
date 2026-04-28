# Patch — rimozione corsi dal catalogo Didattica

Questa patch elimina dal catalogo pubblico i seguenti corsi:

- Structured Analytic Techniques
- ACH — Analysis of Competing Hypotheses
- OSINT per analisti

Restano nel catalogo:

1. Fondamenti di intelligence
2. Analisi intelligence
3. Conflict Analysis
4. Simulazioni intelligence e crisis management

## Applicazione manuale

1. Copiare la cartella `src/content/corsi/` nel progetto.
2. Eliminare, se ancora presenti, questi file:
   - `src/content/corsi/structured-analytic-techniques.md`
   - `src/content/corsi/ach.md`
   - `src/content/corsi/osint.md`
3. Eseguire:

```powershell
npm run build
git add .
git commit -m "Remove selected courses from didattica catalog"
git push
```

## Applicazione con script PowerShell

Dopo aver estratto la patch nella root del progetto, eseguire:

```powershell
.\APPLICA_PATCH_RIMOZIONE_CORSI.ps1
```

Lo script rimuove i tre file corso non più pubblici.
