import React, { useState, useEffect, useMemo } from 'react';
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
import * as Notifications from 'expo-notifications';


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



// --- コンポーネント本体 ---
// ルートパラメータ型を定義
type RootStackParamList = {
  MainScreen: undefined;
  TaskDetail: { taskId: number | undefined };
};

export default function MainScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'incomplete' | 'complete'>('incomplete');
  const [sort, setSort] = useState<'priority' | 'due_date' | 'created_at'>('priority');

  const fetchTasks = async () => {
  try {
    const response = await apiClient.get<Task[]>('tasks/');
    setTasks(response.data);
  } catch (error) {
    console.error('タスク取得エラー:', error);
    Alert.alert('エラー', 'タスクの取得に失敗しました。');
  }
};

// タスクの完了状態をトグル
const handleToggleTask = async (id: number, currentStatus: boolean) => {
  try {
    await apiClient.patch(`tasks/${id}/`, {
      completed: !currentStatus,
    });
    fetchTasks(); // 状態をリロード
  } catch (error) {
    console.error('タスク状態更新エラー:', error);
    Alert.alert('エラー', 'タスクの状態更新に失敗しました。');
  }
};

// タスクを削除
const handleDeleteTask = (id: number) => {
  Alert.alert(
    '削除の確認',
    'このタスクを本当に削除しますか？',
    [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`tasks/${id}/`);
            fetchTasks(); // 再取得
          } catch (error) {
            console.error('タスク削除エラー:', error);
            Alert.alert('エラー', 'タスクの削除に失敗しました。');
          }
        },
      },
    ]
  );
};



  useEffect(() => {
    if (isFocused) {
      fetchTasks();
    }
  }, [isFocused]);

  
     useEffect(() => {
    // 通知の許可をリクエストする関数
    const registerForPushNotificationsAsync = async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      // すでに許可されているか確認
      if (existingStatus !== 'granted') {
        // 許可されていない場合、リクエストを送信
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        // 許可されなかった場合
        alert('プッシュ通知の許可が得られませんでした。');
        return;
      }
    };

    registerForPushNotificationsAsync();

    // 通知をタップしたときの挙動などを設定（オプション）
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);
  

  const displayedTasks = useMemo (()=> {
    let filteredTasks = tasks;

    //フィルタリング処理
    if (filter === 'incomplete') {
      filteredTasks = tasks.filter(task => !task.completed);
    }else if (filter === 'complete') {
      filteredTasks = tasks.filter(task => task.completed)
    }

    //allの場合は何もしないのでこれでいい

    return filteredTasks.sort((a,b) => {
      if (sort === 'priority') {
        return b.priority - a.priority; //優先度が降順
      }
      if (sort === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();  // 締め切り日 早い順
      }
       return 0;
    });
  }, [tasks ,filter , sort]) ; //tasks, filter, sort のいずれかが変わったときだけ再計算
   // 'created_at' はデフォルトのID順で代用できることが多いので、ここでは省略




  // --- 表示部分 (JSX) ---
  return (
    // ▼▼▼ theme.colors.background に修正 ▼▼▼
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      <View style={tw`flex-1 p-4`}>
        {/* --- フィルター＆ソートのコントロールパネル --- */}
        <View style={[tw`p-3 rounded-lg mb-4`, { backgroundColor: theme.colors.surface }]}>
        
        {/* フィルターセクション */}
        <View style={tw`mb-2`}>
          <Text style={[tw`text-sm font-bold mb-2`, { color: theme.colors.onSurfaceVariant }]}>絞り込み</Text>
          <View style={tw`flex-row`}>
            <TouchableOpacity 
              onPress={() => setFilter('all')} 
              style={tw`flex-1 p-2 rounded ${filter === 'all' ? 'bg-blue-500' : 'bg-gray-500'} mr-1`}
            >
              <Text style={tw`text-center text-white font-bold`}>すべて</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setFilter('incomplete')} 
              style={tw`flex-1 p-2 rounded ${filter === 'incomplete' ? 'bg-blue-500' : 'bg-gray-500'} mx-1`}
            >
              <Text style={tw`text-center text-white font-bold`}>未完了</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setFilter('complete')} 
              style={tw`flex-1 p-2 rounded ${filter === 'complete' ? 'bg-blue-500' : 'bg-gray-500'} ml-1`}
            >
              <Text style={tw`text-center text-white font-bold`}>完了済み</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ソートセクション */}
        <View>
          <Text style={[tw`text-sm font-bold mb-2`, { color: theme.colors.onSurfaceVariant }]}>並び替え</Text>
          <View style={tw`flex-row`}>
            <TouchableOpacity 
              onPress={() => setSort('priority')} 
              style={tw`flex-1 p-2 rounded ${sort === 'priority' ? 'bg-green-500' : 'bg-gray-400'} mr-1`}
            >
              <Text style={tw`text-center text-white font-bold`}>優先度順</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setSort('due_date')} 
              style={tw`flex-1 p-2 rounded ${sort === 'due_date' ? 'bg-green-500' : 'bg-gray-400'} ml-1`}
            >
              <Text style={tw`text-center text-white font-bold`}>締め切り日順</Text>
            </TouchableOpacity>
            </View>
          </View>

        </View>
        {/* タスク一覧 */}
        <FlatList
          data={displayedTasks}
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