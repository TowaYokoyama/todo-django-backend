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
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from './types/navigation';

// --- 型定義 ---
type Task = {
  id: number;
  title: string;
  completed: boolean;
  description: string;
  priority: number;
  due_date: string | null;
  category: number | null;
};

type MainScreenProps = {
  onLogout: () => void;
};

// --- コンポーネント本体 ---
export default function MainScreen({ onLogout }: MainScreenProps) {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const [tasks, setTasks] = useState<Task[]>([]);

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
      fetchTasks();
    } catch (error) {
      console.error('タスクの更新に失敗:', error);
    }
  };

  const handleDeleteTask = (id: number) => {
    Alert.alert('削除の確認', '本当にこのタスクを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/tasks/${id}/`);
          fetchTasks();
        } catch (error) {
          console.error('タスクの削除に失敗:', error);
        }
      }},
    ]);
  };

  useEffect(() => {
    if (isFocused) {
      fetchTasks();
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      <View style={tw`flex-1 p-4`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-3xl font-bold`}>タスク</Text>
          <Button title="ログアウト" onPress={onLogout} color="gray" />
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const priorityInfo = {
              1: { text: '低', color: 'bg-green-100 text-green-800' },
              2: { text: '中', color: 'bg-yellow-100 text-yellow-800' },
              3: { text: '高', color: 'bg-red-100 text-red-800' },
            }[item.priority] || { text: '未設定', color: 'bg-gray-100 text-gray-800' };

            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
                style={tw`bg-white p-4 rounded-lg mb-3 shadow-sm`}
              >
                <View style={tw`flex-row items-center mb-2`}>
                  <TouchableOpacity onPress={() => handleToggleTask(item.id, item.completed)} style={tw`pr-3`}>
                    <View style={tw`w-6 h-6 rounded-full border-2 ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`} />
                  </TouchableOpacity>
                  <Text style={tw`flex-1 text-lg ${item.completed ? 'line-through text-gray-400' : ''}`}>
                    {item.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={tw`pl-3`}>
                     <Ionicons name="trash-outline" size={22} color="red" />
                  </TouchableOpacity>
                </View>

                <View style={tw`flex-row items-center pl-9`}>
                  <View style={tw`py-1 px-2 rounded-full ${priorityInfo.color}`}>
                    <Text style={tw`text-xs font-semibold ${priorityInfo.color}`}>{priorityInfo.text}</Text>
                  </View>
                  {item.due_date && (
                    <View style={tw`ml-3 flex-row items-center`}>
                      <Ionicons name="calendar-outline" size={14} color="gray" />
                      <Text style={tw`ml-1 text-sm text-gray-600`}>{item.due_date}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
             <View style={tw`mt-20 items-center`}>
               <Text style={tw`text-gray-500`}>タスクはありません。</Text>
               <Text style={tw`text-gray-500`}>下の「＋」ボタンから追加しましょう！</Text>
             </View>
           }
        />
      </View>

      <TouchableOpacity
        style={tw`absolute bottom-6 right-6 bg-blue-500 w-16 h-16 rounded-full justify-center items-center shadow-lg`}
        onPress={() => navigation.navigate('TaskDetail' , { taskId: undefined })}
      >
        <Text style={tw`text-white text-3xl`}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}