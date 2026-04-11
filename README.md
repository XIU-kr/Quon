# Quon

무료 맞춤형 QR 코드 생성기 — [quon.xiu.kr](https://quon.xiu.kr)

빌드 도구 없는 바닐라 HTML/CSS/JS 정적 사이트. QR 렌더링은 [qr-code-styling](https://github.com/kozakdenys/qr-code-styling)(CDN)을 사용합니다.

## 기능

- 6가지 QR 타입: URL, 텍스트, vCard, 이메일, 전화, Wi-Fi
- 디자인 프리셋 + 커스텀 프리셋(3 슬롯) + 로고 삽입
- PNG / SVG 내보내기
- 생성 히스토리(최근 5개) + 고정(2개)
- 다국어(en, ko) — `locales/*.js`, `i18n.js` 참고

## 개발

```bash
npx serve .        # 또는: python -m http.server 8000
```

GitHub Pages로 배포 (CNAME → quon.xiu.kr).

## 파일 구조

| 파일 | 역할 |
|---|---|
| `index.html` | 마크업 |
| `script.js` | 앱 로직 (QR 생성, 상태, 히스토리, 프리셋) |
| `styles.css` | 다크 에메랄드 테마 |
| `i18n.js` + `locales/` | 번역 |
| `adblock-detector.js` | 광고 차단 폴백 프롬프트 |
