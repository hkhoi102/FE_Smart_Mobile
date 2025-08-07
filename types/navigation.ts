import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  Verification: undefined;
  Location: undefined;
  Login: undefined;
  SignUp: undefined;
  Root: NavigatorScreenParams<TabParamList>;
  NotFound: undefined;
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
};

// Navigation prop types
export type RootStackNavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
};

export type TabNavigationProp = {
  navigate: (screen: keyof TabParamList, params?: any) => void;
  goBack: () => void;
};
