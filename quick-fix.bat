@echo off
echo Quick fix for React Native version mismatch...

echo.
echo 1. Stopping any running Metro bundler...
taskkill /f /im node.exe 2>nul

echo.
echo 2. Clearing all caches...
npx expo start --clear
npx react-native start --reset-cache

echo.
echo 3. If using Expo Go app, try:
echo    - Close and reopen Expo Go app
echo    - Scan QR code again
echo    - Or try: npx expo start --tunnel

echo.
echo 4. If using development build, rebuild:
echo    - npx expo run:android
echo    - npx expo run:ios

echo.
echo Done! Try running the app again.
pause


