import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import tw from 'twrnc';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { RootStackParamList } from './types/navigation';
import { useAppTheme } from './theme';
import apiClient from '../api';
import axios from 'axios';

import StyledTextInput from './components/StyledTextInput';
import StyledButton from './components/StyledButton';
import StyledDropdown from './components/StyledDropdown';

// --- 型定義 ---
type Category = {
  id: number;
  name: string;
};

// タスク詳細データの型（編集時に使用）
type TaskData = {
  title: string;
  description?: string;
  category: number;
  priority: number;
  due_date: string;
  goal?: number; // 目標IDを追加
};

type Goal = { id: number; name: string; };


// --- コンポーネント本体 ---
const TaskDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const theme = useAppTheme();
  const taskId = route.params?.taskId;

  // --- State定義 ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priority, setPriority] = useState(2); // デフォルトは '中'
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
const [goalOpen, setGoalOpen] = useState(false);

  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // --- 変更点①：画面表示時のデータ読み込み処理 ---
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  useEffect(() => {
    const fetchData = async () => {
      // 1. カテゴリー一覧をサーバーから取得してドロップダウンにセット
      try {
        const catResponse = await apiClient.get<Category[]>('/categories/');
        setCategories(catResponse.data);
      } catch (error) {
        console.error('カテゴリーの取得に失敗:', error);
        Alert.alert('エラー', 'カテゴリーの取得に失敗しました。');
      }

          // ↓↓↓ 目標一覧の取得処理を追加 ↓↓↓
    try {
      const goalResponse = await apiClient.get<Goal[]>('/goals/');
      setGoals(goalResponse.data);
    } catch (error) {
      console.error('目標の取得に失敗:', error);
    }



      // 2. もしtaskIdがあれば、タスク詳細を取得（編集モード）
      if (taskId) {
        try {
          const taskResponse = await apiClient.get<TaskData>(`/tasks/${taskId}/`);
          const task = taskResponse.data;
          // 取得したデータでStateを更新
          setTitle(task.title);
          setDescription(task.description || '');
          setSelectedCategory(task.category);
          setPriority(task.priority);
            setSelectedGoal(task.goal !== undefined ? task.goal : null); // task.goalが目標のID
          if (task.due_date) {
            // YYYY-MM-DD形式の文字列をDateオブジェクトに変換
          setDueDate(new Date(task.due_date + 'T00:00:00'));
          }
        } catch (error) {
          console.error('タスク詳細の取得に失敗:', error);
          Alert.alert('エラー', 'タスク詳細の取得に失敗しました。');
        }
      }
    };

    fetchData();
  }, [taskId]); // taskIdは基本変わらないので、初回マウント時に実行される

 // TaskDetailScreen.tsx の handleSaveTask 関数をこれに置き換えます
// ★★★ axiosをこのファイルでインポートする必要があるかもしれません ★★★
// import axios from 'axios'; 

