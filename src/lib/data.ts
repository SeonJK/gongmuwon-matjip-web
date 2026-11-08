import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SAMPLE_PLACES, SAMPLE_VISITS } from "./sample";
import type { Place, Visit } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null;
export const usingSample = !supabase;

export async function fetchPlaces(): Promise<Place[]> {
  if (!supabase) return SAMPLE_PLACES;
  const { data, error } = await supabase.from("visible_places").select("*");
  if (error) throw error;
  return data as Place[];
}

/** 가장 최근 배치에서 처음 노출된 식당 (업데이트 리스트) */
export function latestUpdates(places: Place[]): Place[] {
  const latest = Math.max(0, ...places.map((p) => p.visible_batch_id ?? 0));
  return latest ? places.filter((p) => p.visible_batch_id === latest) : [];
}

export async function fetchVisits(kakaoId: string): Promise<Visit[]> {
  if (!supabase) return SAMPLE_VISITS[kakaoId] ?? [];
  const { data, error } = await supabase
    .from("expense_records")
    .select("used_on, user_label, headcount, amount, purpose")
    .eq("kakao_id", kakaoId)
    .order("used_on", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data as Visit[];
}

export async function fetchFavorites(): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("favorites").select("kakao_id");
  if (error) throw error;
  return data.map((r) => r.kakao_id as string);
}

export async function setFavorite(userId: string, kakaoId: string, on: boolean) {
  if (!supabase) return;
  if (on) await supabase.from("favorites").upsert({ user_id: userId, kakao_id: kakaoId });
  else await supabase.from("favorites").delete().eq("user_id", userId).eq("kakao_id", kakaoId);
}

/** 카카오는 Supabase 기본 제공. 네이버는 별도 OAuth 처리가 필요해 아직 미구현. */
export async function signIn(provider: "kakao" | "naver") {
  if (!supabase) {
    alert("Supabase 환경변수를 설정하면 로그인할 수 있어요.");
    return;
  }
  if (provider === "naver") {
    alert("네이버 로그인은 준비 중이에요.");
    return;
  }
  await supabase.auth.signInWithOAuth({ provider: "kakao", options: { redirectTo: window.location.origin } });
}
