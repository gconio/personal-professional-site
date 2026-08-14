# Patch — Pagina informativa Masterclass Pensare per scenari

Questa patch aggiunge una pagina informativa per la Masterclass Lab4Int “Pensare per scenari” e aggiorna il popup già inserito.

## File inclusi

- `src/pages/masterclass/pensare-per-scenari/index.astro`
- `src/components/MasterclassPopup.astro`
- `public/images/masterclass/masterclass-pensare-per-scenari-2026.png`

## Cosa cambia

- Nuova pagina: `/masterclass/pensare-per-scenari/`
- La locandina nel popup rimanda alla pagina informativa.
- Il popup mantiene il pulsante diretto verso Google Forms.
- La pagina contiene programma, destinatari, obiettivi, FAQ, link ai percorsi formativi e CTA di iscrizione.

## Verifica

```powershell
cd C:\Users\giova\OneDrive\Desktop\Installazioni\Repositories\personal-professional-site-starter
npm run build
npm run dev
```

Aprire:

```text
http://localhost:4321/masterclass/pensare-per-scenari/
```

## Pubblicazione

Il repository richiede Pull Request per modificare `main`. Non fare push diretto su `main`.

```powershell
git switch -c feature/masterclass-landing-page
npm run build
git add .
git commit -m "Add masterclass information page"
git push -u origin feature/masterclass-landing-page
```
