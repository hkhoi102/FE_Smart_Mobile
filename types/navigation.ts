import { NavigatorScreenParams } from '@react-navigation/native';

export type Product = {
  id: string;
  image: any;
  name: string;
  desc: string;
  price: string;
  onAdd?: () => void;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  SignIn: undefined;
  Verification: undefined;
  Location: undefined;
  Login: undefined;
  SignUp: undefined;
  OtpVerification: { email: string; fullName: string };
  Root: NavigatorScreenParams<TabParamList>;
  NotFound: undefined;
  ProductDetail: { id: string; unitId?: number };
  CategoryDetail: { categoryName: string; categoryId: number };
  Filter: undefined;
  OrderSuccess: undefined;
  Scanner: undefined;
  SeeAll: { title?: string; items: { id: string; image: any; name: string; desc: string; price: string }[] };
  Profile: undefined;
  Orders: undefined;
  OrderDetail: { orderId: number };
};

export type TabParamList = {
  Shop: undefined;
  Explore: undefined;
  Scanner: undefined;
  Cart: undefined;
  Favourite: undefined;
  Account: undefined;
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
