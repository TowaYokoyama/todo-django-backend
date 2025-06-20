import React from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from "../api"; 
import tw from 'twrnc';

// 受付係が受け取る「内線電話」の型を定義
type LoginScreenProps = {
  onLoginSuccess: () => void;
};

const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
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
            // 社員証(トークン)を発行して財布(AsyncStorage)にしまう
            await AsyncStorage.setItem('authToken', token);
            
            // ★最重要★ 警備員(App.tsx)に内線電話(onLoginSuccess)をかける
            onLoginSuccess();
            
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

            {/* TODO: ここに新規登録画面への案内・ボタンなどを追加する */}
        </View>
    );
};

export default LoginScreen;