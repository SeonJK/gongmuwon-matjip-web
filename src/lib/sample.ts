import type { Place, Visit } from "./types";

// Supabase 연결 전 화면 확인용 샘플. 가게 이름과 위치는 모두 가상이다.
const base = { road_address: null, phone: "02-000-0000", kakao_url: "https://map.kakao.com", first_seen: "2025-12-01" };

export const SAMPLE_PLACES: Place[] = [
  { ...base, kakao_id: "s1", name: "샘플해장국 여의도점", category: "음식점 > 한식 > 해장국", address: "서울 영등포구 여의도동", lng: 126.9245, lat: 37.5219, month_count: 4, visit_count: 7, last_seen: "2026-10-14", visible_batch_id: 3 },
  { ...base, kakao_id: "s2", name: "가상반점", category: "음식점 > 중식 > 중국요리", address: "서울 영등포구 여의도동", lng: 126.9282, lat: 37.5248, month_count: 3, visit_count: 3, last_seen: "2026-10-12", visible_batch_id: 7 },
  { ...base, kakao_id: "s3", name: "예시한우", category: "음식점 > 한식 > 육류,고기 > 소고기구이", address: "서울 영등포구 당산동", lng: 126.9021, lat: 37.5262, month_count: 3, visit_count: 5, last_seen: "2026-09-30", visible_batch_id: 5 },
  { ...base, kakao_id: "s4", name: "테스트스시", category: "음식점 > 일식 > 초밥,롤", address: "서울 종로구 세종로", lng: 126.9769, lat: 37.5717, month_count: 3, visit_count: 3, last_seen: "2026-10-21", visible_batch_id: 7 },
  { ...base, kakao_id: "s5", name: "모의국밥", category: "음식점 > 한식 > 국밥", address: "서울 종로구 청진동", lng: 126.9812, lat: 37.5706, month_count: 5, visit_count: 9, last_seen: "2026-10-28", visible_batch_id: 2 },
  { ...base, kakao_id: "s6", name: "데모파스타", category: "음식점 > 양식 > 이탈리안", address: "서울 중구 정동", lng: 126.9735, lat: 37.5659, month_count: 3, visit_count: 3, last_seen: "2026-10-20", visible_batch_id: 7 },
];

export const SAMPLE_VISITS: Record<string, Visit[]> = {
  s1: [
    { used_on: "2026-10-14", user_label: "일자리경제과", headcount: 6, amount: 84000, purpose: "간담회비" },
    { used_on: "2026-08-08", user_label: "재무과장", headcount: 4, amount: 52000, purpose: "관계자 업무 협의" },
  ],
};
