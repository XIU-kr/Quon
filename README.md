# Quon

무료 맞춤형 QR 코드 생성기 — [quon.xiu.kr](https://quon.xiu.kr)

빌드 도구 없는 바닐라 HTML/CSS/JS 정적 사이트. QR 렌더링은 [qr-code-styling](https://github.com/kozakdenys/qr-code-styling)(CDN)을 사용합니다.

## 기능

- 6가지 QR 타입: URL, 텍스트, vCard, 이메일, 전화, Wi-Fi
- 디자인 프리셋 + 커스텀 프리셋(3 슬롯) + 로고 삽입
- PNG / SVG 내보내기
- 생성 히스토리(최근 5개) + 고정(2개)
- 다국어(en, ko) — `locales/*.js`, `i18n.js` 참고
- 다크 에메랄드 테마 (Obsidian Emerald, `--accent: #1aad6c`)

## 개발

```bash
npx serve .        # 또는: python -m http.server 8000
```

빌드 과정 없음. `main` 브랜치에 푸시하면 GitHub Pages로 자동 배포.
커스텀 도메인은 레포 설정에서 관리 (in-tree `CNAME` 없음).

## 파일 구조

| 파일 | 역할 |
|---|---|
| `index.html` | 마크업 · 탭 UI(Create/Design/Export/History) · `<head>` SEO 메타 + JSON-LD 3블록 |
| `script.js` | 앱 로직 (QR 생성, 상태, 히스토리, 프리셋) |
| `styles.css` | Obsidian Emerald 다크 테마, 글래스모피즘, 앳머스피어 글로우 |
| `i18n.js` + `locales/` | 비동기 로드 i18n (en, ko) |
| `adblock-detector.js` | 광고 차단 감지 & 폴백 프롬프트 |
| `404.html` | 브랜드 404 페이지 (GitHub Pages 자동 사용) |
| `og-image.png`, `icon-*.png`, `apple-touch-icon.png`, `quon.webp` | 브랜드/소셜 에셋 |
| `robots.txt`, `sitemap.xml` | 크롤러 힌트 |

## SEO / 크롤러

- JSON-LD: `WebApplication` + `FAQPage`(6 Q&A) + `HowTo`(4단계)
- `hreflang` en/ko/x-default, Open Graph, Twitter Card, canonical
- `<main>` 내부 `.sr-only` 섹션에 H1 + 한/영 인트로 (시각적 숨김, 크롤러/스크린 리더용)
- `<noscript>` 폴백 블록
- 네이버 서치어드바이저 소유권 태그 포함

## 배포 후 할 일

- [Google Search Console](https://search.google.com/search-console) 소유 확인 + sitemap 제출
- [네이버 서치어드바이저](https://searchadvisor.naver.com/) 소유 확인 + sitemap 제출
- [Rich Results Test](https://search.google.com/test/rich-results)로 JSON-LD 3종 검증
