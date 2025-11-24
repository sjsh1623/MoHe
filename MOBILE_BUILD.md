# 모바일 앱 빌드 및 실행 가이드

이 가이드는 Mohe React 앱을 iOS/Android 네이티브 앱으로 빌드하고 시뮬레이터/에뮬레이터에서 실행하는 방법을 설명합니다.

## 목차
- [사전 요구사항](#사전-요구사항)
- [iOS 앱 빌드 및 실행](#ios-앱-빌드-및-실행)
- [Android 앱 빌드 및 실행](#android-앱-빌드-및-실행)
- [문제 해결](#문제-해결)

## 사전 요구사항

### iOS 개발 환경

1. **macOS** (iOS 개발은 macOS에서만 가능)

2. **Xcode 설치**
   ```bash
   # App Store에서 Xcode 설치 후
   xcode-select --install
   ```

3. **CocoaPods 설치**
   ```bash
   sudo gem install cocoapods
   ```

4. **CocoaPods 확인**
   ```bash
   pod --version
   ```

### Android 개발 환경

1. **Java Development Kit (JDK) 설치**
   ```bash
   # Homebrew 사용
   brew install openjdk@17

   # 환경 변수 설정
   echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. **Android Studio 설치**
   - https://developer.android.com/studio 에서 다운로드
   - 설치 후 Android Studio를 열고 SDK 설정 완료

3. **Android SDK 환경 변수 설정**
   ```bash
   # ~/.zshrc 또는 ~/.bash_profile에 추가
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin

   # 설정 적용
   source ~/.zshrc
   ```

## iOS 앱 빌드 및 실행

### 1단계: 프로젝트 빌드 및 동기화

```bash
# 웹 앱 빌드 + Capacitor 동기화
npm run cap:build
```

### 2단계: CocoaPods 의존성 설치 (첫 실행 시만)

```bash
cd ios/App
pod install
cd ../..
```

### 3단계: Xcode에서 프로젝트 열기

```bash
npm run cap:ios
```

또는 직접 Xcode에서 열기:
```bash
open ios/App/App.xcworkspace
```

⚠️ **중요**: `App.xcodeproj`가 아닌 `App.xcworkspace`를 열어야 합니다!

### 4단계: Xcode에서 실행

1. Xcode가 열리면 상단 툴바에서 시뮬레이터 선택
   - 예: iPhone 15 Pro, iPhone 14, iPad Pro 등

2. **Product > Run** 메뉴 클릭 (또는 `Cmd + R`)

3. 시뮬레이터가 자동으로 실행되고 앱이 설치됩니다

### 5단계: 시뮬레이터 단축키

- **회전**: `Cmd + 왼쪽/오른쪽 화살표`
- **홈 버튼**: `Cmd + Shift + H`
- **잠금**: `Cmd + L`
- **스크린샷**: `Cmd + S`

### 명령줄에서 iOS 시뮬레이터 직접 실행 (고급)

```bash
# 사용 가능한 시뮬레이터 목록 확인
xcrun simctl list devices

# 특정 시뮬레이터 부팅
xcrun simctl boot "iPhone 15 Pro"

# 시뮬레이터 앱 열기
open -a Simulator

# 앱 설치 및 실행
xcrun simctl install booted ios/App/build/Debug-iphonesimulator/App.app
xcrun simctl launch booted com.mohe.app
```

## Android 앱 빌드 및 실행

### 1단계: 프로젝트 빌드 및 동기화

```bash
# 웹 앱 빌드 + Capacitor 동기화
npm run cap:build
```

### 2단계: Android Studio에서 프로젝트 열기

```bash
npm run cap:android
```

또는 직접 Android Studio에서 열기:
```bash
open -a "Android Studio" android
```

### 3단계: 에뮬레이터 생성 (첫 실행 시만)

Android Studio에서:

1. **Tools > Device Manager** 클릭
2. **Create Device** 클릭
3. 원하는 기기 선택 (예: Pixel 7)
4. 시스템 이미지 선택 (최신 API 버전 권장, 예: API 34)
5. **Download** 클릭하여 시스템 이미지 다운로드
6. **Finish** 클릭

### 4단계: Gradle 동기화

프로젝트가 열리면 Android Studio가 자동으로 Gradle을 동기화합니다.
- 상단에 "Sync Now" 메시지가 나타나면 클릭

### 5단계: 에뮬레이터에서 실행

1. 상단 툴바에서 생성한 에뮬레이터 선택
2. **Run > Run 'app'** 클릭 (또는 `Ctrl + R` / 재생 버튼)
3. 에뮬레이터가 부팅되고 앱이 설치됩니다

### 명령줄에서 Android 에뮬레이터 직접 실행 (고급)

```bash
# 사용 가능한 에뮬레이터 목록 확인
emulator -list-avds

# 에뮬레이터 시작
emulator -avd Pixel_7_API_34 &

# APK 빌드 (Android Studio에서 빌드된 경우)
cd android
./gradlew assembleDebug
cd ..

# APK 설치
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 앱 실행
adb shell am start -n com.mohe.app/.MainActivity
```

## 개발 워크플로우

### 코드 수정 후 반영하기

웹 앱 코드를 수정한 후:

```bash
# 1. 웹 앱 다시 빌드
npm run build

# 2. 네이티브 플랫폼에 동기화
npx cap sync

# 또는 한 번에
npm run cap:build
```

그 다음:
- **iOS**: Xcode에서 다시 실행 (`Cmd + R`)
- **Android**: Android Studio에서 다시 실행 (재생 버튼)

### Hot Reload는 지원되나요?

Capacitor는 기본적으로 Hot Reload를 지원하지 않습니다. 코드 수정 시 위의 워크플로우를 따라야 합니다.

하지만 개발 중에는 웹 브라우저(`npm run dev`)에서 테스트하고, 네이티브 기능이 필요할 때만 시뮬레이터/에뮬레이터를 사용하는 것을 권장합니다.

### Live Reload 설정 (선택사항)

개발 서버를 사용한 Live Reload를 원한다면:

1. 개발 서버 실행:
```bash
npm run dev
# 서버가 http://localhost:3000 에서 실행됨
```

2. `capacitor.config.json`에 서버 URL 추가:
```json
{
  "server": {
    "url": "http://localhost:3000",
    "cleartext": true
  }
}
```

3. 동기화 및 실행:
```bash
npx cap sync
npm run cap:ios    # 또는 cap:android
```

⚠️ **주의**: 배포 전에는 `server` 설정을 제거해야 합니다!

## 문제 해결

### iOS 관련

**문제: "Unable to boot device in current state: Booted"**
```bash
xcrun simctl shutdown all
```

**문제: CocoaPods 에러**
```bash
cd ios/App
pod repo update
pod install --repo-update
cd ../..
```

**문제: "No signing identity found"**
- Xcode > Preferences > Accounts에서 Apple ID 추가
- 프로젝트 설정 > Signing & Capabilities에서 "Automatically manage signing" 체크

**문제: 시뮬레이터가 느림**
- Xcode > Open Developer Tool > Simulator > Hardware > Erase All Content and Settings

### Android 관련

**문제: "JAVA_HOME is not set"**
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
```

**문제: Gradle 동기화 실패**
```bash
cd android
./gradlew clean
cd ..
npx cap sync
```

**문제: "SDK location not found"**
`android/local.properties` 파일 생성:
```properties
sdk.dir=/Users/[USERNAME]/Library/Android/sdk
```

**문제: 에뮬레이터가 시작되지 않음**
```bash
# HAXM 또는 WHPX 확인 (Android Studio > SDK Manager > SDK Tools)
# 또는 에뮬레이터 삭제 후 재생성
```

## 실제 기기에서 테스트

### iOS 실제 기기

1. iPhone을 Mac에 연결
2. Xcode에서 상단 툴바에서 연결된 기기 선택
3. **Signing & Capabilities** 탭에서 Team 설정
4. 실행 (`Cmd + R`)
5. iPhone에서 **Settings > General > VPN & Device Management**에서 개발자 앱 신뢰 설정

### Android 실제 기기

1. Android 기기에서 **개발자 옵션** 활성화
   - Settings > About phone > Build number를 7번 탭
2. **USB 디버깅** 활성화
3. 기기를 컴퓨터에 연결
4. Android Studio에서 연결된 기기 선택
5. 실행

## 유용한 명령어

```bash
# Capacitor 버전 확인
npx cap --version

# 플러그인 목록 확인
npx cap ls

# 네이티브 프로젝트 업데이트
npx cap update

# 특정 플랫폼만 동기화
npx cap sync ios
npx cap sync android

# 캐시 정리
npx cap sync --inline
```

## 추가 리소스

- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [iOS 개발 가이드](https://developer.apple.com/documentation/)
- [Android 개발 가이드](https://developer.android.com/docs)
- [Capacitor 플러그인](https://capacitorjs.com/docs/plugins)

## 스플래시 화면 커스터마이징

현재 스플래시 화면은 기본 흰색 배경으로 설정되어 있습니다.

커스텀 이미지를 추가하려면:

### iOS
```bash
# Xcode에서 Assets.xcassets > Splash 이미지셋에 이미지 추가
# 또는 직접 파일 복사:
# ios/App/App/Assets.xcassets/Splash.imageset/
```

### Android
```bash
# 다양한 해상도의 이미지를 각 drawable 폴더에 추가:
android/app/src/main/res/drawable/splash.png
android/app/src/main/res/drawable-hdpi/splash.png
android/app/src/main/res/drawable-xhdpi/splash.png
android/app/src/main/res/drawable-xxhdpi/splash.png
android/app/src/main/res/drawable-xxxhdpi/splash.png
```

권장 이미지 크기:
- iOS: 2732x2732px (정사각형)
- Android: 1920x1920px (정사각형)

## 앱 아이콘 변경

### iOS
```bash
# Xcode에서 Assets.xcassets > AppIcon에 아이콘 추가
# 또는 ios/App/App/Assets.xcassets/AppIcon.appiconset/
```

### Android
```bash
# 다양한 크기의 아이콘을 mipmap 폴더에 추가:
android/app/src/main/res/mipmap-hdpi/ic_launcher.png (72x72)
android/app/src/main/res/mipmap-mdpi/ic_launcher.png (48x48)
android/app/src/main/res/mipmap-xhdpi/ic_launcher.png (96x96)
android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png (144x144)
android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png (192x192)
```

아이콘 생성 도구:
- [App Icon Generator](https://appicon.co/)
- [makeappicon.com](https://makeappicon.com/)
