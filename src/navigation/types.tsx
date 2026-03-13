// filename: src/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Map: undefined;
  Favorites: undefined;
  AIAssistant: undefined;
  Me: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  PropertyDetail: { propertyId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
