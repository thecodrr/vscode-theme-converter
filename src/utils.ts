export function matchScope(scopes: string | string[], matchText: string) {
  const arrayScopes = typeof scopes === "string" ? [scopes] : scopes;
  const isWildcard = matchText.includes(".*");
  const exceptWildcard = isWildcard ? matchText.split(".*")[0] : matchText;
  for (const scope of arrayScopes || []) {
    if (scope === matchText || scope === exceptWildcard) return true;
  }
}
