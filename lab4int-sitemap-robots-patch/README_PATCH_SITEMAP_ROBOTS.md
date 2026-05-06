# PATCH — Sitemap Astro e robots.txt

Questa patch aggiunge la generazione automatica della sitemap al sito personale Astro e allinea `robots.txt` al dominio pubblico corretto.

## File aggiornati

- `astro.config.mjs`
- `package.json`
- `package-lock.json`
- `public/robots.txt`

## Modifiche principali

- Aggiunta dipendenza `@astrojs/sitemap`.
- Aggiornato `site` da `https://gconio.pages.dev` a `https://giovanni.conio.lab4int.com`.
- Aggiunta integrazione `sitemap()` in `astro.config.mjs`.
- Confermato `robots.txt` con riferimento a `https://giovanni.conio.lab4int.com/sitemap-index.xml`.

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-sitemap-robots-patch\APPLICA_PATCH_SITEMAP_ROBOTS.ps1
npm install
npm run build
```

Dopo il build, verifica:

```powershell
Test-Path .\dist\sitemap-index.xml
Select-String -Path .\dist\robots.txt -Pattern "Sitemap"
```

Poi committa e pubblica:

```powershell
git status
git add .
git commit -m "Add sitemap and robots configuration"
git push
```
