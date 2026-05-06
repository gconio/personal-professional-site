$ErrorActionPreference = 'Stop'
Write-Host 'Applicazione patch: sitemap Astro e robots.txt' -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path '.\public' | Out-Null

$filesToBackup = @(
  '.\astro.config.mjs',
  '.\package.json',
  '.\package-lock.json',
  '.\public\robots.txt'
)

foreach ($file in $filesToBackup) {
  if (Test-Path $file) {
    Copy-Item -Path $file -Destination ($file + '.bak') -Force
  }
}

Copy-Item -Path '.\lab4int-sitemap-robots-patch\astro.config.mjs' -Destination '.\astro.config.mjs' -Force
Copy-Item -Path '.\lab4int-sitemap-robots-patch\package.json' -Destination '.\package.json' -Force
Copy-Item -Path '.\lab4int-sitemap-robots-patch\package-lock.json' -Destination '.\package-lock.json' -Force
Copy-Item -Path '.\lab4int-sitemap-robots-patch\public\robots.txt' -Destination '.\public\robots.txt' -Force

Write-Host 'Patch applicata correttamente.' -ForegroundColor Green
Write-Host 'Ora esegui: npm install ; npm run build' -ForegroundColor Yellow