const handleSaveTask = async () => {
  try {
    if (!title) {
      Alert.alert('エラー', 'タスク名を入力してください。');
     
      return;
    }
    if (selectedCategory === null) {
      Alert.alert('エラー', 'カテゴリーを選択してください。');
      
      return;
    }

   
    const taskData = {
      title: title,
      description: description,
      category: selectedCategory,
      priority: priority,
      due_date: dueDate.toISOString().split('T')[0],
      goal: selectedGoal, // ★★★ この行を追加 ★★★
    };
    if (taskId) {
        await apiClient.put(`/tasks/${taskId}/`, taskData);
    } else {
        await apiClient.post('/tasks/', taskData);
    }
    
    Alert.alert('成功', taskId ? 'タスクを更新しました。' : 'タスクを追加しました。');
    navigation.goBack();

  } catch (error) { // ここで error は 'unknown' 型になります
    console.log('[FAIL] APIリクエストでエラーが発生しました！');

    // まず、axios のエラーかどうかを判定します
    if (axios.isAxiosError(error)) {
      // このブロックの中では、error は AxiosError 型として扱えます
      if (error.response) {
        // サーバーからエラー応答があった場合 (4xx, 5xx エラー)
        console.error('サーバーからのエラー応答:', error.response.data);
        console.error('ステータスコード:', error.response.status);
      } else if (error.request) {
        // リクエストは送信されたが、サーバーから応答がなかった場合 (ネットワークエラーなど)
        console.error('サーバーから応答がありませんでした。IPアドレスやネットワークを確認してください。');
      } else {
        // リクエストを準備する段階で何か問題があった場合
        console.error('リクエスト設定エラー:', error.message);
      }
    } else {
      // axios 以外の、予期せぬエラーの場合
      console.error('axios以外の予期せぬエラーです:', error);
    }

    Alert.alert('エラー', 'タスクの保存に失敗しました。コンソールのログを確認してください。');
  }
};

  // --- その他のヘルパー関数やメモ化された値 ---
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios' ? true : false);
    if (selectedDate) {
      setDueDate(selectedDate);
      if (Platform.OS !== 'ios') setShowDatePicker(false);
    }
  };

  const categoryItems = useMemo(() => categories.map(cat => ({ label: cat.name, value: cat.id })), [categories]);
  const priorityItems = useMemo(() => ([{ label: '低', value: 1 }, { label: '中', value: 2 }, { label: '高', value: 3 }]), []);
  const goalItems = useMemo(() => goals.map(goal => ({ label: goal.name, value: goal.id })), [goals]);

  
  // --- 表示部分 (JSX) ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* ヘッダー */}
      <View style={tw`flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={30} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[tw`text-xl font-bold`, { color: theme.colors.text }]}>
          {taskId ? 'タスクを編集' : '新しいタスク'}
        </Text>
        <View style={tw`w-8`} />
      </View>
      
      <ScrollView style={tw`p-4`}>
        {/* カードUI */}
        <View style={[tw`p-4 rounded-lg`, { backgroundColor: theme.colors.card }]}>
          <StyledTextInput label="タスク名" value={title} onChangeText={setTitle} />
          <View style={[tw`h-px my-2`, { backgroundColor: theme.colors.border }]} />
          
          <StyledDropdown
            label="カテゴリー"
            open={categoryOpen}
            value={selectedCategory}
            items={categoryItems} // APIから取得したリストを使用
            setOpen={setCategoryOpen}
            setValue={setSelectedCategory}
            zIndex={2000}
          />
          
          <View style={tw`my-4`} />

          <StyledDropdown
            label="優先度"
            open={priorityOpen}
            value={priority}
            items={priorityItems}
            setOpen={setPriorityOpen}
            setValue={setPriority}
            zIndex={1000}
          />
       

        <StyledDropdown
       label="関連する目標（任意）"
      open={goalOpen}
       value={selectedGoal}
      items={goalItems}
      setOpen={setGoalOpen}
       setValue={setSelectedGoal}
       zIndex={1500} // zIndexが他のドロップダウンと被らないように調整
       />

       </View>
        <View style={[tw`h-px my-2`, { backgroundColor: theme.colors.border }]} />

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={tw`flex-row justify-between items-center py-3`}>
          <Text style={[tw`text-lg font-semibold`, { color: theme.colors.text }]}>期日</Text>
          <View style={tw`flex-row items-center`}>
            <Text style={[tw`text-base`, { color: theme.colors.text }]}>{dueDate.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.text} style={tw`ml-2`} />
          </View>
        </TouchableOpacity>

        <View style={[tw`p-4 mt-4 rounded-lg`, { backgroundColor: theme.colors.card }]}>
          <StyledTextInput label="詳細" value={description} onChangeText={setDescription} multiline />
        </View>

        {showDatePicker && (<DateTimePicker value={dueDate} mode="date" display="spinner" onChange={onChangeDate} />)}
        
        <View style={tw`my-8`}>
          <StyledButton title={taskId ? "保存" : "⚡⚡"} onPress={handleSaveTask} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskDetailScreen;