import type { Place } from "./types";

export type DirectionsApp = "kakao" | "naver" | "tmap";

type Origin = { lat: number; lng: number } | null;

/**
 * 길찾기 링크. 앱 스킴을 먼저 열고, 앱이 없으면 웹 길찾기로 넘긴다.
 * 출발지를 모르면 각 앱이 현재 위치를 출발지로 쓴다.
 */
export function directionsLinks(place: Place, origin: Origin) {
  const name = encodeURIComponent(place.name);
  const { lat, lng } = place;
  return {
    kakao: {
      app: origin
        ? `kakaomap://route?sp=${origin.lat},${origin.lng}&ep=${lat},${lng}&by=CAR`
        : `kakaomap://route?ep=${lat},${lng}&by=CAR`,
      web: `https://map.kakao.com/link/to/${name},${lat},${lng}`,
    },
    naver: {
      app: `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${name}&appname=gongmuwon-matjip`,
      web: `https://map.naver.com/p/directions/-/${lng},${lat},${name},,PLACE_POI/-/car`,
    },
    tmap: {
      app: `tmap://route?goalname=${name}&goalx=${lng}&goaly=${lat}`,
      // 티맵은 공개 웹 길찾기가 없어 앱이 없으면 설치 페이지로 보낸다
      web: "https://play.google.com/store/apps/details?id=com.skt.tmap.ku",
    },
  } satisfies Record<DirectionsApp, { app: string; web: string }>;
}

/** 앱 스킴 시도 후 1.5초 안에 페이지가 숨겨지지 않으면 웹 링크로 이동 */
export function openDirections(link: { app: string; web: string }) {
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  if (!isMobile) {
    window.open(link.web, "_blank", "noopener");
    return;
  }
  const timer = window.setTimeout(() => {
    if (!document.hidden) window.location.href = link.web;
  }, 1500);
  document.addEventListener("visibilitychange", () => window.clearTimeout(timer), { once: true });
  window.location.href = link.app;
}
