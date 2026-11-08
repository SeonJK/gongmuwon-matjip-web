export type Place = {
  kakao_id: string;
  name: string;
  category: string; // 카카오 category_name 예: "음식점 > 한식 > 해장국"
  address: string;
  road_address: string | null;
  phone: string | null;
  lng: number;
  lat: number;
  kakao_url: string;
  month_count: number;
  visit_count: number;
  first_seen: string;
  last_seen: string;
  visible_batch_id: number | null;
};

export type Visit = {
  used_on: string;
  user_label: string | null;
  headcount: number | null;
  amount: number | null;
  purpose: string | null;
};

/** 서로 다른 N개월 이상. 지도 노출 기준이 3개월이라 "3"이 전체. */
export type Layer = "3" | "5" | "7" | "10";
