# Limite sezione “Gli ultimi contributi pubblicati”

Questa patch limita la sezione `Gli ultimi contributi pubblicati` a tre card visibili.

La pagina mantiene alcuni candidati extra nell’HTML per non rompere la logica delle pubblicazioni programmate lato browser: eventuali card future restano `hidden` fino alla data prevista, mentre lo script mostra sempre al massimo i primi tre contributi effettivamente visibili.

File modificato:

- `src/pages/pubblicazioni/index.astro`

Verifica:

```powershell
npm run build
git status --short
git add src/pages/pubblicazioni/index.astro docs/README_LIMITA_ULTIMI_CONTRIBUTI_3.md
git commit -m "Limit latest publications to three visible cards"
git push
```
