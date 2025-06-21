// Stack Navigatorが管理する画面一覧
export type RootStackParamList = {
  MainTabs: undefined; // ログイン後のタブ画面全体
  TaskDetail: { taskId?: number };
  CategorySettings: undefined;
  Login: undefined;
};

// Tab Navigatorが管理する画面一覧
export type RootTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Settings: undefined;
};

// この型定義をグローバルに利用できるようにするためのおまじない
declare global {
  namespace ReactNavigation {
    // Stack Navigatorの型をグローバルに設定
    interface RootParamList extends RootStackParamList {}
  }
}