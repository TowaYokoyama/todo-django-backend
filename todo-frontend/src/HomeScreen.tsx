import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { useNavigation, useIsFocused, NavigationProp } from '@react-navigation/native';
import apiClient from '../api'; // パスは環境に合わせてください
import { useAppTheme } from './theme'; // パスは環境に合わせてください

// --- 型定義 ---
// APIから受け取るデータの型
type Goal = {
  id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
};

type Task = {
  id: number;
  title: string;
  completed: boolean;
  goal: number | null; // どの目標に属しているかを示すID
};

// 画面表示用に、進捗情報を追加した新しい型
type GoalWithProgress = {
  goal: Goal;
  tasks: Task[];
  completedCount: number;
  progress: number; // 0から1の間の数値 (例: 0.75 = 75%)
};

// --- 小さな部品（プログレスバー） ---
const ProgressBar = ({ progress }: { progress: number }) => {
  const theme = useAppTheme();
  return (
    <View style={[tw`w-full h-2 rounded-full`, { backgroundColor: theme.colors.onSurfaceVariant }]}>
      <View style={[tw`h-2 rounded-full`, { backgroundColor: theme.colors.primary, width: `${progress * 100}%` }]} />
    </View>
  );
};


// --- HomeScreenコンポーネント本体 ---
const HomeScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<any>>(); // 型は後で調整
  const isFocused = useIsFocused();

  const [processedGoals, setProcessedGoals] = useState<GoalWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  // ステップ１＆２：データの取得と加工
  // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★
  const fetchAndProcessData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Promise.allで、目標とタスクの取得を同時に行う
      const [goalsResponse, tasksResponse] = await Promise.all([
        apiClient.get<Goal[]>('/goals/'),
        apiClient.get<Task[]>('/tasks/')
      ]);
      const allGoals = goalsResponse.data;
      const allTasks = tasksResponse.data;

      // 目標ごとにタスクを仕分けし、進捗を計算する
      const dataWithProgress = allGoals.map(goal => {
        const tasksForThisGoal = allTasks.filter(task => task.goal === goal.id);
        const completedTasks = tasksForThisGoal.filter(task => task.completed);
        
        const progress = tasksForThisGoal.length > 0
          ? completedTasks.length / tasksForThisGoal.length
          : 0;

        return {
          goal: goal,
          tasks: tasksForThisGoal,
          completedCount: completedTasks.length,
          progress: progress,
        };
      });

      setProcessedGoals(dataWithProgress);

    } catch (error) {
      console.error("ホーム画面のデータ取得エラー:", error);
      Alert.alert("エラー", "データの取得に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchAndProcessData();
    }
  }, [isFocused, fetchAndProcessData]);

  if (isLoading) {
    return <ActivityIndicator style={tw`flex-1 justify-center items-center`} size="large" />;
  }


  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      <View style={tw`flex-1 p-4`}>
        <Text style={[tw`text-3xl font-bold mb-4`, { color: theme.colors.text }]}>挑み続けろ!</Text>
        <FlatList
          data={processedGoals}
          keyExtractor={(item) => item.goal.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
            onPress={()=> navigation.navigate('Goals', { screen: 'GoalDashboard', params: { goalId: item.goal.id } })}
              style={[tw`p-4 rounded-lg mb-4 shadow-sm`, { backgroundColor: theme.colors.card }]}
            >
              {/* カードの上段：目標名と進捗テキスト */}
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={[tw`text-xl font-bold`, { color: theme.colors.text }]}>{item.goal.name}</Text>
                <Text style={[tw`text-sm font-semibold`, { color: theme.colors.primary }]}>
                  {item.completedCount} / {item.tasks.length}
                </Text>
              </View>
              {/* カードの下段：プログレスバー */}
              <ProgressBar progress={item.progress} />
              {/* TODO: ここに目標の期間などを表示しても良い */}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={tw`mt-20 items-center`}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>まだ目標が作成されていません。</Text>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>「目標」タブから最初の目標を追加しましょう！</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;