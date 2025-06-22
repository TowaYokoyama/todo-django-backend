import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- 型定義とスクリーンコンポーネントのインポート ---
// ファイルパスとファイル名のタイプミスをすべて修正しました
import { RootStackParamList, RootTabParamList } from './src/types/navigation';
import MainScreen from './src/MainScreen';
import SettingsScreen from './src/SetteingScreen';
import apiClient from './api';
import TaskDetailScreen from './src/TaskDetail';
import CategorySettingsScreen from './src/CategorySettingScreen';
import LoginScreen from './src/LoginScreens';


// --- ナビゲーターの作成と型付け ---
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

// --- 仮のホーム画面 ---
const HomeScreen = () => (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>ホーム画面</Text></View>);

// --- ログイン後のタブ画面 ---
// onLogoutを受け取るための型定義
type MainTabsProps = {
  onLogout: () => void;
};

function MainTabs({ onLogout }: MainTabsProps) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Tasks') iconName = focused ? 'checkmark-done' : 'checkmark-done-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline'; // ProfileからSettingsに修正
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }} />
      <Tab.Screen name="Tasks" options={{ title: 'タスク', headerShown: false }}>
        {() => <MainScreen onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Settings" options={{ title: '設定' }}>
        {() => <SettingsScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// --- アプリ本体 ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // インターセプター（認証トークン自動添付機能）の設定
    const requestInterceptor = apiClient.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    });
    // ログイン状態のチェック
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) setIsLoggedIn(true);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
    // クリーンアップ
    return () => apiClient.interceptors.request.eject(requestInterceptor);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>読み込み中...</Text></View>;
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {isLoggedIn ? (
            <>
              <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
                {() => <MainTabs onLogout={handleLogout} />}
              </Stack.Screen>
              <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ presentation: 'modal', title: 'タスク詳細' }} />
              <Stack.Screen name="CategorySettings" component={CategorySettingsScreen} options={{ title: 'カテゴリー管理' }} />
            </>
          ) : (
            <Stack.Screen name="Login" options={{ title: 'ログイン' }}>
              {(props) => <LoginScreen {...props} onLoginSuccess={() => setIsLoggedIn(true)} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}