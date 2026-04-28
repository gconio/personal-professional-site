# Patch corso Conflict Analysis

Questa patch aggiorna la cartella:

```text
src/content/corsi/
```

Il file principale modificato è:

```text
src/content/corsi/conflict-analysis.md
```

La scheda del corso è stata ricostruita sulla base del documento di impianto "Programma del corso Conflict Analysis.docx".

## Applicazione

Copiare la cartella `src/content/corsi/` dentro il progetto, sovrascrivendo i file esistenti.

Poi eseguire:

```powershell
npm run build
git add .
git commit -m "Add Conflict Analysis course"
git push
```
