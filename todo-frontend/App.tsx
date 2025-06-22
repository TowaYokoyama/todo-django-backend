import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- 型定義とスクリーンコンポーネントのインポート ---
import { RootStackParamList, RootTabParamList } from './src/types/navigation';
import MainScreen from './src/MainScreen';
import SettingsScreen from './src/SetteingScreen';
import TaskDetailScreen from './src/TaskDetail';
import CategorySettingsScreen from './src/CategorySettingScreen';
import LoginScreen from './src/LoginScreens';

// 仮の画面コンポーネント
const HomeScreen = () => (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>ホーム画面</Text></View>);
const GoalsScreen = () => (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>目標画面</Text></View>);
const CalendarScreen = () => (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>カレンダー画面</Text></View>);


// --- ナビゲーターの作成 ---
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();


// --- ログイン後のタブナビゲーター本体 ---
// onLogoutをpropsとして受け取る
function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Goals') iconName = focused ? 'flag' : 'flag-outline';
          else if (route.name === 'Tasks') iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
          else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }} />
      <Tab.Screen name="Goals" component={GoalsScreen} options={{ title: '目標' }} />
      <Tab.Screen name="Tasks" component={MainScreen} options={{ title: 'タスク' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'カレンダー' }} />
      {/* SettingsScreenに直接onLogoutを渡す */}
        <Tab.Screen name="Settings" options={{ title: '設定' }}>
        {() => <SettingsScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}


// --- アプリ本体（認証状態によって表示を切り替える） ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ログイン状態のチェックとトークン設定のロジック (useEffect) は元のままでOKです
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('Failed to load token', e);
      }
      setIsLoading(false);
    };
    bootstrap();
  }, []);
  
  const handleLoginSuccess = (token: string) => {
    AsyncStorage.setItem('authToken', token);
    setIsLoggedIn(true);
  };
  
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
          // --- ログイン後の画面定義 ---
          <>
            <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
              {() => <MainTabs onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="CategorySettings" component={CategorySettingsScreen} />
          </>
        ) : (
          // --- ログイン前の画面定義 ---
          <Stack.Screen
           name="Login" 
           component={LoginScreen} // componentプロパティで指定
            initialParams={{ onLoginSuccess: handleLoginSuccess }} // initialParamsで渡す
            options={{ headerShown: false }}
          />
           
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}