# OAuth Native Setup Guide

This guide explains how to configure OAuth deep links for Kakao and Google login in Android and iOS.

## Prerequisites

1. Add native platforms:
```bash
npx cap add android
npx cap add ios
```

2. Build and sync:
```bash
npm run build
npx cap sync
```

---

## Android Setup

### 1. Configure AndroidManifest.xml

After running `npx cap add android`, edit `android/app/src/main/AndroidManifest.xml`:

Add the following intent-filter inside the `<activity>` tag:

```xml
<activity
    android:name="com.mohe.app.MainActivity"
    ...>

    <!-- Existing intent-filter -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- Deep Link for OAuth callbacks -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="com.mohe.app" />
    </intent-filter>

    <!-- HTTPS App Links (optional, for Universal Links) -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="https"
            android:host="your-domain.com"
            android:pathPrefix="/oauth" />
    </intent-filter>
</activity>
```

### 2. Configure Kakao SDK (Optional - for Kakao Native SDK)

If using Kakao Native SDK instead of web OAuth, add to `android/app/build.gradle`:

```gradle
dependencies {
    implementation "com.kakao.sdk:v2-user:2.15.0"
}
```

Add Kakao app key to `android/app/src/main/res/values/strings.xml`:

```xml
<string name="kakao_app_key">YOUR_KAKAO_NATIVE_APP_KEY</string>
```

---

## iOS Setup

### 1. Configure URL Schemes

After running `npx cap add ios`, edit `ios/App/App/Info.plist`:

Add the following inside the `<dict>` tag:

```xml
<!-- URL Schemes for OAuth -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.mohe.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.mohe.app</string>
            <string>mohe</string>
        </array>
    </dict>
</array>

<!-- Allow HTTP for OAuth redirects (if needed) -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>

<!-- Kakao SDK specific (if using native SDK) -->
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>kakaokompassauth</string>
    <string>kakaolink</string>
</array>
```

### 2. Configure Associated Domains (for Universal Links)

In Xcode, go to your app target > Signing & Capabilities > + Capability > Associated Domains

Add:
```
applinks:your-domain.com
```

Create `/.well-known/apple-app-site-association` on your server:
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.mohe.app",
        "paths": ["/oauth/*"]
      }
    ]
  }
}
```

---

## OAuth Provider Setup

### Kakao Developers Console

1. Go to https://developers.kakao.com
2. Create/select your application
3. Go to "Platform" settings
4. Add Android:
   - Package name: `com.mohe.app`
   - Key hash: Run this command to get your key hash:
     ```bash
     keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64
     ```
5. Add iOS:
   - Bundle ID: `com.mohe.app`
6. Add Web platform if using web OAuth:
   - Site domain: Your web domain
7. Add redirect URIs in "Kakao Login" settings:
   - `com.mohe.app://oauth/kakao/callback`
   - `https://your-domain.com/oauth/kakao/callback`

### Google Cloud Console

1. Go to https://console.cloud.google.com
2. Create/select your project
3. Go to APIs & Services > Credentials
4. Create OAuth 2.0 Client IDs:

   **For Android:**
   - Application type: Android
   - Package name: `com.mohe.app`
   - SHA-1 certificate fingerprint (run in android folder):
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```

   **For iOS:**
   - Application type: iOS
   - Bundle ID: `com.mohe.app`

   **For Web:**
   - Application type: Web application
   - Authorized redirect URIs:
     - `com.mohe.app://oauth/google/callback`
     - `https://your-domain.com/oauth/google/callback`

---

## Environment Variables

Add to `.env`:

```env
VITE_KAKAO_CLIENT_ID=your_kakao_rest_api_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Testing Deep Links

### Android (via adb)
```bash
adb shell am start -a android.intent.action.VIEW -d "com.mohe.app://oauth/kakao/callback?code=test&state=test"
```

### iOS (via xcrun)
```bash
xcrun simctl openurl booted "com.mohe.app://oauth/kakao/callback?code=test&state=test"
```

---

## Troubleshooting

### OAuth callback not received
1. Verify the redirect URI matches exactly in OAuth provider settings
2. Check that intent-filters/URL schemes are correctly configured
3. Ensure `@capacitor/app` plugin is installed and synced

### Browser doesn't close after OAuth
The app automatically tries to close the browser after receiving the callback. If it doesn't close:
1. Make sure `@capacitor/browser` is installed
2. The browser close might fail silently - this is expected behavior on some devices

### State validation fails
1. Check that `sessionStorage` is working properly
2. Ensure the same browser instance is used (in-app browser, not external)
