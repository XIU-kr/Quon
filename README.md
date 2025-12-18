# 🎨 Quon - Free QR Code Generator / 큐온 - 무료 QR 코드 생성기

A free, customizable QR code generator supporting multiple languages.  
다국어를 지원하는 맞춤형 무료 QR 코드 생성기입니다.

Create various types of QR codes easily: URLs, text, contacts, email, phone numbers, locations, Wi-Fi, and more.  
인터넷 URL, 텍스트, 연락처, 이메일, 전화번호, 위치, 와이파이 등 다양한 종류의 QR 코드를 쉽게 만들 수 있습니다.

## 🌐 Website / 웹사이트

**👉 [https://qrcode.sn0wman.kr](https://qrcode.sn0wman.kr) - Use it now! / 바로 사용하세요!**

![Quon](https://img.shields.io/badge/Quon-Free%20QR%20Generator-51A273?style=for-the-badge)
[![License](https://img.shields.io/badge/License-MIT-51A273?style=for-the-badge)](LICENSE)
![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20KO%20%7C%20Extensible-51A273?style=for-the-badge)

## ✨ Key Features / 주요 기능

### 🌍 Multi-language Support / 다국어 지원
- **Modular language system**: Each language in separate file
- **Currently supported**: English (default), Korean (한국어)
- **Browser language detection**: Automatically shows appropriate language
- **Easy to extend**: Just add a new file in `locales/` directory
  - Create `locales/[lang].js` with translations
  - Add language code to `SUPPORTED_LANGUAGES` in `i18n.js`
  - Optionally add detection logic
- **Fallback system**: Missing translations automatically fall back to English

### 📱 Various QR Code Types / 다양한 QR 코드 종류
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

### 💾 Download Options / 다운로드 옵션
- **PNG Format / PNG 형식**: High-resolution image / 고해상도 이미지
- **SVG Format / SVG 형식**: Vector graphics for printing / 인쇄용 벡터 그래픽

### 📢 Ad-Supported Free Service / 광고 지원 무료 서비스
- Website displays ads to keep the service free
- Future mobile app (package: `com.sn0wman.quon`) will offer:
  - Separate ads (not website ads)
  - In-app purchase option to remove all ads
- 웹사이트는 광고를 통해 무료로 제공됩니다
- 향후 모바일 앱(패키지명: `com.sn0wman.quon`)에서는:
  - 웹사이트 광고 대신 별도의 앱 광고 표시
  - 인앱 결제로 모든 광고 제거 가능

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

## 🛠️ Tech Stack / 기술 스택

- **HTML5** - Semantic markup with Geolocation API support / Geolocation API를 지원하는 시맨틱 마크업
- **CSS3** - Modern styling with CSS Grid and Flexbox / CSS Grid와 Flexbox를 활용한 현대적 스타일링
- **Vanilla JavaScript** - No framework dependencies / 프레임워크 의존성 없음
- **Modular i18n System** - Dynamic language loading with separate files / 개별 파일로 동적 언어 로딩
  - Async language file loading / 비동기 언어 파일 로딩
  - Automatic fallback to English / 영어 자동 폴백
  - Easy to add new languages / 새로운 언어 추가 용이
- **[qr-code-styling](https://github.com/kozakdenys/qr-code-styling)** - Advanced QR code generation library with styling support (CDN) / 스타일링을 지원하는 고급 QR 코드 생성 라이브러리 (CDN)
- **Browser Geolocation API** - Built-in location detection without external dependencies / 외부 의존성 없는 내장 위치 감지
- **Kakao Map API** - Address search functionality (via proxy server) / 주소 검색 기능 (프록시 서버 사용)
- **GitHub Pages** - Free hosting / 무료 호스팅

## 🌈 색상 테마

차분한 초록색 팔레트를 사용합니다:
- 주 색상: `#51A273` (에메랄드 그린)
- 호버 색상: `#429960`
- 밝은 배경: `#e8f5ed`

## 📱 Browser Support / 브라우저 지원

- ✅ Chrome (Latest version / 최신 버전)
- ✅ Firefox (Latest version / 최신 버전)
- ✅ Safari (Latest version / 최신 버전)
- ✅ Edge (Latest version / 최신 버전)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile / 모바일 브라우저)

## 🚀 Future Plans / 향후 계획

### Mobile App
- **Package Name**: `com.sn0wman.quon`
- Dedicated mobile experience
- Separate advertising (not website ads)
- In-app purchase to remove all ads
- Multi-language support (English, Korean, and more)

### 모바일 앱
- **패키지명**: `com.sn0wman.quon`
- 모바일 전용 경험 제공
- 웹사이트 광고와 별도의 광고
- 인앱 결제로 모든 광고 제거
- 다국어 지원 (영어, 한국어 및 추가 언어)

## 🌐 Adding a New Language / 새 언어 추가하기

Adding support for a new language is easy! Follow these steps:

1. **Create language file**: Copy `locales/en.js` to `locales/[your-lang-code].js`
   ```bash
   cp locales/en.js locales/fr.js  # Example for French
   ```

2. **Translate the content**: Open your new file and translate all the values
   ```javascript
   const fr = {
       'header.title': '🎨 Quon - Générateur de QR Code Gratuit',
       'header.subtitle': 'Créez des codes QR personnalisés facilement',
       // ... translate all other keys
   };
   ```

3. **Register the language**: Edit `i18n.js` and add your language code to the array
   ```javascript
   const SUPPORTED_LANGUAGES = ['en', 'ko', 'fr'];  // Added 'fr'
   ```

4. **Optional - Add detection**: If you want automatic detection, update `detectLanguage()`
   ```javascript
   if (browserLang.startsWith('fr')) {
       return 'fr';
   }
   ```

That's it! The system will automatically load and use your new language file.

## 🤝 Contributing / 기여하기

Contributions are welcome! You can participate in the following ways:  
기여를 환영합니다! 다음과 같은 방법으로 참여할 수 있습니다:

- Bug reports / 버그 리포트
- Feature suggestions / 새로운 기능 제안
- Pull Request submissions / Pull Request 제출
- Documentation improvements / 문서 개선
- **Translation to other languages** / **다른 언어로 번역** (See above for instructions / 위 지침 참조)

## 📄 License / 라이선스

This project is open source and available under the [MIT License](LICENSE).  
이 프로젝트는 오픈 소스이며 [MIT License](LICENSE)에 따라 제공됩니다.

## 👤 Author / 만든 사람

**sn0wmankr**
- GitHub: [@sn0wmankr](https://github.com/sn0wmankr)
- Project / 프로젝트: [Quon-QRCodeGenerator](https://github.com/sn0wmankr/Quon-QRCodeGenerator)

## 🙏 Acknowledgments / 감사의 말

- [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) - Excellent QR code styling library / 훌륭한 QR 코드 스타일링 라이브러리
- QR Code technology was originally developed by Denso Wave / QR 코드 기술은 Denso Wave에서 최초로 개발되었습니다

## 📊 Project Status / 프로젝트 상태

🟢 Active - This project is actively maintained and contributions are welcome.  
🟢 활성 - 이 프로젝트는 활발히 유지보수되고 있으며 기여를 환영합니다.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/sn0wmankr">sn0wmankr</a>
</div>
