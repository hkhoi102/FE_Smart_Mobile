import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

export interface AppState {
  isFirstLaunch: boolean;
  isLoggedIn: boolean;
  userToken?: string;
  userData?: any;
}

class AppStateManager {
  private static instance: AppStateManager;
  private appState: AppState = {
    isFirstLaunch: true,
    isLoggedIn: false,
  };

  private constructor() {}

  public static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager();
    }
    return AppStateManager.instance;
  }

  // Kiểm tra xem đây có phải lần đầu chạy app không
  async checkFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        // Lần đầu chạy
        await AsyncStorage.setItem('hasLaunched', 'true');
        this.appState.isFirstLaunch = true;
        return true;
      } else {
        // Đã chạy trước đó
        this.appState.isFirstLaunch = false;
        return false;
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      return true; // Mặc định là lần đầu nếu có lỗi
    }
  }

  // Kiểm tra trạng thái đăng nhập
  async checkLoginStatus(): Promise<boolean> {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (userToken && userData) {
        // Validate JWT expiration (exp, seconds since epoch)
        try {
          const parts = userToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(
              Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
            );
            const exp: number | undefined = payload?.exp;
            if (typeof exp === 'number') {
              const nowInSeconds = Math.floor(Date.now() / 1000);
              if (exp <= nowInSeconds) {
                // Token expired: clear stored login data
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userData');
                this.appState.isLoggedIn = false;
                this.appState.userToken = undefined;
                this.appState.userData = undefined;
                return false;
              }
            }
          }
        } catch (e) {
          // If parsing fails, treat as not logged in
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userData');
          this.appState.isLoggedIn = false;
          this.appState.userToken = undefined;
          this.appState.userData = undefined;
          return false;
        }

        this.appState.isLoggedIn = true;
        this.appState.userToken = userToken;
        this.appState.userData = JSON.parse(userData);
        return true;
      } else {
        this.appState.isLoggedIn = false;
        return false;
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  // Lưu thông tin đăng nhập
  async saveLoginData(token: string, userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      this.appState.isLoggedIn = true;
      this.appState.userToken = token;
      this.appState.userData = userData;
    } catch (error) {
      console.error('Error saving login data:', error);
    }
  }

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      this.appState.isLoggedIn = false;
      this.appState.userToken = undefined;
      this.appState.userData = undefined;
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Lấy trạng thái hiện tại
  getCurrentState(): AppState {
    return { ...this.appState };
  }

  // Xác định màn hình khởi động
  async getInitialScreen(): Promise<string> {
    // Bỏ qua Onboarding, Verification, Location - đi thẳng đến Login
    const isLoggedIn = await this.checkLoginStatus();
    if (isLoggedIn) {
      return 'Root'; // Màn hình Home cho người dùng đã đăng nhập
    } else {
      return 'Login'; // Màn hình Login cho người dùng chưa đăng nhập
    }
  }

  // Reset app state (cho testing)
  async resetAppState(): Promise<void> {
    try {
      await AsyncStorage.clear();
      this.appState = {
        isFirstLaunch: true,
        isLoggedIn: false,
      };
    } catch (error) {
      console.error('Error resetting app state:', error);
    }
  }
}

export default AppStateManager;
