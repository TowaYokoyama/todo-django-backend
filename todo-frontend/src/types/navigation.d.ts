// Stack Navigatorが管理する画面の一覧と、それぞれが受け取るパラメータの型
export type RootStackParamList = {
  MainTabs: undefined;              // ログイン後のタブ画面全体
  TaskDetail: { taskId?: number };  // 新規作成/編集画面
  CategorySettings: undefined;      // カテゴリー管理画面
  Login: undefined;                 // ログイン画面
};

// BottomTab Navigatorが管理する画面の一覧
export type RootTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Settings: undefined;
};