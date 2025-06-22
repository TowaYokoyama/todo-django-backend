import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import apiClient from '../api'; // パスを環境に合わせて修正
import tw from 'twrnc';

// 型定義
type GoalStackParamList = {
  GoalList: undefined;
  GoalDetail: { goalId?: number };
};
type GoalDetailScreenRouteProp = RouteProp<GoalStackParamList, 'GoalDetail'>;

const GoalDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<GoalDetailScreenRouteProp>();
  const goalId = route.params?.goalId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // 編集モードの場合、既存の目標データを取得
  useEffect(() => {
    if (goalId) {
      const fetchGoalDetail = async () => {
        try {
          const response = await apiClient.get(`/goals/${goalId}/`);
          setName(response.data.name);
          setDescription(response.data.description || '');
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
    const goalData = { name, description };
    try {
      if (goalId) {
        // 更新
        await apiClient.put(`/goals/${goalId}/`, goalData);
      } else {
        // 新規作成
        await apiClient.post('/goals/', goalData);
      }
      navigation.goBack(); // 保存後に前の画面に戻る
    } catch (error) {
      console.error('目標保存エラー:', error);
      Alert.alert('エラー', '目標の保存に失敗しました。');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 p-4`}>
      <Text style={tw`text-2xl font-bold mb-4`}>{goalId ? '目標を編集' : '新しい目標'}</Text>
      <TextInput
        style={tw`border border-gray-300 p-3 rounded-lg mb-4`}
        placeholder="目標名"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={tw`border border-gray-300 p-3 rounded-lg mb-6 h-24`}
        placeholder="詳細（任意）"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Button title={goalId ? '更新する' : '作成する'} onPress={handleSaveGoal} />
    </SafeAreaView>
  );
};

export default GoalDetailScreen;