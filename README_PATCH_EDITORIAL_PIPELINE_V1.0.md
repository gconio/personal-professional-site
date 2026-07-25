# Editorial Pipeline v1.0

## Flusso operativo

```text
Scrittura
    ↓
Inbox Pubblicazioni
    ↓
Preparazione automatica
    ↓
Verifica
    ↓
Anteprima
    ↓
Pubblicazione
```

## Inbox

Creare una cartella per ciascun articolo:

```text
incoming/pubblicazioni/nome-articolo/
├── articolo.docx    # oppure .md o .txt
├── articolo.pdf     # obbligatorio
└── thumbnail.png    # richiesta prima del commit
```

## Comandi

### 1. Preparazione

```powershell
npm run editorial:prepare
```

Con più cartelle nell'inbox:

```powershell
npm run editorial:prepare -- --folder "nome-articolo"
```

### 2. Verifica

```powershell
npm run editorial:verify -- --slug "slug-generato"
```

Genera la scheda, copia gli asset, valida il profilo editoriale ed esegue la build Astro.

### 3. Anteprima

```powershell
npm run editorial:preview -- --slug "slug-generato"
```

Avvia Astro e apre il browser. Il server si interrompe con `CTRL+C`.

### 4. Piano di pubblicazione

```powershell
npm run editorial:publish-plan -- --slug "slug-generato"
```

Controlla gli output e mostra i comandi Git. Non esegue commit o push.

### Stato

```powershell
npm run editorial:status
```

## Sicurezza operativa

La pipeline non esegue automaticamente:

- commit;
- push;
- merge;
- deploy;
- cancellazione dei file dell'inbox.

Ogni fase registra lo stato in `.editorial/state/<slug>.json`.
