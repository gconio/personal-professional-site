# Home temporanea — sito in costruzione

Questa versione sostituisce temporaneamente la pagina:

```text
src/pages/index.astro
```

La Home definitiva precedente è stata conservata in:

```text
docs/backups/index-home-originale.astro
```

## Cosa personalizzare subito

Nel file `src/pages/index.astro` sostituire:

```text
Giovanni CONIO
giovanni.conio@proton.me
```

con i dati reali.

## Come rimuoverla quando il sito sarà pronto

1. Copiare il contenuto di `docs/backups/index-home-originale.astro`.
2. Incollarlo in `src/pages/index.astro`.
3. Eseguire:

```bash
npm run build
```

4. Fare commit e push su GitHub.
5. Cloudflare Pages pubblicherà automaticamente la Home definitiva.
