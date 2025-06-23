import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { useNavigation, useIsFocused, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
 // パスを環境に合わせて修正
import { useAppTheme } from './theme'; // パスを環境に合わせて修正
import apiClient from '../api';
import { GoalStackParamList } from './types/navigation';

// 型定義
type Goal = {
  id: number;
  name: string;
  description: string;
};



const GoalsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<GoalStackParamList>>();
  const isFocused = useIsFocused();
  const [goals, setGoals] = useState<Goal[]>([]);

  // 目標を取得する関数
  const fetchGoals = async () => {
  try {
    // ↓↓↓ この2行の console.log を追加してください
    
    const response = await apiClient.get<Goal[]>('/goals/');
    
    setGoals(response.data);
  } catch (error) {
    Alert.alert('エラー', '目標の取得に失敗しました。');
  }
};

  // 画面が表示されるたびに目標を再取得
  useEffect(() => {
    if (isFocused) {
      fetchGoals();
    }
  }, [isFocused]);

  // 目標を削除する関数
  const handleDeleteGoal = (id: number) => {
    Alert.alert('削除の確認', 'この目標を本当に削除しますか？関連するタスクも全て削除されます。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/goals/${id}/`);
            fetchGoals(); // 削除後にリストを再読み込み
          } catch (error) {
            console.error('目標削除エラー:', error);
            Alert.alert('エラー', '目標の削除に失敗しました。');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      <View style={tw`flex-1 p-4`}>
        <Text style={[tw`text-3xl font-bold mb-4`, { color: theme.colors.text }]}>目標</Text>
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })}
              style={[tw`p-4 rounded-lg mb-3 shadow-sm flex-row justify-between items-center`, { backgroundColor: theme.colors.card }]}
            >
              <View>
                <Text style={[tw`text-lg font-semibold`, { color: theme.colors.text }]}>{item.name}</Text>
                <Text style={[tw`text-sm text-gray-500`, { color: theme.colors.onSurfaceVariant }]}>{item.description}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteGoal(item.id)} style={tw`p-2`}>
                <Ionicons name="trash-outline" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={tw`mt-20 items-center`}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>目標はありません。</Text>
            </View>
          }
        />
      </View>
      {/* 新規作成ボタン */}
      <TouchableOpacity
        style={[tw`absolute bottom-6 right-6 w-16 h-16 rounded-full justify-center items-center shadow-lg`, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('GoalDetail', { goalId: undefined })}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GoalsScreen;