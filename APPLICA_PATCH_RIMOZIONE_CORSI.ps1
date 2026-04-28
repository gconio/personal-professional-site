$ErrorActionPreference = "Stop"

$filesToRemove = @(
  ".\src\content\corsi\structured-analytic-techniques.md",
  ".\src\content\corsi\ach.md",
  ".\src\content\corsi\osint.md"
)

foreach ($file in $filesToRemove) {
  if (Test-Path $file) {
    Remove-Item $file -Force
    Write-Host "Rimosso: $file"
  } else {
    Write-Host "Già assente: $file"
  }
}

Write-Host "Patch applicata. Esegui ora: npm run build"
