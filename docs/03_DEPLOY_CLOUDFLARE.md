# Deploy su Cloudflare Pages

## Procedura consigliata

1. Creare un repository GitHub.
2. Caricare il progetto nel repository.
3. Accedere a Cloudflare.
4. Aprire Workers & Pages.
5. Creare una nuova applicazione Pages collegata al repository GitHub.
6. Impostare:

```text
Production branch: main
Build command: npm run build
Build output directory: dist
```

7. Salvare e avviare il primo deploy.

## Aggiornamenti successivi

Ogni commit su `main` genera automaticamente una nuova build e pubblica la versione aggiornata del sito.

## Dominio

La prima pubblicazione può usare il sottodominio gratuito:

```text
nome-progetto.pages.dev
```

Un dominio personale può essere aggiunto in seguito.
