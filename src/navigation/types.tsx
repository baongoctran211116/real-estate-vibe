// filename: src/navigation/types.tsx
import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: { redirectMessage?: string } | undefined;
  Register: undefined;
};

export type TabParamList = {
  Map: undefined;
  Favorites: undefined;
  AIAssistant: undefined;
  Me: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  PropertyDetail: { propertyId: string };
  EditProfile: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;  // modal auth
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
