# Quon Android (Native)

Native Android app built with Kotlin + Jetpack Compose.

## Features

- QR types: URL, Text, Contact(vCard), Email, Phone, Wi-Fi
- QR scan support (CameraX + ML Kit, realtime)
- New dark-first mobile design (not WebView / not web app)
- Live QR preview with zoom controls
- Design studio: palette, QR resolution, margin, logo overlay size
- Save generated QR as PNG to gallery

## Open and Run

1. Open `android/` in Android Studio (Ladybug or newer).
2. Let Gradle sync download dependencies.
3. Run app module on device/emulator (Android 10+).

## CLI Build (Stable)

- Git Bash:
  - `./dev-build.sh`
- Windows CMD/PowerShell:
  - `dev-build.cmd`

Both scripts try to pin build JDK to `C:\Program Files\Java\jdk-17`.

You can also run wrapper directly:

- `./gradlew assembleDebug`

## Notes

- `minSdk = 29` for simpler scoped-storage image save flow.
- QR engine uses `com.google.zxing:core`.
- Gradle Wrapper is included (`gradlew`, `gradlew.bat`) so global Gradle is optional.
