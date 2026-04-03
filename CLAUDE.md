# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

Quon은 GitHub Pages(qrcode.sn0wman.kr)에서 호스팅되는 무료 맞춤형 QR 코드 생성기 웹앱입니다. **빌드 도구, 번들러, 프레임워크 없는 순수 정적 사이트**로, 바닐라 HTML/CSS/JavaScript와 CDN으로 로드하는 qr-code-styling 라이브러리로 구성되어 있습니다.

## 개발 환경

빌드 과정 없음. `index.html`을 브라우저에서 열거나 정적 파일 서버로 실행:

```bash
npx serve .
# 또는
python -m http.server 8000
```

GitHub Pages로 배포 (CNAME 설정 완료). CI/CD 파이프라인 없음.

## 아키텍처

**4개 핵심 파일로 구성된 싱글 페이지 앱:**

| 파일 | 역할 |
|------|------|
| `index.html` | 시맨틱 마크업, 3단 반응형 레이아웃 (입력 \| 미리보기 \| 디자인) |
| `script.js` | 모든 앱 로직 (~2200줄): QR 생성, 유효성 검사, 상태 관리, 히스토리, 프리셋, A/B 테스트 |
| `styles.css` | CSS 커스텀 프로퍼티 기반 스타일링, 다크 테마 (#51A273 에메랄드 그린 포인트), 글래스모피즘 |
| `i18n.js` | 동적 언어 파일 로딩 기반 다국어 시스템 |

**로케일 디렉토리:** `locales/en.js`, `locales/ko.js` — 스크립트로 비동기 로드되는 번역 파일. 각 파일은 전역 변수(예: `window.en`)로 700개 이상의 키-값 쌍을 내보냄.

**QR 타입 시스템:** 6가지 타입 — `url`, `text`, `vcard`, `email`, `tel`, `wifi`. 각 타입은 HTML에 전용 폼 섹션(`#form-url`, `#form-text` 등)이 있으며, `currentType` 전역 변수로 전환. 타입별 유효성 검사와 콘텐츠 포맷팅은 `script.js`에 구현.

**상태 관리:** 런타임 상태는 전역 변수 + localStorage(`quon_` 접두사 키 11개)로 영속화. 모든 localStorage 접근은 용량 초과 대비 try-catch로 감쌈. 주요 상태: 디자인 설정, 임시저장 입력값, 생성 히스토리(최근 5개), 고정 항목(최대 2개), 커스텀 프리셋(3슬롯), 언어 설정.

**디자인 시스템:** 내장 프리셋 6개 + 사용자 저장 커스텀 프리셋 3슬롯. 점 스타일, 모서리 스타일, 색상, 중앙 로고(스케일 조절 가능) 커스터마이징 지원.

**내보내기:** `qrCode.download()`로 PNG/SVG 다운로드, 파일명 형식 `qrcode-[타입]-[타임스탬프].[확장자]`.

## 다국어(i18n) — 새 언어 추가

1. `locales/en.js`를 `locales/[언어코드].js`로 복사
2. 모든 값을 번역 (키는 동일하게 유지)
3. `i18n.js`의 `SUPPORTED_LANGUAGES` 배열에 언어 코드 추가
4. 선택적으로 `detectLanguage()`에 브라우저 감지 로직 추가

DOM 요소는 3가지 데이터 속성 사용: `data-i18n` (textContent), `data-i18n-aria` (aria-label), `data-i18n-title` (title). `t(key)` 함수는 번역값을 반환하며 영어로 폴백.

## 주요 패턴

- **런타임 npm 의존성 없음** — qr-code-styling v1.5.0은 CDN으로 로드
- **이벤트 기반 DOM 업데이트** — 가상 DOM이나 반응성 시스템 없음
- **이중 언어 코드베이스** — README와 UI가 영어/한국어 지원
- **광고 연동** — Google AdSense + 광고 차단 감지(`adblock-detector.js`), 차단 시 우아하게 폴백
- **A/B 테스트** — CTA 버튼 3가지 변형, localStorage로 지표 추적
- **vCard 출력** — RFC 2426 준수, iOS 호환, 비ASCII 문자는 quoted-printable 인코딩
- **Wi-Fi QR** — ISO/IEC 18004:2015 준수, 특수문자 이스케이핑 처리
