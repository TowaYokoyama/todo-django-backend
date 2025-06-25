import { NavigatorScreenParams } from '@react-navigation/native';

// --- 1. 各タブの「中身」となるスタックの型をそれぞれ定義 ---

// 「タスク」タブの中で遷移する画面のリスト
export type TaskStackParamList = {
  TaskList: undefined; // MainScreen.tsx
  TaskDetail: { taskId?: number; goalId?: number };
};

// 「目標」タブの中で遷移する画面のリスト
export type GoalStackParamList = {
  GoalList: undefined; // GoalsScreen.tsx
  GoalDashboard: { goalId: number };
  GoalDetail: { goalId?: number };
};

// 「設定」タブの中で遷移する画面のリスト
export type SettingsStackParamList = {
  SettingsTop: undefined; // SettingsScreen.tsx
  CategorySettings: undefined;
};


// --- 2. ボトムタブ自身の画面リストを定義 ---
// 各タブの中身が、上で定義したスタックであることを NavigatorScreenParams で示す
export type RootTabParamList = {
  Home: undefined;
  Goals: NavigatorScreenParams<GoalStackParamList>;
  Tasks: NavigatorScreenParams<TaskStackParamList>;
  Calendar: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};


// --- 3. アプリ全体の親となるスタックの型を定義 ---
// ログイン状態によって画面を切り替える部分
export type AppStackParamList = {
  Login: { onLoginSuccess: (token: string) => void; };
  MainTabs: NavigatorScreenParams<RootTabParamList>; // ログイン後のタブ画面全体を一つの画面として扱う
};


// --- 4. React Navigation のグローバル型を上書き ---
// これにより、アプリのどこからでも正しい型で useNavigation を使えるようになる
declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppStackParamList {}
  }
}