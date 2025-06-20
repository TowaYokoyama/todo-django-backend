import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  Button, 
  FlatList, 
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import tw from 'twrnc';
import { useNavigation, useIsFocused, NavigationProp } from '@react-navigation/native';
import apiClient from '../api';

// --- 型定義 ---
type Task = {
  id: number;
  title: string;
  completed: boolean;
};

type MainScreenProps = {
  onLogout: () => void;
};

// --- コンポーネント本体 ---
// ルートパラメータ型を定義
type RootStackParamList = {
  MainScreen: undefined;
  TaskDetail: { taskId?: number } | undefined;
};

export default function MainScreen({ onLogout }: MainScreenProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused(); // 画面が表示されているかどうかの状態を取得

  const [tasks, setTasks] = useState<Task[]>([]);

  // --- API関連の関数 ---
  const fetchTasks = async () => {
    try {
      const response = await apiClient.get('/tasks/');
      setTasks(response.data);
    } catch (error) {
      console.error('タスクの取得に失敗:', error);
    }
  };

  const handleToggleTask = async (id: number, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/tasks/${id}/`, { completed: !currentStatus });
      fetchTasks(); // 成功したらリストを再読み込み
    } catch (error) {
      console.error('タスクの更新に失敗:', error);
    }
  };

  const handleDeleteTask = (id: number) => {
    const performDelete = async () => {
      try {
        await apiClient.delete(`/tasks/${id}/`);
        fetchTasks(); // 成功したらリストを再読み込み
      } catch (error) {
        console.error('タスクの削除に失敗:', error);
      }
    };
    // 削除前の確認ダイアログ
    Alert.alert('削除の確認', '本当にこのタスクを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: performDelete },
    ]);
  };

  // --- 画面表示時の処理 ---
  useEffect(() => {
    // この画面が表示された時(isFocusedがtrueになった時)にタスクを読み込む
    // これにより、詳細画面から戻ってきた時もリストが更新される
    if (isFocused) {
      fetchTasks();
    }
  }, [isFocused]);

  // --- 表示部分 (JSX) ---
  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      <View style={tw`flex-1 p-4`}>
        {/* ヘッダー */}
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-3xl font-bold`}>タスク</Text>
          <Button title="ログアウト" onPress={onLogout} color="gray" />
        </View>

        {/* タスク一覧 */}
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()} //ここのkeyは文字列方じゃないとだめだからね
          renderItem={({ item }) => (
            <TouchableOpacity
              // タップすると将来的に編集画面に移動できるようにする
              onPress={() => {
                // TODO: navigation.navigate('TaskDetail', { taskId: item.id }) のようにして編集画面に移動
                Alert.alert('タスク詳細', `タスク名: ${item.title}`);
              }}
              style={tw`bg-white p-4 rounded-lg mb-3 shadow-sm`}
            >
              <View style={tw`flex-row items-center`}>
                <TouchableOpacity onPress={() => handleToggleTask(item.id, item.completed)} style={tw`pr-3`}>
                  <View style={tw`w-6 h-6 rounded-full border-2 ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`} />
                </TouchableOpacity>
                <Text style={tw`flex-1 text-lg ${item.completed ? 'line-through text-gray-400' : ''}`}>
                  {item.title}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={tw`pl-3`}>
                  <Text style={tw`text-red-500`}>削除</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={tw`mt-20 items-center`}>
              <Text style={tw`text-gray-500`}>タスクはありません。</Text>
              <Text style={tw`text-gray-500`}>下の「＋」ボタンから追加しましょう！</Text>
            </View>
          }
        />
      </View>

      {/* フローティングアクションボタン (FAB) */}
      <TouchableOpacity
        style={tw`absolute bottom-6 right-6 bg-blue-500 w-16 h-16 rounded-full justify-center items-center shadow-lg`}
        onPress={() => navigation.navigate('TaskDetail')}
      >
        <Text style={tw`text-white text-3xl`}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}