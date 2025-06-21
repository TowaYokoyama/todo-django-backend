import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import tw from 'twrnc';
import apiClient from '../api';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// --- 型定義 ---
type Category = {
  id: number;
  name: string;
};


// --- コンポーネント本体 ---
const TaskDetailScreen = () => {
  const navigation = useNavigation();
  // routeフックを使って、MainScreenから渡されたパラメータを取得
  type RootStackParamList = { TaskDetail: { taskId?: number } };
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const taskId = route.params?.taskId; // パラメータからtaskIdを取得。なければundefined

  // --- Stateの定義 ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priority, setPriority] = useState(2); // デフォルトは「中」
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // --- データ取得・表示 ---
  useEffect(() => {
    // カテゴリー一覧は常に取得する
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('カテゴリーの取得に失敗:', error);
      }
    };
    fetchCategories();

    // ▼▼▼ ここが「編集モード」のロジックです ▼▼▼
    // もしtaskIdがあれば(編集モードなら)、そのタスクの詳細を取得する
    if (taskId) {
      const fetchTaskDetail = async () => {
        try {
          const response = await apiClient.get(`/tasks/${taskId}/`);
          const task = response.data;
          // 取得したデータで、フォームの初期値を設定する
          setTitle(task.title);
          setDescription(task.description || ''); // nullの場合があるので空文字をセット
          setSelectedCategory(task.category);
          setPriority(task.priority);
          if (task.due_date) {
            // YYYY-MM-DD の文字列をDateオブジェクトに変換
            setDueDate(new Date(task.due_date));
          }
        } catch (error) {
          console.error('タスク詳細の取得に失敗:', error);
          Alert.alert('エラー', 'タスクの読み込みに失敗しました。');
        }
      };
      fetchTaskDetail();
    }
  }, [taskId]); // taskIdが変更された時(画面を開いた時)に一度だけ実行

  // --- 保存処理 ---
  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルは必須です。');
      return;
    }
    
    // Djangoに送信するデータを作成
    const taskData = {
      title: title,
      description: description,
      priority: priority,
      due_date: dueDate.toISOString().split('T')[0], // YYYY-MM-DD 形式
      category: selectedCategory,
    };

    try {
      if (taskId) {
        // 編集モードの場合：PATCHで更新
        await apiClient.patch(`/tasks/${taskId}/`, taskData);
        Alert.alert('成功', 'タスクを更新しました！');
      } else {
        // 新規作成モードの場合：POSTで作成
        await apiClient.post('/tasks/', taskData);
        Alert.alert('成功', 'タスクを保存しました！');
      }
      navigation.goBack(); // 保存後に一覧画面に戻る
    } catch (error) {
      console.error('タスクの保存に失敗:', error);
      Alert.alert('エラー', 'タスクの保存に失敗しました。');
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  // --- 表示部分 (JSX) ---
  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      <ScrollView style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-6`}>{taskId ? 'タスクを編集' : '新しいタスク'}</Text>
        
        {/* ...フォーム部分は変更なし... */}
        <Text style={tw`text-lg mb-2 font-semibold`}>タイトル</Text>
        <TextInput style={tw`border border-gray-300 rounded-lg p-3 mb-4 bg-white`} value={title} onChangeText={setTitle} />
        <Text style={tw`text-lg mb-2 font-semibold`}>詳細</Text>
        <TextInput style={tw`border border-gray-300 rounded-lg p-3 h-32 bg-white mb-4`} value={description} onChangeText={setDescription} multiline />
        <Text style={tw`text-lg mb-2 font-semibold`}>カテゴリー</Text>
        <View style={tw`border border-gray-300 rounded-lg bg-white mb-4`}>
          <Picker selectedValue={selectedCategory} onValueChange={(itemValue) => setSelectedCategory(itemValue)}>
            <Picker.Item label="カテゴリーを選択..." value={null} />
            {categories.map((category) => (<Picker.Item key={category.id} label={category.name} value={category.id} />))}
          </Picker>
        </View>
        <Text style={tw`text-lg mb-2 font-semibold`}>優先度</Text>
        <View style={tw`border border-gray-300 rounded-lg bg-white mb-4`}>
          <Picker selectedValue={priority} onValueChange={(itemValue) => setPriority(itemValue)}>
            <Picker.Item label="低" value={1} /><Picker.Item label="中" value={2} /><Picker.Item label="高" value={3} />
          </Picker>
        </View>
        <Text style={tw`text-lg font-semibold mb-2`}>期日</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={tw`border border-gray-300 rounded-lg p-3 mb-4 bg-white`}>
          <Text>{dueDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (<DateTimePicker value={dueDate} mode="date" display="default" onChange={onChangeDate} />)}
        <View style={tw`mt-6 mb-12`}>
          <Button title="この内容で保存する" onPress={handleSaveTask} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskDetailScreen;