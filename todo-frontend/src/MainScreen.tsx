import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  Button, 
  FlatList, 
  TouchableOpacity,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import { useNavigation, useIsFocused, NavigationProp } from '@react-navigation/native';
import apiClient from '../api';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from './theme';


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
// ルートパラメータ型を定義
type RootStackParamList = {
  MainScreen: undefined;
  TaskDetail: { taskId: number | undefined };
};

export default function MainScreen({ onLogout }: MainScreenProps) {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const [tasks, setTasks] = useState<Task[]>([]);

  // --- API関連の関数 (変更なし) ---
  const fetchTasks = async () => { /* ... */ };
  const handleToggleTask = async (id: number, currentStatus: boolean) => { /* ... */ };
  const handleDeleteTask = (id: number) => { /* ... */ };
  useEffect(() => {
    if (isFocused) {
      fetchTasks();
    }
  }, [isFocused]);

  // --- 表示部分 (JSX) ---
  return (
    // ▼▼▼ theme.colors.background に修正 ▼▼▼
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      <View style={tw`flex-1 p-4`}>
        {/* ヘッダー */}
        <View style={tw`flex-row justify-between items-center mb-4`}>
          {/* ▼▼▼ theme.colors.text に修正 ▼▼▼ */}
          <Text style={[tw`text-3xl font-bold`, { color: theme.colors.text }]}>タスク</Text>
          <Button title="ログアウト" onPress={onLogout} color="gray" />
        </View>

        {/* タスク一覧 */}
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
                // ▼▼▼ theme.colors.card (または surface) に修正 ▼▼▼
                style={[tw`p-4 rounded-lg mb-3 shadow-sm`, { backgroundColor: theme.colors.card }]}
              >
                {/* 上段 */}
                <View style={tw`flex-row items-center mb-2`}>
                  <TouchableOpacity onPress={() => handleToggleTask(item.id, item.completed)} style={tw`pr-3`}>
                    <View style={tw`w-6 h-6 rounded-full border-2 ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`} />
                  </TouchableOpacity>
                  {/* ▼▼▼ theme.colors.text に修正 ▼▼▼ */}
                  <Text style={[tw`flex-1 text-lg ${item.completed ? 'line-through text-gray-400' : ''}`, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteTask(item.id)} style={tw`pl-3`}>
                     {/* ▼▼▼ theme.colors.primary に修正 ▼▼▼ */}
                     <Ionicons name="trash-outline" size={22} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* 下段 */}
                <View style={tw`flex-row items-center pl-9`}>
                  <View style={tw`py-1 px-2 rounded-full ${priorityInfo.color}`}>
                    <Text style={tw`text-xs font-semibold ${priorityInfo.color}`}>{priorityInfo.text}</Text>
                  </View>
                  {item.due_date && (
                    <View style={tw`ml-3 flex-row items-center`}>
                       {/* ▼▼▼ theme.colors.subtext (または onSurfaceVariant) に修正 ▼▼▼ */}
                      <Ionicons name="calendar-outline" size={14} color={theme.colors.onSurfaceVariant} />
                      <Text style={[tw`ml-1 text-sm`, { color: theme.colors.onSurfaceVariant }]}>{item.due_date}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
             <View style={tw`mt-20 items-center`}>
               {/* ▼▼▼ theme.colors.subtext に修正 ▼▼▼ */}
               <Text style={[tw`text-gray-500`, { color: theme.colors.onSurfaceVariant }]}>タスクはありません。</Text>
               <Text style={[tw`text-gray-500`, { color: theme.colors.onSurfaceVariant }]}>下の「＋」ボタンから追加しましょう！</Text>
             </View>
           }
        />
      </View>

      {/* フローティングアクションボタン (FAB) */}
      <TouchableOpacity
        // ▼▼▼ theme.colors.primary に修正 ▼▼▼
        style={[tw`absolute bottom-6 right-6 w-16 h-16 rounded-full justify-center items-center shadow-lg`, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('TaskDetail', { taskId: undefined })}
      >
        <Text style={tw`text-white text-3xl`}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}