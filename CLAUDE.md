# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트

Quon은 GitHub Pages(**quon.xiu.kr**)로 호스팅되는 무료 맞춤형 QR 코드 생성기입니다. **빌드 도구, 번들러, 프레임워크 없는 순수 정적 사이트**로, 바닐라 HTML/CSS/JS와 CDN으로 로드하는 `qr-code-styling` v1.5.0 라이브러리로 동작합니다.

## 개발

빌드 과정 없음. 정적 파일 서버로 실행:

```bash
npx serve .
# 또는
python -m http.server 8000
```

CI, 테스트, 린터 없음. `main` 브랜치 커밋이 GitHub Pages로 자동 배포됩니다. 커스텀 도메인은 GitHub 레포 설정에서 관리 (in-tree `CNAME` 파일 없음).

## 아키텍처

앱 전체는 4개 핵심 파일로 구성:

| 파일 | 역할 |
|---|---|
| `index.html` | 시맨틱 마크업. 왼쪽 패널은 **탭 인터페이스**(Content / Design / History / Presets) — 다단 레이아웃이 아님. |
| `script.js` | ~1850줄. QR 생성, 유효성 검사, 상태 관리, 히스토리/핀, 커스텀 프리셋. |
| `styles.css` | CSS 커스텀 프로퍼티, **Obsidian Emerald** 다크 테마(`--accent: #1aad6c`), 글래스모피즘, 앳머스피어 글로우 레이어. |
| `i18n.js` + `locales/{en,ko}.js` | 비동기 언어 로더. 각 로케일 파일은 전역 변수로 노출(예: `window.en`). |

`adblock-detector.js`는 광고 차단기를 감지해서 빈 광고 슬롯 대신 현지화된 우아한 프롬프트를 표시합니다.

### QR 타입 시스템

6가지 타입이 하나의 코드 경로를 공유: `url`, `text`, `vcard`, `email`, `tel`, `wifi`. 각 타입은 HTML에 전용 `#form-<타입>` 섹션을 가지며, `currentType` 전역 변수로 활성 폼을 전환합니다. 타입별 콘텐츠 포맷팅과 유효성 검사는 `script.js`에 구현.

- **vCard**: RFC 2426 준수, iOS 호환. 비ASCII 문자는 quoted-printable 인코딩.
- **Wi-Fi**: ISO/IEC 18004 Annex F 문법, 특수문자 이스케이핑 처리.

### 상태 + 영속화

런타임 상태는 단순 전역 변수. 영속화는 `quon_` 접두사를 붙인 localStorage 사용. 쿼터 초과가 예상되므로 모든 읽기/쓰기는 try/catch로 감쌈. 현재 사용 중인 키:

```
quon_design_panel_state   quon_recent_settings   quon_draft_inputs
quon_generation_history   quon_history_pins      quon_custom_presets
quon_history_view         quon_last_preset       quon_language
```

히스토리는 최근 5개 생성 이력을 유지하며, 고정 슬롯 2개 지원. 커스텀 프리셋은 내장 디자인 프리셋 6개 외에 사용자 슬롯 3개 제공.

### 내보내기

`qrCode.download()`로 PNG/SVG 내보내기. 파일명 형식: `qrcode-<타입>-<타임스탬프>.<확장자>`.

## i18n — 새 언어 추가

1. `locales/en.js`를 `locales/<코드>.js`로 복사 후 값만 번역 (키는 동일하게 유지).
2. `i18n.js`의 `SUPPORTED_LANGUAGES`에 코드 추가.
3. 필요 시 `detectLanguage()`에 브라우저 매핑 로직 추가.

DOM 요소는 3가지 데이터 속성으로 i18n에 참여: `data-i18n`(textContent), `data-i18n-aria`(aria-label), `data-i18n-title`(title). `t(key)`는 번역값을 반환하며, 누락 시 영어로 폴백.

## 규칙

- **런타임 npm 의존성 금지.** 외부 코드는 CDN으로만 로드하며, 번들러 도입 금지.
- **이벤트 기반 DOM 업데이트.** 가상 DOM이나 반응성 시스템 없음 — DOM을 직접 조작하고 해당 `render*` 함수를 호출.
- **UI는 이중 언어, 코드는 영어.** 모든 식별자, 주석, 커밋 메시지는 영어. 사용자 노출 문구는 `locales/*.js`에만 존재.
- **Google AdSense + gtag.js**는 `index.html`에 연결되어 있음. 광고 차단 폴백은 `adblock-detector.js`가 담당.
- **SEO 에셋**(`robots.txt`, `sitemap.xml`, `og-image.png`, 아이콘 PNG들, `<head>` 내 JSON-LD)은 `https://quon.xiu.kr/`를 참조. 도메인이 바뀌면 이것들을 함께 업데이트해야 함.

## 과거에 존재했던 것들 (재추가 금지)

다음 기능들은 의도적으로 제거되었으며, 새로운 요구사항 없이 재구현하지 말 것:

- **스캔 품질 체커** (`evaluateScanQuality`, `quality.*` i18n 키, `#quality-check` DOM)
- **프리셋 마켓플레이스** (`renderPresetMarket`, `.preset-market-*` 스타일)
- **CTA A/B 테스트** (`ctaVariant`, `trackCtaMetric`, `hero.cta.primary.variant*`)
- **"예시 자동 입력" 버튼** (`fillExampleContent`, `button.fill.example`)
