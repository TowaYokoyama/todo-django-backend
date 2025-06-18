import { useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from "../api";


const LoginScreen  = () => {
    const [username, setUsername] = useState('');
    const [password, setPassWord] = useState('');

    const handleLogin = async () => {
        if(!username || !password) {
            Alert.alert('エラー', 'ユーザー名とパスワードを入力してください');
            return;
        }

        try {
            //apiClientを使って、DjangoのログインＡＰＩを叩く
            const response = await apiClient.post('/api/auth/login', {
                username: username,
                password: password,
            });

            //応答データからトークンを取得
            const token = response.data.key; //dj-rest-authでは'key'という名前で帰ってくる
            //トークンをAsyncStorageに保存
            await AsyncStorage.setItem('authToken', token);
            //成功をユーザーに表示
            Alert.alert('成功', 'ログインしました！');

            //Todoログイン後のタスク一覧に移動する処理
            
        }catch(error) {
            //エラーをコンソールに出力
            console.error('ログインエラー：', error);
            //ユーザーにエラーを処理
            Alert.alert('エラー','ユーザー名またはパスワードが正しく表示されません')
        }
    };

    return()
}