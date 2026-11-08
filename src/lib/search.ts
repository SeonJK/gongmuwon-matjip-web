import type { Layer, Place } from "./types";

const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

/** "해장국" → "ㅎㅈㄱ". 한글이 아닌 글자는 그대로 둔다. */
export function toChoseong(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const code = ch.charCodeAt(0) - 0xac00;
      if (code < 0 || code > 11171) return ch;
      return CHO[Math.floor(code / 588)];
    })
    .join("");
}

const isAllChoseong = (q: string) => /^[ㄱ-ㅎ]+$/.test(q);
const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

export function matchesQuery(place: Place, query: string): boolean {
  const q = norm(query);
  if (!q) return true;
  const name = norm(place.name);
  if (isAllChoseong(q)) return toChoseong(name).includes(q);
  return name.includes(q) || norm(place.category).includes(q);
}

/** 자동완성: 이름이 검색어로 시작하는 곳을 먼저, 그다음 포함하는 곳. */
export function suggest(places: Place[], query: string, limit = 8): Place[] {
  const q = norm(query);
  if (!q) return [];
  const scored = places
    .filter((p) => matchesQuery(p, q))
    .map((p) => {
      const n = norm(p.name);
      const target = isAllChoseong(q) ? toChoseong(n) : n;
      return { p, score: target.startsWith(q) ? 0 : target.includes(q) ? 1 : 2 };
    })
    .sort((a, b) => a.score - b.score || b.p.month_count - a.p.month_count);
  return scored.slice(0, limit).map((s) => s.p);
}

export function matchesLayer(place: Place, layer: Layer): boolean {
  return place.month_count >= Number(layer);
}

/** 칩: label은 화면 표시, query는 검색창에 자동 입력되는 값 */
export const CATEGORY_CHIPS = [
  { label: "한식", query: "한식" },
  { label: "중식", query: "중식" },
  { label: "일식", query: "일식" },
  { label: "양식", query: "양식" },
  { label: "고기", query: "육류" },
  { label: "국밥·해장국", query: "해장국" },
  { label: "해물", query: "해물" },
  { label: "분식", query: "분식" },
  { label: "아시아", query: "아시아음식" },
] as const;
