# 🎨 QR 코드 만들기

한국어로 제공되는 맞춤형 무료 QR 코드 생성기입니다. 
인터넷 URL, 텍스트, 연락처, 이메일, 전화번호, 위치, 와이파이 등 다양한 종류의 QR 코드를 쉽게 만들 수 있습니다.

## 🌐 웹사이트

**👉 [https://qrcode.sn0wman.kr](https://qrcode.sn0wman.kr) 에서 바로 사용하세요!**

![QR Code Generator](https://img.shields.io/badge/QR%20Code-Generator-51A273?style=for-the-badge)
[![License](https://img.shields.io/badge/License-MIT-51A273?style=for-the-badge)](LICENSE)

## ✨ 주요 기능

### 📱 다양한 QR 코드 종류
- **인터넷 URL** - 웹사이트 링크
- **텍스트** - 일반 텍스트 내용
- **연락처** - 이름, 전화번호, 이메일, 주소 등 (iOS 호환 형식)
- **이메일** - 받는 사람, 제목, 내용이 미리 입력된 이메일
- **전화** - 전화 걸기 링크 (한국 전화번호 형식 지원: 01012345678)
- **위치** - GPS 좌표 (카카오맵 주소 검색 지원)
- **와이파이** - 무선 네트워크 접속 정보 (iOS 호환 형식)

### 🎨 디자인 꾸미기
- **점 모양**: 둥근 사각형, 원형, 세련된, 세련된 둥근형, 사각형, 매우 둥근
- **모서리 스타일**: 모서리 사각형과 점을 독립적으로 커스터마이징
- **색상 옵션**: 코드 색상과 배경 색상을 자유롭게 선택
- **로고 추가**: QR 코드 중앙에 로고 이미지 삽입 가능

### 💾 다운로드 옵션
- **PNG 형식**: 고해상도 이미지
- **SVG 형식**: 인쇄용 벡터 그래픽

## 🚀 빠른 시작

### 로컬 개발
1. 저장소 복제:
   ```bash
   git clone https://github.com/sn0wmankr/QRCodeGenerator-KR.git
   cd QRCodeGenerator-KR
   ```

2. 웹 브라우저에서 `index.html` 열기:
   ```bash
   # Python 사용
   python -m http.server 8000
   
   # Node.js 사용
   npx http-server
   
   # 또는 파일 직접 열기
   open index.html
   ```

3. QR 코드 만들기 시작!

## 🎯 사용 방법

### QR 코드 만들기

1. **코드 종류 선택**
   - 7가지 종류 버튼 중 하나를 클릭 (인터넷 주소, 문자, 연락처 등)

2. **내용 입력**
   - 선택한 종류에 맞는 필수 항목 입력
   - 모든 입력 항목은 자동으로 검증 및 형식화됨
   - **위치** 타입: 주소 검색, 좌표 직접 입력, 또는 "현재 내 위치 사용" 버튼 사용
   - **연락처** 타입: 전화번호는 01012345678 형식으로 입력, 주소는 검색 또는 직접 입력

3. **디자인 꾸미기** (선택사항)
   - 점 모양, 모서리 스타일, 색상 선택
   - 로고 이미지를 업로드하여 중앙에 배치
   - 미리보기에서 실시간 확인

4. **생성**
   - "QR 코드 만들기" 버튼 클릭
   - 미리보기 패널에 QR 코드 표시됨

5. **다운로드**
   - "PNG 다운로드" 또는 "SVG 다운로드" 버튼으로 저장

## 🛠️ 기술 스택

- **HTML5** - Geolocation API를 지원하는 시맨틱 마크업
- **CSS3** - CSS Grid와 Flexbox를 활용한 현대적 스타일링
- **Vanilla JavaScript** - 프레임워크 의존성 없음
- **[qr-code-styling](https://github.com/kozakdenys/qr-code-styling)** - 스타일링을 지원하는 고급 QR 코드 생성 라이브러리 (CDN)
- **브라우저 Geolocation API** - 외부 의존성 없는 내장 위치 감지
- **카카오맵 API** - 주소 검색 기능 (프록시 서버 사용)
- **GitHub Pages** - 무료 호스팅

## 🌈 색상 테마

차분한 초록색 팔레트를 사용합니다:
- 주 색상: `#51A273` (에메랄드 그린)
- 호버 색상: `#429960`
- 밝은 배경: `#e8f5ed`

## 📱 브라우저 지원

- ✅ Chrome (최신 버전)
- ✅ Firefox (최신 버전)
- ✅ Safari (최신 버전)
- ✅ Edge (최신 버전)
- ✅ 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 🤝 기여하기

기여를 환영합니다! 다음과 같은 방법으로 참여할 수 있습니다:
- 버그 리포트
- 새로운 기능 제안
- Pull Request 제출
- 문서 개선

## 📄 라이선스

이 프로젝트는 오픈 소스이며 [MIT License](LICENSE)에 따라 제공됩니다.

## 👤 만든 사람

**sn0wmankr**
- GitHub: [@sn0wmankr](https://github.com/sn0wmankr)
- 프로젝트: [QRCodeGenerator-KR](https://github.com/sn0wmankr/QRCodeGenerator-KR)

## 🙏 감사의 말

- [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) - 훌륭한 QR 코드 스타일링 라이브러리
- QR 코드 기술은 Denso Wave에서 최초로 개발되었습니다

## 📊 프로젝트 상태

🟢 활성 - 이 프로젝트는 활발히 유지보수되고 있으며 기여를 환영합니다.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/sn0wmankr">sn0wmankr</a>
</div>
