import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import tw from 'twrnc';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';

import { useAppTheme } from './theme';
import apiClient from '../api';
import axios from 'axios';

import StyledTextInput from './components/StyledTextInput';
import StyledButton from './components/StyledButton';
import StyledDropdown from './components/StyledDropdown';
import { getNotificationSetting } from './utils/setting';



// --- ルートスタックパラメータ型定義 ---
type RootStackParamList = {
  TaskDetail: { taskId?: number; goalId?: number };
};

// --- 型定義 ---
type Category = {
  id: number;
  name: string;
};

type TaskData = {
  id: number;
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
  const initialGoalId = route.params?.goalId;

  // --- State定義 (変更なし) ---
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
  // ユーザーが設定したリマインダーの日時を覚えておくための変数
const [reminderDate, setReminderDate] = useState<Date | null>(null); 
// リマインダー用の日時ピッカーの表示・非表示を管理する変数
const [showReminderPicker, setShowReminderPicker] = useState(false);
  


  // --- データ読み込み処理 (変更なし) ---
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
  
  const handleSaveTask = async () => {
    try {
      // 1. 入力内容のチェック (変更なし)
      if (!title) {
        Alert.alert('エラー', 'タスク名を入力してください。');
        return;
      }
      if (selectedCategory === null) {
        Alert.alert('エラー', 'カテゴリーを選択してください。');
        return;
      }

      // 2. サーバーに送信するデータを作成 (変更なし)
      const taskData = {
        title: title,
        description: description,
        category: selectedCategory,
        priority: priority,
        due_date: dueDate.toISOString().split('T')[0],
        goal: selectedGoal,
      };
      
      // 3. APIを呼び出してタスクを保存 (変更なし)
      let savedTaskResponse;
      if (taskId) {
        savedTaskResponse = await apiClient.put<TaskData>(`/tasks/${taskId}/`, taskData);
      } else {
        savedTaskResponse = await apiClient.post<TaskData>('/tasks/', taskData);
      }
      
      Alert.alert('成功', taskId ? 'タスクを更新しました。' : 'タスクを追加しました。');

      // ★★★ 4. 保存が成功したら、「設定を確認して」通知を予約 ★★★
      // 執事を呼んで、ユーザーが設定した内容を取得します
      // ★★★ ここからをごっそり入れ替え ★★★

      // 4. 設定を確認し、新しい仕様に基づいて通知を予約
      const notificationSettings = await getNotificationSetting();

      // (A) アプリ全体の設定で、通知が「オン」になっているか？
      if (notificationSettings.isEnabled) {
        
        // (B) このタスクの優先度が「高」(値が3)に設定されているか？
        if (priority === 3) {

          // (C) ユーザーがリマインダーの日時をセットしたか？ (nullではないか？)
          if (reminderDate) {
            console.log('条件を全て満たしたため、通知を予約します。');

            try {
              // 過去の日時でないことを確認
              if (reminderDate.getTime() > Date.now()) {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: "優先度「高」のタスクの期限です！", // タイトルを少し変更
                    body: taskData.title,
                    data: { taskId: savedTaskResponse.data.id },
                  },
                  trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: reminderDate, // ユーザーが設定した日時をそのまま使う
                  },
                });
                console.log(`リマインダーを ${reminderDate.toLocaleString()} にセットしました`);
              }
            } catch(e) {
              console.error("通知の予約処理中にエラーが発生:", e);
            }
          } else {
            // (C) の条件を満たさなかった場合
            console.log('リマインダーが設定されていないため、通知をスキップしました。');
          }
        } else {
          // (B) の条件を満たさなかった場合
          console.log('優先度が「高」ではないため、通知をスキップしました。');
        }
      } else {
        // (A) の条件を満たさなかった場合
        console.log('アプリの通知設定がオフなので、予約をスキップしました。');
      }
      
      // ★★★ 入れ替えはここまで ★★★
      
      // 5. 前の画面に戻る (変更なし)
      navigation.goBack();

    } catch (error) {
      console.log('[FAIL] APIリクエストでエラーが発生しました！');
      if (axios.isAxiosError(error)) {
        if (error.response) { console.error('サーバーからのエラー応答:', error.response.data); }
        else if (error.request) { console.error('サーバーから応答がありませんでした。'); }
        else { console.error('リクエスト設定エラー:', error.message); }
      } else { console.error('axios以外の予期せぬエラーです:', error); }
      Alert.alert('エラー', 'タスクの保存に失敗しました。');
    }
  };


  // --- OSの通知許可を確認する処理 (変更なし) ---
  useFocusEffect(
    React.useCallback(() => {
      const requestNotificationPermission = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('注意', 'プッシュ通知の許可がありません。リマインダーを設定するには、OSの設定画面から通知を許可してください。');
        }
      };
      requestNotificationPermission();
    }, [])
  );

  // --- その他のヘルパー関数やメモ化された値 (変更なし) ---
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) { setDueDate(selectedDate); }
  };

   // ★★★ ここから追加 ★★★
  const onChangeReminderDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowReminderPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReminderDate(selectedDate);
    }
  };
  // ★★★ 追加ここまで ★★★

  const categoryItems = useMemo(() => categories.map(cat => ({ label: cat.name, value: cat.id })), [categories]);
  const priorityItems = useMemo(() => ([{ label: '低', value: 1 }, { label: '中', value: 2 }, { label: '高', value: 3 }]), []);
  const goalItems = useMemo(() => goals.map(goal => ({ label: goal.name, value: goal.id })), [goals]);

  
  // --- 表示部分 (JSX) (変更なし) ---
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

        {/* ★★★ ここからが丸ごと追加するブロック ★★★ */}
        <TouchableOpacity
          onPress={() => setShowReminderPicker(true)}
          style={[tw`p-4 mt-4 rounded-lg flex-row justify-between items-center`, { backgroundColor: theme.colors.card }]}
        >
          <Text style={[tw`text-lg`, { color: theme.colors.text }]}>リマインダー</Text>
          <Text style={[tw`text-base`, { color: theme.colors.text }]}>
            {/* reminderDateが設定されていれば日時を、なければ「設定しない」と表示 */}
            {reminderDate ? reminderDate.toLocaleString() : '設定しない'}
          </Text>
        </TouchableOpacity>
        {/* ★★★ 追加ブロックここまで ★★★ */}


        <View style={[tw`p-4 mt-4 rounded-lg`, { backgroundColor: theme.colors.card }]}>
          <StyledTextInput label="詳細" value={description} onChangeText={setDescription} multiline />
        </View>
        {showDatePicker && (<DateTimePicker value={dueDate} mode="date" display="spinner" onChange={onChangeDate} />)}

                {/* ★★★ ここから追加 ★★★ */}
        {showReminderPicker && (
          <DateTimePicker
            value={reminderDate || new Date()} // reminderDateがなければ現在日時を初期値に
            mode="datetime" //「日付と時間」の両方を選べるモード
            display="spinner"
            onChange={onChangeReminderDate}
          />
        )}
        {/* ★★★ 追加ここまで ★★★ */}

        <View style={tw`my-8`}>
          <StyledButton title={taskId ? "変更を保存" : "タスクを追加"} onPress={handleSaveTask} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskDetailScreen;