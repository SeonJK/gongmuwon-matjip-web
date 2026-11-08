"use client";

import { useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/types";
import styles from "./MapApp.module.css";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    kakao: any;
  }
}

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.978 };

type Props = {
  places: Place[];
  selectedId: string | null;
  onSelect: (p: Place) => void;
  focus: { lat: number; lng: number; level?: number; nonce: number } | null;
  myLocation: { lat: number; lng: number } | null;
};

function loadKakao(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps?.LatLng) return resolve(window.kakao);
    const existing = document.getElementById("kakao-sdk") as HTMLScriptElement | null;
    const onReady = () => window.kakao.maps.load(() => resolve(window.kakao));
    if (existing) {
      existing.addEventListener("load", onReady);
      return;
    }
    const s = document.createElement("script");
    s.id = "kakao-sdk";
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false&libraries=clusterer`;
    s.onload = onReady;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function MapView(props: Props) {
  return KAKAO_KEY ? <KakaoMap {...props} /> : <PreviewMap {...props} />;
}

function markerImage(kakao: any, selected: boolean, months: number) {
  const color = selected ? "#ff5a3c" : months >= 7 ? "#1f6fff" : "#4c9aff";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40"><path d="M15 39s13-13.4 13-23.5C28 7.5 22.2 2 15 2S2 7.5 2 15.5C2 25.6 15 39 15 39z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="15" cy="15.5" r="5" fill="#fff"/></svg>`;
  const size = new kakao.maps.Size(30, 40);
  return new kakao.maps.MarkerImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, size, {
    offset: new kakao.maps.Point(15, 39),
  });
}

function KakaoMap({ places, selectedId, onSelect, focus, myLocation }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const clusterer = useRef<any>(null);
  const meMarker = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadKakao().then((kakao) => {
      if (cancelled || !el.current) return;
      map.current = new kakao.maps.Map(el.current, {
        center: new kakao.maps.LatLng(SEOUL_CITY_HALL.lat, SEOUL_CITY_HALL.lng),
        level: 7,
      });
      clusterer.current = new kakao.maps.MarkerClusterer({ map: map.current, averageCenter: true, minLevel: 6 });
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const kakao = window.kakao;
    clusterer.current.clear();
    const markers = places.map((p) => {
      const m = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(p.lat, p.lng),
        image: markerImage(kakao, p.kakao_id === selectedId, p.month_count),
        title: p.name,
        zIndex: p.kakao_id === selectedId ? 10 : 1,
      });
      kakao.maps.event.addListener(m, "click", () => onSelect(p));
      return m;
    });
    clusterer.current.addMarkers(markers);
  }, [ready, places, selectedId, onSelect]);

  useEffect(() => {
    if (!ready || !focus) return;
    const kakao = window.kakao;
    if (focus.level) map.current.setLevel(focus.level);
    map.current.panTo(new kakao.maps.LatLng(focus.lat, focus.lng));
  }, [ready, focus]);

  useEffect(() => {
    if (!ready || !myLocation) return;
    const kakao = window.kakao;
    const pos = new kakao.maps.LatLng(myLocation.lat, myLocation.lng);
    if (!meMarker.current) {
      meMarker.current = new kakao.maps.CustomOverlay({ position: pos, content: `<div class="${styles.meDot}"></div>`, map: map.current });
    } else {
      meMarker.current.setPosition(pos);
    }
  }, [ready, myLocation]);

  return <div ref={el} className={styles.map} />;
}

/** 카카오 키가 없을 때 화면 확인용: 좌표를 단순 투영해서 점으로 찍는다. */
function PreviewMap({ places, selectedId, onSelect }: Props) {
  // 표시 중인 식당이 화면에 고루 퍼지도록 범위를 잡는다 (여백 15%)
  const lats = places.map((p) => p.lat);
  const lngs = places.map((p) => p.lng);
  const pad = (lo: number, hi: number) => {
    const d = Math.max(hi - lo, 0.01) * 0.15;
    return [lo - d, hi + d];
  };
  const [minLat, maxLat] = places.length ? pad(Math.min(...lats), Math.max(...lats)) : [37.43, 37.7];
  const [minLng, maxLng] = places.length ? pad(Math.min(...lngs), Math.max(...lngs)) : [126.76, 127.18];
  const bounds = { minLat, maxLat, minLng, maxLng };
  return (
    <div className={`${styles.map} ${styles.preview}`}>
      <span className={styles.previewNote}>지도 미리보기 (NEXT_PUBLIC_KAKAO_JS_KEY 설정 시 카카오맵 표시)</span>
      {places.map((p) => {
        // 검색바·칩(위)과 플로팅 버튼(오른쪽)을 피해 안쪽 영역에만 찍는다
        const x = 8 + ((p.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 72;
        const y = 25 + (1 - (p.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 60;
        return (
          <button
            key={p.kakao_id}
            className={`${styles.previewPin} ${p.kakao_id === selectedId ? styles.previewPinOn : ""}`}
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={() => onSelect(p)}
            aria-label={p.name}
          >
            <span>{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
