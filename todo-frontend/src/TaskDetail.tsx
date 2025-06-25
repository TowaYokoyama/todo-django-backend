import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import tw from 'twrnc';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications'; // ★★★ 通知機能のためにインポートを追加 ★★★
import { useFocusEffect } from '@react-navigation/native';


import { useAppTheme } from './theme';
import apiClient from '../api';
import axios from 'axios';

import StyledTextInput from './components/StyledTextInput';
import StyledButton from './components/StyledButton';
import StyledDropdown from './components/StyledDropdown';

// --- ルートスタックパラメータ型定義を追加 ---
type RootStackParamList = {
  TaskDetail: { taskId?: number; goalId?: number };
  // 他の画面があればここに追加
};

// --- 型定義 ---
type Category = {
  id: number;
  name: string;
};

// タスク詳細データの型（編集時に使用）
type TaskData = {
  id: number; // ★ 保存後のレスポンスでIDを受け取るために追加
  title: string;
  description?: string;
  category: number;
  priority: number;
  due_date: string;
  goal?: number;
};

type Goal = { id: number; name: string; };


// --- コンポーネント本体 ---
const TaskDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const theme = useAppTheme();
  const taskId = route.params?.taskId;
  const initialGoalId = route.params?.goalId; // 目標画面から渡されたgoalId

  // --- State定義 ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priority, setPriority] = useState(2);
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(initialGoalId || null);
  const [goalOpen, setGoalOpen] = useState(false);

  // --- データ読み込み処理 ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catResponse = await apiClient.get<Category[]>('/categories/');
        setCategories(catResponse.data);
        const goalResponse = await apiClient.get<Goal[]>('/goals/');
        setGoals(goalResponse.data);
      } catch (error) {
        console.error('カテゴリーまたは目標の取得に失敗:', error);
      }
      
      if (taskId) {
        try {
          const taskResponse = await apiClient.get<TaskData>(`/tasks/${taskId}/`);
          const task = taskResponse.data;
          setTitle(task.title);
          setDescription(task.description || '');
          setSelectedCategory(task.category);
          setPriority(task.priority);
          setSelectedGoal(task.goal !== undefined ? task.goal : null);
          if (task.due_date) {
            setDueDate(new Date(task.due_date + 'T00:00:00'));
          }
        } catch (error) {
          console.error('タスク詳細の取得に失敗:', error);
          Alert.alert('エラー', 'タスク詳細の取得に失敗しました。');
        }
      }
    };
    fetchData();
  }, [taskId]);

  
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // --- handleSaveTask関数を、正しい処理順序に修正 ---
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const handleSaveTask = async () => {
  try {
    // 1. 入力内容のチェック
    if (!title) {
      Alert.alert('エラー', 'タスク名を入力してください。');
      return;
    }
    if (selectedCategory === null) {
      Alert.alert('エラー', 'カテゴリーを選択してください。');
      return;
    }

    // 2. サーバーに送信するデータを作成
    const taskData = {
      title: title,
      description: description,
      category: selectedCategory,
      priority: priority,
      due_date: dueDate.toISOString().split('T')[0],
      goal: selectedGoal,
    };
    
    // 3. APIを呼び出してタスクを保存
    let savedTaskResponse;
    if (taskId) {
      savedTaskResponse = await apiClient.put<TaskData>(`/tasks/${taskId}/`, taskData);
    } else {
      savedTaskResponse = await apiClient.post<TaskData>('/tasks/', taskData);
    }
    
    Alert.alert('成功', taskId ? 'タスクを更新しました。' : 'タスクを追加しました。');

    // 4. 保存が成功したら、通知を予約
    if (taskData.due_date) {
      try {
        // ★★★ ここからが修正箇所 ★★★

        // 'trigger'という名前の変数を作成
        const triggerDate = new Date(taskData.due_date + 'T09:00:00'); // 締め切り日の朝9時


        // 既存の通知をキャンセル（必要に応じてコメントを外す）
        // await Notifications.cancelAllScheduledNotificationsAsync();
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "タスクの締め切りです！",
            body: taskData.title,
            data: { taskId: savedTaskResponse.data.id },
          },
          // Dateオブジェクトをそのまま渡す
           trigger: {   
                            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
    channelId: 'default',
    year: triggerDate.getFullYear(),
    month: triggerDate.getMonth() + 1,
    day: triggerDate.getDate(),
    hour: triggerDate.getHours(),
    minute: triggerDate.getMinutes(),
    second: 0,
    repeats: false,
  },
        });
        //console.log(`リマインダーを ${trigger.toLocaleString()} にセットしました`);

        // ★★★ 修正箇所ここまで ★★★
      } catch(e) {
        console.error("通知の予約に失敗:", e);
        Alert.alert("エラー", "リマインダーの設定に失敗しました。");
      }
    }
    
    // 5. 前の画面に戻る
    navigation.goBack();

  } catch (error) {
    console.log('[FAIL] APIリクエストでエラーが発生しました！');
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('サーバーからのエラー応答:', error.response.data);
      } else if (error.request) {
        console.error('サーバーから応答がありませんでした。');
      } else {
        console.error('リクエスト設定エラー:', error.message);
      }
    } else {
      console.error('axios以外の予期せぬエラーです:', error);
    }
    Alert.alert('エラー', 'タスクの保存に失敗しました。');
  }
};


    useFocusEffect(
  React.useCallback(() => {
    const requestNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('エラー', '通知の許可が必要です');
      }
    };

    requestNotificationPermission();
  }, [])
);



  // --- その他のヘルパー関数やメモ化された値 ---
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const categoryItems = useMemo(() => categories.map(cat => ({ label: cat.name, value: cat.id })), [categories]);
  const priorityItems = useMemo(() => ([{ label: '低', value: 1 }, { label: '中', value: 2 }, { label: '高', value: 3 }]), []);
  const goalItems = useMemo(() => goals.map(goal => ({ label: goal.name, value: goal.id })), [goals]);

  
  // --- 表示部分 (JSX) ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={tw`flex-row justify-between items-center p-4`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={30} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[tw`text-xl font-bold`, { color: theme.colors.text }]}>
          {taskId ? 'タスクを編集' : '新しいタスク'}
        </Text>
        <View style={tw`w-8`} />
      </View>
      <ScrollView style={tw`p-4`}>
        <View style={[tw`p-4 rounded-lg`, { backgroundColor: theme.colors.card }]}>
          <StyledTextInput label="タスク名" value={title} onChangeText={setTitle} />
          <View style={[tw`h-px my-2`, { backgroundColor: theme.colors.border }]} />
          <StyledDropdown label="カテゴリー" open={categoryOpen} value={selectedCategory} items={categoryItems} setOpen={setCategoryOpen} setValue={setSelectedCategory} zIndex={3000} />
          <View style={tw`my-4`} />
          <StyledDropdown label="関連する目標（任意）" open={goalOpen} value={selectedGoal} items={goalItems} setOpen={setGoalOpen} setValue={setSelectedGoal} zIndex={2000} />
          <View style={tw`my-4`} />
          <StyledDropdown label="優先度" open={priorityOpen} value={priority} items={priorityItems} setOpen={setPriorityOpen} setValue={setPriority} zIndex={1000} />
        </View>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[tw`p-4 mt-4 rounded-lg flex-row justify-between items-center`, { backgroundColor: theme.colors.card }]}>
          <Text style={[tw`text-lg`, { color: theme.colors.text }]}>期日</Text>
          <Text style={[tw`text-base`, { color: theme.colors.text }]}>{dueDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <View style={[tw`p-4 mt-4 rounded-lg`, { backgroundColor: theme.colors.card }]}>
          <StyledTextInput label="詳細" value={description} onChangeText={setDescription} multiline />
        </View>
        {showDatePicker && (<DateTimePicker value={dueDate} mode="date" display="spinner" onChange={onChangeDate} />)}
        <View style={tw`my-8`}>
          <StyledButton title={taskId ? "変更を保存" : "タスクを追加"} onPress={handleSaveTask} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskDetailScreen;