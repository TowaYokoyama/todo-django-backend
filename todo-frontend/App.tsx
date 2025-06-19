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
import LoginScreen from './src/LoginScreens';

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
    <LoginScreen />
  );
}