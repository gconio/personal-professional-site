# Guida ai contenuti

## Aggiungere un corso

Creare un nuovo file Markdown in:

```text
src/content/corsi/nome-corso.md
```

Esempio frontmatter:

```yaml
---
title: "Titolo corso"
description: "Descrizione breve."
level: "Intermedio"
duration: "8 ore"
format: "Workshop"
audience: ["studenti", "analisti"]
featured: false
order: 7
---
```

## Aggiungere un progetto

Creare un nuovo file in:

```text
src/content/progetti/nome-progetto.md
```

## Aggiungere una pubblicazione

Creare un nuovo file in:

```text
src/content/pubblicazioni/titolo-pubblicazione.md
```

## Aggiungere un articolo o una nota analitica

Creare un nuovo file in:

```text
src/content/analisi/titolo-articolo.md
```

Usare `draft: true` per preparare un contenuto senza pubblicarlo.
