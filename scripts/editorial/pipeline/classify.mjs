export function detectTitle(lines, sourceFileName) {
  const heading = lines.find((line) => /^#\s+/.test(line));
  if (heading) return heading.replace(/^#\s+/, "").trim();

  const first = lines.find((line) => line.length >= 8 && line.length <= 180);
  if (first) return first;

  return sourceFileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function detectDescription(lines, title) {
  const candidates = lines
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .filter((line) => line !== title && line.length >= 80);

  const selected = candidates[0] || lines.find((line) => line !== title) || "";
  return selected.length > 320
    ? `${selected.slice(0, 317).trim()}...`
    : selected;
}

export function classifyText(text, config) {
  const lower = text.toLowerCase();
  let winner = null;

  for (const item of config.taxonomy) {
    const hits = item.keywords.reduce(
      (score, keyword) => score + (lower.includes(keyword.toLowerCase()) ? 1 : 0),
      0,
    );
    if (!winner || hits > winner.hits) winner = { item, hits };
  }

  const selected = winner?.hits > 0
    ? winner.item
    : { theme: config.defaultTheme, tags: [] };

  return {
    theme: selected.theme,
    tags: [...new Set([...(selected.tags || []), ...config.requiredTags])].slice(0, 10),
    confidence: winner?.hits > 0 ? Math.min(0.95, 0.45 + winner.hits * 0.1) : 0.35,
  };
}

export function detectTopics(lines, title, max = 5) {
  const bullets = lines
    .filter((line) => /^[-*•]\s+/.test(line))
    .map((line) => line.replace(/^[-*•]\s+/, "").trim())
    .filter((line) => line.length >= 20);

  if (bullets.length >= 3) return bullets.slice(0, max);

  return lines
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .filter((line) => line !== title && line.length >= 45 && line.length <= 180)
    .slice(0, max);
}
