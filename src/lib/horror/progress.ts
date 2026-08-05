const KEY = "horror.progress.v1";

export type Progress = Record<string, { endings: string[]; runs: number }>;

export function readProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Progress;
  } catch {
    return {};
  }
}

export function recordEnding(slug: string, endingId: string) {
  if (typeof window === "undefined") return;
  const all = readProgress();
  const entry = all[slug] ?? { endings: [], runs: 0 };
  if (!entry.endings.includes(endingId)) entry.endings.push(endingId);
  entry.runs += 1;
  all[slug] = entry;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage full or blocked */
  }
}

const NICK_KEY = "horror.nickname";

export function readNickname() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(NICK_KEY) ?? "";
}

export function writeNickname(n: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NICK_KEY, n);
  } catch {
    /* noop */
  }
}
