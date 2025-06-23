import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

// --- 自作コンポーネントやテーマ、型定義のインポート ---
import apiClient from '../api'; // パスは環境に合わせてください
import { useAppTheme } from './theme'; // パスは環境に合わせてください
import { GoalStackParamList } from './types/navigation'; // パスは環境に合わせてください
import StyledTextInput from './components/StyledTextInput'; // パスは環境に合わせてください
import StyledButton from './components/StyledButton'; // パスは環境に合わせてください
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

// この画面が受け取るpropsの型
type GoalDetailScreenRouteProp = RouteProp<GoalStackParamList, 'GoalDetail'>;


const GoalDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<GoalDetailScreenRouteProp>();
  const theme = useAppTheme(); // ★ テーマを取得
  const goalId = route.params?.goalId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);


  // --- ロジックの部分（useEffect, handleSaveGoal）は変更ありません ---

  // 編集モードの場合、既存の目標データを取得
  useEffect(() => {
    if (goalId) {
      const fetchGoalDetail = async () => {
      try {
        const response = await apiClient.get(`/goals/${goalId}/`);
        setName(response.data.name);
        setDescription(response.data.description || '');
        // 取得したデータで日付Stateを更新する処理を追加
        if (response.data.start_date) {
          setStartDate(new Date(response.data.start_date + 'T00:00:00'));
        }
        if (response.data.end_date) {
          setEndDate(new Date(response.data.end_date + 'T00:00:00'));
        }
      } catch (error) {
        console.error('目標詳細取得エラー:', error);
        Alert.alert('エラー', '目標の取得に失敗しました。');
      }
    };
    fetchGoalDetail();
  }
  }, [goalId]);

  // 保存処理
  const handleSaveGoal = async () => {
    if (!name) {
      Alert.alert('エラー', '目標名を入力してください。');
      return;
    }
    const goalData = { name, description,  start_date: startDate ? startDate.toISOString().split('T')[0] : null,
    end_date: endDate ? endDate.toISOString().split('T')[0] : null,};

    try {
      if (goalId) {
        await apiClient.put(`/goals/${goalId}/`, goalData);
      } else {
        await apiClient.post('/goals/', goalData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('目標保存エラー:', error);
      Alert.alert('エラー', '目標の保存に失敗しました。');
    }
  };


  function onChangeStartDate(event: DateTimePickerEvent, date?: Date | undefined): void {
    setShowStartDatePicker(false);
    if (event.type === 'set' && date) {
      setStartDate(date);
    }
  }

  function onChangeEndDate(event: DateTimePickerEvent, date?: Date | undefined): void {
    setShowEndDatePicker(false);
    if (event.type === 'set' && date) {
      setEndDate(date);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* 自作ヘッダー */}
      <View style={tw`flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={30} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[tw`text-xl font-bold`, { color: theme.colors.text }]}>
          {goalId ? '編集' : '🔥🔥'}
        </Text>
        <View style={tw`w-8`} />{/* 中央寄せのためのダミースペース */}
      </View>
      
      <ScrollView style={tw`p-4`}>
        {/* カードUI */}
        <View style={[tw`p-4 rounded-lg`, { backgroundColor: theme.colors.card }]}>
          <StyledTextInput
            label="目標名"
            value={name}
            onChangeText={setName}
          />
          
          <StyledTextInput
            label="詳細（任意）"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

          {/* 開始日ピッカー */}
          <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
            <Text>開始日: {startDate ? startDate.toLocaleDateString() : '未設定'}</Text>
          </TouchableOpacity>

          {/* 終了日ピッカー */}
          <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
            <Text>終了日: {endDate ? endDate.toLocaleDateString() : '未設定'}</Text>
          </TouchableOpacity>

          {showStartDatePicker && <DateTimePicker mode="date" value={startDate || new Date()} onChange={onChangeStartDate} />}
          {showEndDatePicker && <DateTimePicker mode="date" value={endDate || new Date()} onChange={onChangeEndDate} />}

          <View style={tw`my-8`}>
            <StyledButton
              title={goalId ? "更新する" : "作成する"}
              onPress={handleSaveGoal}
            />
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

export default GoalDetailScreen;