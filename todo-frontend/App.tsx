import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // アイコン表示のためにインポート

// スクリーンコンポーネントをインポート
import LoginScreen from './src/LoginScreens'; // パスを確認してください
import MainScreen from './src/MainScreen';   // パスを確認してください
import ProfileScreen from './src/Profile'; // パスを確認してください
import TaskDetailScreen from './src/TaskDetail';

const Stack = createNativeStackNavigator(); //一方通行の道案内をしてくれる
const Tab = createBottomTabNavigator(); //ホーム、タスク、プロフィールのようになります。

// 仮のホーム画面（あなたのデザイン案に合わせて後で作りこみます）
const HomeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>ホーム画面</Text>
  </View>
);

// ログイン後に表示するタブ全体のコンポーネント
function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      // ▼▼▼ この screenOptions の部分を修正・反映しました ▼▼▼
      screenOptions={({ route }) => ({
        // 各タブのアイコンを設定します
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle';

          // 表示中のルート名に応じて、表示するアイコンを動的に切り替えます
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          // 最終的に選ばれたアイコンコンポーネントを返します
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',   // アクティブなタブの色
        tabBarInactiveTintColor: 'gray',   // 非アクティブなタブの色
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }}/>
      
      <Tab.Screen name="Tasks" options={{ title: 'タスク' }}>
        {() => <MainScreen onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen name="Profile" options={{ title: 'プロフィール' }}>
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
      
    </Tab.Navigator>
  );
}


// これがアプリ全体のメインコンポーネントです
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ログイン状態のチェックとログアウト処理の部分は変更ありません
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
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>読み込み中...</Text></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <>
          <Stack.Screen name="MainApp" options={{ headerShown: false }}>
            {() => <MainTabs onLogout={handleLogout} />}
          </Stack.Screen>

          <Stack.Screen 
          name="TaskDetail"
          component={TaskDetailScreen}  /*そのnamwe(キー)が呼ばれたらそのコンポーネントを読んで表示しますよー */
          options={{
            title: '新しいタスク',
            presentation:'modal'
          }}
          />

          </>
        ) : (
          <Stack.Screen name="Login" options={{ title: 'ログイン' }}>
            {(props) => <LoginScreen {...props} onLoginSuccess={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}