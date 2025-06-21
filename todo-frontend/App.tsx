import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, RootTabParamList } from './src/types/navigation';
import MainScreen from './src/MainScreen';
import SettingsScreen from './src/SetteingScreen';
import TaskDetailScreen from './src/TaskDetail';
import CategorySettingsScreen from './src/CategorySettingScreen';
import LoginScreen from './src/LoginScreens';
import apiClient from './api';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

const HomeScreen = () => (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>ホーム画面</Text></View>);

// MainTabsが受け取るpropsの型を定義
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
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

// ▼▼▼ この useEffect ブロック全体を置き換えてください ▼▼▼
  useEffect(() => {
    // --- インターセプターの設定 (これは正しいです) ---
    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
       
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
         
          config.headers.Authorization = `Token ${token}`;
        } else {
         
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // --- ▼▼▼ この checkToken 関数の中身が重要です ▼▼▼ ---
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('トークンのチェックに失敗', e);
      } finally {
        // ★★★ この行が「読み込み完了」をアプリに伝えます ★★★
        setIsLoading(false);
      }
    };

    // そして、その関数を呼び出す
    checkToken();

    // --- クリーンアップ関数 (これも正しいです) ---
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, []);



  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>読み込み中...</Text></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="MainTabs">
              {() => <MainTabs onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ presentation: 'modal', title: 'タスク詳細' }} />
            <Stack.Screen name="CategorySettings" component={CategorySettingsScreen} options={{ title: 'カテゴリー管理' }} />
          </>
        ) : (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLoginSuccess={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}