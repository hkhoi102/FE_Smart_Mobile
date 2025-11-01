@echo off
echo Fixing React Native version mismatch...

echo.
echo 1. Clearing Expo cache...
npx expo start --clear

echo.
echo 2. Clearing Metro cache...
npx react-native start --reset-cache

echo.
echo 3. Clearing Watchman cache (if available)...
where watchman >nul 2>nul
if %errorlevel%==0 (
    watchman watch-del-all
) else (
    echo Watchman not found, skipping...
)

echo.
echo 4. Clearing node_modules and reinstalling...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install

echo.
echo 5. Rebuilding native code...
npx expo run:android --clear
echo.
echo Or for iOS: npx expo run:ios --clear

echo.
echo Done! The version mismatch should be fixed.
pause


