import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from "../api";
import tw from 'twrnc';


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

    return(
        <View style={tw`{flex-1 justify-centent items-center bg-slate-100 p-8}`}>
            <Text style={tw`{text-3xl font-bold mb-8}`}>ログイン</Text>

            <TextInput
            style={tw`w-full bg-white border border-gray-300 rounded-lg p-3 mb-4`}
            placeholder="ユーザー名"
            onChangeText={setUsername}
            autoCapitalize="none"
            />

            <TextInput
            style={tw`w-full bg-white border-gray-300 roundedlg p-3 mb-6`}
            placeholder="パスワード"
            value={password}
            onChangeText={setPassWord}
            secureTextEntry
            />

            <Button title="ログイン" onPress={handleLogin} />

            {/*Todo :　新規登録画面へのナビゲーションボタンを追加 */}
        </View>
    );
};

export default LoginScreen;