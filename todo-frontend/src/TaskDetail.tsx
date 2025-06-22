import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import tw from 'twrnc';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { RootStackParamList } from './types/navigation';
import { useAppTheme } from './theme'; // 作成したテーマフックをインポート
import apiClient from '../api';

import StyledTextInput from './components/StyledTextInput';
import StyledButton from './components/StyledButton';
import StyledDropdown from './components/StyledDropdown';

// --- 型定義 ---
type Category = {
  id: number;
  name: string;
};

// --- コンポーネント本体 ---
const TaskDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const theme = useAppTheme(); // ★★★ テーマを取得 ★★★
  const taskId = route.params?.taskId;

  // --- Stateやロジックの部分は変更ありません ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priority, setPriority] = useState(2);
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

    // ▼▼▼ ドロップダウンの開閉状態を管理するStateを追加 ▼▼▼
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  
  
  
  useEffect(() => { /* ... 変更なし ... */ }, [taskId]);
  const handleSaveTask = async () => { /* ... 変更なし ... */ };
  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios' ? true : false); // iOSは表示したままにできる
    if (selectedDate) {
      setDueDate(selectedDate);
      if (Platform.OS !== 'ios') setShowDatePicker(false); // Android/Webでは選択後すぐに閉じる
    }
  };

  const categoryItems = useMemo(() => categories.map(cat => ({ label: cat.name, value: cat.id })), [categories]);
  const priorityItems = useMemo(() => ([{ label: '低', value: 1 }, { label: '中', value: 2 }, { label: '高', value: 3 }]), []);

  
  // --- 表示部分 (JSX) ---
  return (
    // ▼▼▼ ここから下のスタイルに theme を適用していきます ▼▼▼
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* 自作ヘッダー */}
      <View style={tw`flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={30} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[tw`text-xl font-bold`, { color: theme.colors.text }]}>
          {taskId ? 'タスクを編集' : '新しいタスク'}
        </Text>
        <View style={tw`w-8`} />{/* 中央寄せのためのダミースペース */}
      </View>
      
      <ScrollView style={tw`p-4`}>
        {/* カードUI */}
        <View style={[tw`p-4 rounded-lg`, { backgroundColor: theme.colors.card }]}>
          <StyledTextInput label="タスク名" value={title} onChangeText={setTitle} />
          <View style={[tw`h-px my-2`, { backgroundColor: theme.colors.border }]} />

           {/* ▼▼▼ StyledDropdownに置き換え ▼▼▼ */}
          <StyledDropdown
            label="カテゴリー"
            open={categoryOpen}
            value={selectedCategory}
            items={[{ label: 'カテゴリーを選択...', value: null }, ...categoryItems]}
            setOpen={setCategoryOpen}
            setValue={setSelectedCategory}
            zIndex={2000} // カテゴリーを優先的に表示
          />
          
          <View style={tw`my-4`} />{/* スペース調整 */}

          {/* ▼▼▼ StyledDropdownに置き換え ▼▼▼ */}
          <StyledDropdown
            label="優先度"
            open={priorityOpen}
            value={priority}
            items={priorityItems}
            setOpen={setPriorityOpen}
            setValue={setPriority}
            zIndex={1000} // 優先度はカテゴリーより手前に表示
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
          <StyledButton title={taskId ? "変更を保存" : "タスクを追加"} onPress={handleSaveTask} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TaskDetailScreen;