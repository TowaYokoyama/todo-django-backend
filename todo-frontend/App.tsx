// App.tsx (twrnc スタイル適用 + 全機能動作版)

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform, // Platformをインポート
} from 'react-native';
import tw from 'twrnc'; // twrncをインポート
import apiClient from './api';

// Taskの型を定義
type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');

  // --- ここから下のロジック部分は、正常に動作したバージョンと全く同じです ---

  const fetchTasks = async () => {
    try {
      const response = await apiClient.get('/tasks/');
      setTasks(response.data);
    } catch (error) {
      console.error('タスクの取得に失敗:', error);
    }
  };

  const handleAddTask = async () => {
    if (newTitle.trim() === '') return;
    try {
      await apiClient.post('/tasks/', { title: newTitle });
      setNewTitle('');
      fetchTasks();
    } catch (error) {
      console.error('タスクの追加に失敗:', error);
    }
  };

  const handleToggleTask = async (id: number, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/tasks/${id}/`, { completed: !currentStatus });
      fetchTasks();
    } catch (error) {
      console.error('タスクの更新に失敗:', error);
    }
  };

  const handleDeleteTask = (id: number) => {
    const performDelete = async () => {
      try {
        await apiClient.delete(`/tasks/${id}/`);
        fetchTasks();
      } catch (error) {
        console.error('タスクの削除に失敗:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('本当にこのタスクを削除しますか？')) {
        performDelete();
      }
    } else {
      Alert.alert('削除の確認', '本当にこのタスクを削除しますか？', [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // --- ここから下の表示部分(JSX)のスタイルをtwrncに戻します ---

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-4`}>タスク一覧</Text>

        <View style={tw`flex-row mb-4`}>
          <TextInput
            style={tw`border border-gray-300 rounded-lg p-2 flex-1 mr-2`}
            placeholder="新しいタスクを入力..."
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <Button title="追加" onPress={handleAddTask} />
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={tw`bg-white p-4 rounded-lg mb-2 shadow flex-row items-center`}>
              <TouchableOpacity
                style={tw`flex-1 mr-4`}
                onPress={() => handleToggleTask(item.id, item.completed)}
              >
                <Text style={tw`text-lg ${item.completed ? 'line-through text-gray-400' : ''}`}>
                  {item.title}
                </Text>
              </TouchableOpacity>
              <Button title="削除" color="red" onPress={() => handleDeleteTask(item.id)} />
            </View>
          )}
        />
      </View>
     
    </SafeAreaView>
  );
}