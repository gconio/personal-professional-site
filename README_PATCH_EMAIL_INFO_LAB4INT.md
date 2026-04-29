# Patch — sostituzione email pubblica Lab4Int

Questa patch sostituisce l'indirizzo pubblico `giovanni.conio@proton.me` con:

```text
info@lab4int.com
```

Aggiorna:

- `src/pages/contatti.astro`
- `src/pages/commenti-manuale.astro`
- `docs/01_IDENTITA_SITO.md`
- `docs/05_CHECKLIST_PERSONALIZZAZIONE.md`

Nel form commenti Manuale, l'attributo `action` non usa l'email in chiaro: viene impostato con il token FormSubmit:

```text
https://formsubmit.co/343b366feef432ec940db53476f6d698
```

## Applicazione

Dalla root del progetto:

```powershell
.\lab4int-email-info-patch\APPLICA_PATCH_EMAIL_INFO_LAB4INT.ps1
npm run build
git add .
git commit -m "Update public email address"
git push
```
