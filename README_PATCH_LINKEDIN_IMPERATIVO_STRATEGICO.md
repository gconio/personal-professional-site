# Patch - Articolo LinkedIn "Imperativo strategico"

Questa patch aggiunge in Pubblicazioni l'articolo LinkedIn:

- Imperativo strategico - strutturare una funzione di Corporate Intelligence efficace
- Pubblicato su LinkedIn il 27 agosto 2025

La patch aggiunge:

- src/content/pubblicazioni/linkedin-imperativo-strategico-corporate-intelligence.md
- public/docs/pubblicazioni/linkedin/imperativo-strategico-corporate-intelligence.pdf
- public/images/publications/linkedin/imperativo-strategico-corporate-intelligence-cover.png

Aggiorna inoltre l'ordine dell'articolo "La formazione degli analisti - dialogo con Irene Piccolo" da 58 a 59, così il contributo del 27 agosto 2025 resta prima di quello del 25 settembre 2025 nella sezione Articoli e contributi online.

Comandi consigliati:

```powershell
.\lab4int-linkedin-imperativo-strategico-patch\APPLICA_PATCH_LINKEDIN_IMPERATIVO_STRATEGICO.ps1
npm run build
git add .
git commit -m "Add LinkedIn article on Corporate Intelligence"
git push
```
