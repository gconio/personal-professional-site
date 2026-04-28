# Patch logo SISR nelle Pubblicazioni

Questa patch assegna il logo del Sistema di Informazione per la Sicurezza della Repubblica come miniatura ai paper pubblicati sul sito del SISR.

File aggiornati:
- src/content/pubblicazioni/pensiero-critico-analisi-intelligence.md
- src/content/pubblicazioni/analisi-intelligence-tra-arte-e-scienza.md
- src/content/pubblicazioni/analisi-intelligence-basata-su-indicatori.md

File aggiunto:
- public/images/publications/sisr/logo-sisr-thumbnail.png

Dopo l'applicazione:
npm run build
git add .
git commit -m "Use SISR logo for institutional paper thumbnails"
git push
