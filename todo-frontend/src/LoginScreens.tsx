// このファイルの内容をまるごと置き換えてください

import React from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from "../api"; 
import tw from 'twrnc';

// --- React Navigationからの型をインポート ---
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './types/navigation'; // 型定義ファイルのパス

// この画面が受け取るpropsの型
type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
type Props = {
  route: LoginScreenRouteProp;
};

// ★★★ propsの受け取り方を変更 ★★★
const LoginScreen = ({ route }: Props) => {
  // ★★★ onLoginSuccessを route.params から取得 ★★★
  const { onLoginSuccess } = route.params;

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async () => {
    if(!username || !password) {
      Alert.alert('エラー', 'ユーザー名とパスワードを入力してください');
      return;
    }
    try {
      const response = await apiClient.post('/auth/login/', {
        username: username, 
        password: password,
      });
      const token = response.data.key;
      await AsyncStorage.setItem('authToken', token);
      
      // 取得したonLoginSuccessを呼び出す
      onLoginSuccess(token);
        
    } catch(error) {
      console.error('ログインエラー：', error);
      Alert.alert('エラー','ユーザー名またはパスワードが正しくありません。');
    }
  };

  return(
    <View style={tw`flex-1 justify-center items-center bg-slate-100 p-8`}>
      <Text style={tw`text-3xl font-bold mb-8`}>ログイン</Text>
      <TextInput
        style={tw`w-full bg-white border border-gray-300 rounded-lg p-3 mb-4`}
        placeholder="ユーザー名"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={tw`w-full bg-white border border-gray-300 rounded-lg p-3 mb-6`}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="ログイン" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;