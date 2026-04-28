# Patch corso “Analisi intelligence”

Questa patch aggiorna la cartella `src/content/corsi/`.

Operazioni incluse:

1. crea `fondamenti-di-intelligence.md` per mantenere il primo corso con uno slug corretto;
2. aggiorna `analisi-intelligence.md` con il nuovo corso “Analisi intelligence”;
3. aggiorna l’ordine dei corsi già presenti per evitare conflitti nel catalogo.

Dopo l’applicazione, gli URL saranno:

- `/didattica/fondamenti-di-intelligence/`
- `/didattica/analisi-intelligence/`

Eseguire sempre:

```powershell
npm run build
```

prima del commit/push.
