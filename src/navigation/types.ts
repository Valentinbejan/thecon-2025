import { NavigatorScreenParams } from '@react-navigation/native';
import { Venue } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type ExploreStackParamList = {
  ExploreMain: undefined;
  Details: { venue: Venue };
};

export type AppTabsParamList = {
  Explore: NavigatorScreenParams<ExploreStackParamList>;
  Chat: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabsParamList>;
};
