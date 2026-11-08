# gongmuwon-matjip-web

서울 25개 구 업무추진비 집행내역에서 **서로 다른 2개월 이상** 등장한 식당을 보여주는 지도 웹앱입니다. 카카오맵 안드로이드 앱 화면 구성을 참고한 모바일 우선 UI입니다. 데이터 수집은 [gongmuwon-matjip-server](https://github.com/SeonJK/gongmuwon-matjip-server)가 맡습니다.

## 기능

- 상단 검색바: 식당명 검색, 자동추천(초성 검색 지원)
- 음식 종류 칩: 누르면 검색어가 자동 입력되어 필터링
- 마커 클릭 → 바텀시트: 카테고리, 방문 개월 수, 업무추진비 사용 이력, 전화, 카카오맵 링크
- 길찾기: 카카오맵 / 네이버지도 / 티맵 앱으로 바로 열기 (앱 없으면 웹 또는 설치 페이지)
- 플로팅 버튼: 레이어(방문 2회 / 3회 이상 / 전체), 업데이트 리스트(이번 배치 신규 식당, 개수 배지), 즐겨찾기(항상 노출, 로그인 필요), 현위치

## 실행

```bash
cp .env.example .env.local   # 키를 채우지 않으면 샘플 데이터 + 미리보기 지도로 동작
npm install
npm run dev
```

| 변수 | 설명 |
|---|---|
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 카카오 JavaScript 키. 카카오 개발자 콘솔에 사이트 도메인 등록 필요 |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 프로젝트. 스키마는 서버 저장소 `supabase/migrations` |

## 남은 일

- 네이버 로그인: Supabase 기본 제공이 아니라 별도 OAuth 처리 필요
