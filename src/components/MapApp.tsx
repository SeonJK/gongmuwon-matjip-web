"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { fetchFavorites, fetchPlaces, fetchVisits, latestUpdates, setFavorite, signIn, supabase, usingSample } from "@/lib/data";
import { directionsLinks, openDirections } from "@/lib/directions";
import { CATEGORY_CHIPS, matchesLayer, matchesQuery, suggest } from "@/lib/search";
import type { Layer, Place, Visit } from "@/lib/types";
import MapView from "./MapView";
import { BellIcon, CloseIcon, LayersIcon, LocateIcon, MenuIcon, PhoneIcon, RouteIcon, SearchIcon, StarIcon } from "./icons";
import styles from "./MapApp.module.css";

type Sheet = { kind: "place"; place: Place } | { kind: "updates" } | { kind: "favorites" } | { kind: "login" } | null;

const LAYER_LABEL: Record<Layer, string> = { "3": "3개월 이상", "5": "5개월 이상", "7": "7개월 이상", "10": "10개월 이상" };
const shortCategory = (c: string) => c.split(">").map((s) => s.trim()).filter(Boolean).slice(-1)[0] ?? c;
const won = (n: number | null) => (n == null ? "-" : `${n.toLocaleString("ko-KR")}원`);

export default function MapApp() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [query, setQuery] = useState("");
  const [typing, setTyping] = useState(false);
  const [layer, setLayer] = useState<Layer>("3");
  const [layerOpen, setLayerOpen] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; level?: number; nonce: number } | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPlaces().then(setPlaces).catch(console.error);
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session) setFavorites(new Set());
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) fetchFavorites().then((ids) => setFavorites(new Set(ids)));
  }, [user]);

  const visible = useMemo(
    () => places.filter((p) => matchesLayer(p, layer) && matchesQuery(p, query)),
    [places, layer, query],
  );
  const suggestions = useMemo(() => (typing ? suggest(places, query) : []), [typing, places, query]);
  const updates = useMemo(() => latestUpdates(places), [places]);
  const selectedId = sheet?.kind === "place" ? sheet.place.kakao_id : null;

  const openPlace = useCallback((p: Place) => {
    setSheet({ kind: "place", place: p });
    setFocus({ lat: p.lat, lng: p.lng, nonce: Date.now() });
    setTyping(false);
    setLayerOpen(false);
  }, []);

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setMyLocation(loc);
        setFocus({ ...loc, level: 4, nonce: Date.now() });
      },
      () => alert("위치 권한을 허용해 주세요."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const toggleFavorite = async (p: Place) => {
    if (!user) return setSheet({ kind: "login" });
    const on = !favorites.has(p.kakao_id);
    const next = new Set(favorites);
    if (on) next.add(p.kakao_id);
    else next.delete(p.kakao_id);
    setFavorites(next);
    await setFavorite(user.id, p.kakao_id, on);
  };

  const activeChip = CATEGORY_CHIPS.find((c) => c.query === query)?.query;

  return (
    <main className={styles.app}>
      <MapView places={visible} selectedId={selectedId} onSelect={openPlace} focus={focus} myLocation={myLocation} />

      {/* 상단: 검색바 + 칩 */}
      <header className={styles.top}>
        <div className={styles.searchBar}>
          <button className={styles.iconBtn} aria-label="메뉴" onClick={() => setSheet(user ? { kind: "favorites" } : { kind: "login" })}>
            <MenuIcon />
          </button>
          <input
            className={styles.searchInput}
            placeholder="공무원 단골 식당 검색"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setTyping(true);
            }}
            onFocus={() => setTyping(true)}
            onKeyDown={(e) => e.key === "Enter" && setTyping(false)}
          />
          {query ? (
            <button className={styles.iconBtn} aria-label="지우기" onClick={() => setQuery("")}>
              <CloseIcon size={18} />
            </button>
          ) : (
            <span className={styles.iconBtn} aria-hidden>
              <SearchIcon />
            </span>
          )}
        </div>

        {suggestions.length > 0 && (
          <ul className={styles.suggest} role="listbox">
            {suggestions.map((p) => (
              <li key={p.kakao_id}>
                <button onClick={() => openPlace(p)}>
                  <SearchIcon size={16} />
                  <span className={styles.suggestName}>{p.name}</span>
                  <span className={styles.suggestMeta}>{shortCategory(p.category)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <nav className={styles.chips} aria-label="음식 종류">
          {CATEGORY_CHIPS.map((c) => (
            <button
              key={c.label}
              className={`${styles.chip} ${activeChip === c.query ? styles.chipOn : ""}`}
              onClick={() => {
                setQuery(activeChip === c.query ? "" : c.query);
                setTyping(false);
              }}
            >
              {c.label}
            </button>
          ))}
        </nav>
        {usingSample && <p className={styles.sampleBadge}>샘플 데이터로 보는 중</p>}
      </header>

      {/* 우측 플로팅 버튼 */}
      <div className={`${styles.fabs} ${sheet ? styles.fabsRaised : ""}`}>
        {layerOpen && (
          <div className={styles.layerMenu} role="menu">
            {(Object.keys(LAYER_LABEL) as Layer[]).map((l) => (
              <button key={l} className={layer === l ? styles.layerOn : ""} onClick={() => { setLayer(l); setLayerOpen(false); }}>
                방문 {LAYER_LABEL[l]}
              </button>
            ))}
          </div>
        )}
        <button className={styles.fab} aria-label="레이어" onClick={() => setLayerOpen((v) => !v)}>
          <LayersIcon />
          {layer !== "3" && <span className={styles.fabLabel}>{LAYER_LABEL[layer]}</span>}
        </button>
        <button className={styles.fab} aria-label="업데이트된 식당" onClick={() => setSheet({ kind: "updates" })}>
          <BellIcon />
          {updates.length > 0 && <span className={styles.badge}>{updates.length}</span>}
        </button>
        <button className={`${styles.fab} ${styles.fabStar}`} aria-label="즐겨찾기" onClick={() => setSheet(user ? { kind: "favorites" } : { kind: "login" })}>
          <StarIcon filled={favorites.size > 0} />
        </button>
        <button className={styles.fab} aria-label="현위치" onClick={locate}>
          <LocateIcon />
        </button>
      </div>

      {sheet && (
        <BottomSheet onClose={() => setSheet(null)}>
          {sheet.kind === "place" && (
            <PlaceDetail key={sheet.place.kakao_id} place={sheet.place} favorite={favorites.has(sheet.place.kakao_id)} onFavorite={() => toggleFavorite(sheet.place)} myLocation={myLocation} />
          )}
          {sheet.kind === "updates" && (
            <PlaceList title="이번 주 새로 올라온 식당" empty="이번 배치에서 새로 추가된 식당이 없어요." places={updates} onPick={openPlace} />
          )}
          {sheet.kind === "favorites" && (
            <PlaceList title="즐겨찾기" empty="별표를 눌러 식당을 저장해 보세요." places={places.filter((p) => favorites.has(p.kakao_id))} onPick={openPlace} />
          )}
          {sheet.kind === "login" && <Login />}
        </BottomSheet>
      )}
    </main>
  );
}

function BottomSheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);
  return (
    <section
      className={`${styles.sheet} ${expanded ? styles.sheetFull : ""}`}
      onTouchStart={(e) => setStartY(e.touches[0].clientY)}
      onTouchEnd={(e) => {
        if (startY == null) return;
        const dy = e.changedTouches[0].clientY - startY;
        if (dy < -40) setExpanded(true);
        else if (dy > 60) {
          if (expanded) setExpanded(false);
          else onClose();
        }
        setStartY(null);
      }}
    >
      <button className={styles.handle} aria-label={expanded ? "접기" : "펼치기"} onClick={() => setExpanded((v) => !v)} />
      <button className={styles.sheetClose} aria-label="닫기" onClick={onClose}>
        <CloseIcon size={18} />
      </button>
      <div className={styles.sheetBody}>{children}</div>
    </section>
  );
}

function PlaceDetail({ place, favorite, onFavorite, myLocation }: { place: Place; favorite: boolean; onFavorite: () => void; myLocation: { lat: number; lng: number } | null }) {
  const [visits, setVisits] = useState<Visit[] | null>(null);
  useEffect(() => {
    fetchVisits(place.kakao_id).then(setVisits).catch(() => setVisits([]));
  }, [place.kakao_id]);
  const links = directionsLinks(place, myLocation);

  return (
    <div>
      <div className={styles.placeHead}>
        <div>
          <h2 className={styles.placeName}>{place.name}</h2>
          <p className={styles.placeCat}>{shortCategory(place.category)}</p>
        </div>
        <button className={`${styles.starBtn} ${favorite ? styles.starOn : ""}`} aria-label="즐겨찾기" onClick={onFavorite}>
          <StarIcon filled={favorite} />
        </button>
      </div>
      <p className={styles.stat}>
        <strong>{place.month_count}개월</strong> · 총 {place.visit_count}회 방문 · 최근 {place.last_seen}
      </p>
      <p className={styles.addr}>{place.road_address ?? place.address}</p>

      <div className={styles.actions}>
        {place.phone && (
          <a className={styles.action} href={`tel:${place.phone}`}>
            <PhoneIcon size={18} />전화
          </a>
        )}
        <a className={styles.action} href={place.kakao_url} target="_blank" rel="noopener">
          카카오맵에서 보기
        </a>
      </div>

      <h3 className={styles.subhead}>
        <RouteIcon size={16} /> 길찾기
      </h3>
      <div className={styles.routeRow}>
        <button className={`${styles.routeBtn} ${styles.kakao}`} onClick={() => openDirections(links.kakao)}>카카오맵</button>
        <button className={`${styles.routeBtn} ${styles.naver}`} onClick={() => openDirections(links.naver)}>네이버지도</button>
        <button className={`${styles.routeBtn} ${styles.tmap}`} onClick={() => openDirections(links.tmap)}>티맵</button>
      </div>

      <h3 className={styles.subhead}>업무추진비 사용 이력</h3>
      {visits === null ? (
        <p className={styles.muted}>불러오는 중…</p>
      ) : visits.length === 0 ? (
        <p className={styles.muted}>표시할 이력이 없어요.</p>
      ) : (
        <ul className={styles.visits}>
          {visits.map((v, i) => (
            <li key={i}>
              <span className={styles.visitDate}>{v.used_on}</span>
              <span className={styles.visitWho}>{v.user_label ?? "-"} · {v.headcount ?? "-"}명</span>
              <span className={styles.visitAmt}>{won(v.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PlaceList({ title, empty, places, onPick }: { title: string; empty: string; places: Place[]; onPick: (p: Place) => void }) {
  return (
    <div>
      <h2 className={styles.listTitle}>{title} <span>{places.length}</span></h2>
      {places.length === 0 ? (
        <p className={styles.muted}>{empty}</p>
      ) : (
        <ul className={styles.list}>
          {places.map((p) => (
            <li key={p.kakao_id}>
              <button onClick={() => onPick(p)}>
                <span className={styles.listName}>{p.name}</span>
                <span className={styles.listMeta}>{shortCategory(p.category)} · {p.month_count}개월 · {p.address}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Login() {
  return (
    <div className={styles.login}>
      <h2 className={styles.listTitle}>로그인하고 즐겨찾기 쓰기</h2>
      <button className={`${styles.loginBtn} ${styles.loginKakao}`} onClick={() => signIn("kakao")}>카카오로 시작하기</button>
      <button className={`${styles.loginBtn} ${styles.loginNaver}`} onClick={() => signIn("naver")}>네이버로 시작하기</button>
    </div>
  );
}
