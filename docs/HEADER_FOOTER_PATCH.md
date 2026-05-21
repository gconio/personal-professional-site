# Patch uniformità header/footer Lab4Int

Questa patch sostituisce i componenti condivisi:

- `src/components/Header.astro`
- `src/components/Footer.astro`

## Obiettivo

Uniformare la navigazione principale e il footer su tutte le pagine che usano `BaseLayout.astro`.

Navigazione attesa:

Home · Chi sono · Didattica · Progetti · Pubblicazioni · Risorse · Contatti

Footer atteso:

Didattica · Progetti · Pubblicazioni · Risorse · Contatti · Privacy & Cookie Policy · Note legali

## Verifica duplicati header hardcoded

Dopo avere copiato i file, eseguire da PowerShell:

```powershell
Select-String -Path .\src\**\*.astro,.\src\**\*.md -Pattern "Chi sono|Pubblicazioni|Risorse|site-header|main-nav" -CaseSensitive:$false
```

Se emergono pagine con header/nav hardcoded, vanno ricondotte a `BaseLayout.astro` oppure al componente `Header.astro`.

## Build

```powershell
npm run build
```

## Verifica pubblicata

Controllare:

- `/`
- `/progetti/`
- `/progetti/intel-sim-platform/`
- `/privacy-cookie-policy/`
- `/note-legali/`

Se `/progetti/intel-sim-platform/` resta senza “Risorse” nel menu dopo deploy, il problema non è nel componente caricato qui ma nella pagina dinamica di rendering dei progetti, probabilmente `src/pages/progetti/[id].astro` o equivalente.
