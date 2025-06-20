import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';

import LoginScreen from './src/LoginScreens';
import MainScreen from './src/MainScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from './src/Profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator(); //タブナヴィゲーターを作成する。

//ログイン後に表示するタブ全体のコンポーネント
function MainTabs({onLogout} : {onLogout: () => void}) {
  return (
    <Tab.Navigator screenOptions={{ headerShown :false}}>
      {/*タスク一覧画面のタブ */}
      <Tab.Screen name="Tasks">
        {()=> <MainScreen onLogout={onLogout} />}
      </Tab.Screen>

      {/**プロフィール画面のタブ */}
      <Tab.Screen name="Profile">
        {()=> <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>

      {/* Todo: デザイン案にあるほかのタブもここに追加していく */}
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('トークンのチェックに失敗', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setIsLoggedIn(false);
    } catch (e) {
      console.error('ログアウトに失敗', e);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>{/* {isLoggedIn...} を始める */}
        {isLoggedIn ? (
          <Stack.Screen name="MainApp" options={{ headerShown: false }}>
            {() => <MainTabs onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login" options={{ title: 'ログイン' }}>
            {(props) => <LoginScreen {...props} onLoginSuccess={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}