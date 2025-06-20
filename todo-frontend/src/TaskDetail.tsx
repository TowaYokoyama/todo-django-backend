import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import apiClient from '../api';

// ナビゲーション用の型をインポート（後で使います）
import { useNavigation } from '@react-navigation/native';

const TaskDetailScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSaveTask = async () => {
    if (!title) {
      Alert.alert('エラー', 'タイトルは必須です。');
      return;
    }
    try {
      // 新しいタスクを作成するAPIを叩く
      await apiClient.post('/tasks/', {
        title: title,
        description: description,
        // 優先度などは、まだ送らない
      });
      // 保存に成功したら、前の画面（タスク一覧）に戻る
      navigation.goBack();
    } catch (error) {
      console.error('タスクの保存に失敗:', error);
      Alert.alert('エラー', 'タスクの保存に失敗しました。');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-4`}>新しいタスク</Text>
        
        <Text style={tw`text-lg mb-2`}>タイトル</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 mb-4 bg-white`}
          placeholder="タスクのタイトル"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={tw`text-lg mb-2`}>詳細</Text>
        <TextInput
          style={tw`border border-gray-300 rounded-lg p-3 h-32 bg-white`}
          placeholder="タスクの詳細を入力..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={tw`mt-6`}>
          <Button title="保存する" onPress={handleSaveTask} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TaskDetailScreen;