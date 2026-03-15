const OWN_TTR_KEY = "ownTtr";

export function saveOwnTtr(ttr: number): void {
  localStorage.setItem(OWN_TTR_KEY, String(ttr));
}

export function loadOwnTtr(): number | null {
  const raw = localStorage.getItem(OWN_TTR_KEY);
  if (raw === null || raw.trim() === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}
