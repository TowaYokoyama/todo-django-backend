import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useNavigation, useRoute, useIsFocused, NavigationProp, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api';
import { useAppTheme } from './theme';

// GoalStackParamListの型定義をここで暫定的に定義（必要に応じてtypes/navigationで正式定義してください）
type GoalStackParamList = {
  GoalDashboard: { goalId: number };
  GoalDetail: { goalId: number };
  TaskDetail: { goalId: number };
};

// --- 型定義 ---
type Goal = { id: number; name: string; description: string; start_date: string | null; end_date: string | null; };
type Task = { id: number; title: string; completed: boolean; };

// --- 小さな部品（プログレスバー） ---
const ProgressBar = ({ progress }: { progress: number }) => {
  const theme = useAppTheme();
  return (
    <View style={[tw`w-full h-3 rounded-full my-2`, { backgroundColor: theme.colors.onSurfaceVariant }]}>
      <View style={[tw`h-3 rounded-full`, { backgroundColor: theme.colors.primary, width: `${progress * 100}%` }]} />
    </View>
  );
};

const GoalDashboardScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<GoalStackParamList>>();
  const route = useRoute<RouteProp<GoalStackParamList, 'GoalDashboard'>>(); // 型は後で修正
  const { goalId } = route.params;
  const isFocused = useIsFocused();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ★★★ データ取得ロジック ★★★
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const goalPromise = apiClient.get<Goal>(`/goals/${goalId}/`);
      const tasksPromise = apiClient.get<Task[]>(`/tasks/?goal=${goalId}`); // goalIdでタスクを絞り込み
      
      const [goalResponse, tasksResponse] = await Promise.all([goalPromise, tasksPromise]);
      
      setGoal(goalResponse.data);
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error("目標ダッシュボードのデータ取得エラー:", error);
      Alert.alert("エラー", "データの取得に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, fetchData]);
  
  // 進捗計算
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  
  if (isLoading) {
    return <ActivityIndicator style={tw`flex-1`} size="large" />;
  }

  if (!goal) {
    return <View><Text>目標が見つかりません。</Text></View>;
  }

  // ★★★ 表示部分 (JSX) ★★★
  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      {/* ヘッダー */}
      <View style={tw`p-4 border-b border-gray-200 dark:border-gray-800`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`absolute top-4 left-4 z-10`}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[tw`text-2xl font-bold text-center`, { color: theme.colors.text }]}>{goal.name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })} style={tw`absolute top-4 right-4 z-10`}>
           <Ionicons name="pencil" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            <View style={tw`p-4`}>
              <Text style={[tw`text-base text-gray-600 dark:text-gray-300`, { color: theme.colors.onSurfaceVariant }]}>{goal.description}</Text>
            </View>
            <View style={tw`px-4 mb-4`}>
              <View style={tw`flex-row justify-between items-end`}>
                 <Text style={[tw`text-sm font-bold`, { color: theme.colors.primary }]}>進捗</Text>
                 <Text style={[tw`text-sm`, { color: theme.colors.text }]}>{completedCount} / {totalCount}</Text>
              </View>
              <ProgressBar progress={progress} />
            </View>
            <Text style={[tw`text-xl font-bold px-4 mb-2`, { color: theme.colors.text }]}>関連タスク</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={tw`px-4 py-2 flex-row items-center`}>
            <Ionicons name={item.completed ? "checkmark-circle" : "ellipse-outline"} size={24} color={item.completed ? 'green' : 'gray'} />
            <Text style={[tw`flex-1 ml-3 text-lg`, { color: theme.colors.text }]}>{item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={tw`text-center text-gray-500 mt-4`}>この目標にはまだタスクがありません。</Text>}
      />
      
      {/* この目標に紐づくタスクを新規作成するボタン */}
      <TouchableOpacity
        style={[tw`absolute bottom-6 right-6 w-16 h-16 rounded-full justify-center items-center shadow-lg`, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('TaskDetail', { goalId: goal.id })}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GoalDashboardScreen;