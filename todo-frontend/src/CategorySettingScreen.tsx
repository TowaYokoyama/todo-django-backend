import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, SafeAreaView, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useIsFocused } from '@react-navigation/native';
import apiClient from '../api';

// カテゴリーの型定義
type Category = {
  id: number;
  name: string;
};

// コンポーネント本体
const CategorySettingsScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const isFocused = useIsFocused(); // 画面が表示されているかどうかの状態を取得

  // カテゴリー一覧を取得する関数
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('カテゴリーの取得に失敗:', error);
      Alert.alert('エラー', 'カテゴリーの読み込みに失敗しました。');
    }
  };

  // 画面が表示されるたびに、カテゴリー一覧を更新する
  useEffect(() => {
    if (isFocused) {
      fetchCategories();
    }
  }, [isFocused]);

  // 新しいカテゴリーを追加する関数
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('入力エラー', 'カテゴリー名を入力してください。');
      return;
    }
    try {
      await apiClient.post('/categories/', { name: newCategoryName });
      setNewCategoryName(''); // 入力欄をクリア
      fetchCategories(); // 成功したらリストを再読み込み
    } catch (error) {
      console.error('カテゴリー追加エラー:', error);
      Alert.alert('エラー', 'カテゴリーの追加に失敗しました。');
    }
  };

  // カテゴリーを削除する関数
  const handleDeleteCategory = (id: number) => {
    // 削除前に確認ダイアログを表示
    Alert.alert(
      '削除の確認',
      '本当にこのカテゴリーを削除しますか？\n（このカテゴリーが設定されたタスクからは、カテゴリー設定が解除されます）',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/categories/${id}/`);
              fetchCategories(); // 成功したらリストを再読み込み
            } catch (error) {
              console.error('カテゴリー削除エラー:', error);
              Alert.alert('エラー', 'カテゴリーの削除に失敗しました。');
            }
          },
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold mb-4`}>カテゴリー管理</Text>
        
        {/* カテゴリー追加フォーム */}
        <View style={tw`flex-row mb-4`}>
          <TextInput
            style={tw`border border-gray-300 rounded-lg p-2 flex-1 mr-2 bg-white`}
            placeholder="新しいカテゴリー名"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />
          <Button title="追加" onPress={handleAddCategory} />
        </View>

        {/* カテゴリー一覧 */}
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={tw`bg-white p-4 rounded-lg mb-2 shadow-sm flex-row justify-between items-center`}>
              <Text style={tw`text-lg`}>{item.name}</Text>
              {/* TODO: ここに編集ボタンを追加する */}
              <TouchableOpacity onPress={() => handleDeleteCategory(item.id)}>
                <Text style={tw`text-red-500`}>削除</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={tw`mt-8 items-center`}>
              <Text style={tw`text-gray-500`}>登録済みのカテゴリーはありません。</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default CategorySettingsScreen;