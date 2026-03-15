type PlayerFactors = {
  isYoungerThan21: boolean;
  isYoungerThan16: boolean;
  lessThan30SingleGames: boolean;
  lessThan15GamesOverallOrAfterYearBreak: boolean;
};

const DEFAULT_PLAYER_FACTORS: PlayerFactors = {
  isYoungerThan21: false,
  isYoungerThan16: false,
  lessThan30SingleGames: false,
  lessThan15GamesOverallOrAfterYearBreak: false,
};

function isPlayerFactors(value: unknown): value is PlayerFactors {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.isYoungerThan21 === "boolean" &&
    typeof record.isYoungerThan16 === "boolean" &&
    typeof record.lessThan30SingleGames === "boolean" &&
    typeof record.lessThan15GamesOverallOrAfterYearBreak === "boolean"
  );
}

export function loadOwnTtr(): number | null {
  const val = localStorage.getItem("ownTtr");
  if (val === null || val === "") return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

export function saveOwnTtr(value: number | null): void {
  if (value === null) {
    localStorage.removeItem("ownTtr");
  } else {
    localStorage.setItem("ownTtr", String(value));
  }
}

export function loadPlayerFactors(): PlayerFactors {
  const val = localStorage.getItem("playerFactors");
  if (val === null) return { ...DEFAULT_PLAYER_FACTORS };
  try {
    const parsed = JSON.parse(val) as unknown;
    return isPlayerFactors(parsed) ? parsed : { ...DEFAULT_PLAYER_FACTORS };
  } catch {
    return { ...DEFAULT_PLAYER_FACTORS };
  }
}

export function savePlayerFactors(factors: PlayerFactors): void {
  localStorage.setItem("playerFactors", JSON.stringify(factors));
}
