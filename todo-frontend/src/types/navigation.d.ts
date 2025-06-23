import { NavigatorScreenParams } from '@react-navigation/native';

// ボトムタブが管理する画面のリスト
export type RootTabParamList = {
  Home: undefined;
  Goals: undefined;
  Tasks: undefined;
  Calendar: undefined;
  Settings: undefined;
};

export type GoalStackParamList = {
  GoalList: undefined;
  GoalDetail: { goalId?: number };
};


// アプリ全体の親スタックが管理する画面のリスト
export type RootStackParamList = {
    Login: { onLoginSuccess:  (token: string) => void; }; 
  // ログイン後は、タブ画面全体を"MainTabs"という一つの画面として扱う
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  // タブとは別に、スタックに直接属する画面
  TaskDetail: { taskId?: number };
  CategorySettings: undefined;
   Goals: NavigatorScreenParams<GoalStackParamList>; 

};


// React Navigationのグローバルな型を拡張
declare namespace ReactNavigation {
  interface RootParamList extends RootStackParamList {}
}