
import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, SafeAreaView, Switch, Alert, Linking } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';


// テーマを使っている場合はこちらも
import { useAppTheme } from './theme'; 
import { getNotificationSetting, saveNotificationSetting } from './utils/setting';

// --- 2. Propsの型定義（元からあったものをそのまま利用）---
type SettingsScreenProps = {
  onLogout: () => void;
};

// --- 3. コンポーネント本体 ---
const SettingsScreen = ({ onLogout }: SettingsScreenProps) => {
  // --- 4. 必要なフック（道具）を準備 ---
  const navigation = useNavigation<any>();
  const theme = useAppTheme(); // テーマを使用（もし使っていなければこの行は不要です）

  // 【追加】通知スイッチの状態を覚えておくための変数
  const [isEnabled, setIsEnabled] = useState(true);

  // 【追加】画面が表示された時に、保存された設定を読み込む処理
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getNotificationSetting();
      setIsEnabled(settings.isEnabled);
    };
    loadSettings();
  }, []);
  
  // 【追加】スイッチが操作されたときの処理
  const handleToggleSwitch = async (newValue: boolean) => {
    if (newValue === true) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "通知が許可されていません",
          "スマートフォンの設定でこのアプリの通知を許可してください。",
          [
            { text: "あとで", style: "cancel" },
            { text: "設定を開く", onPress: () => Linking.openSettings() }
          ]
        );
        return; 
      }
    }
    setIsEnabled(newValue);
    await saveNotificationSetting({ isEnabled: newValue });
  };

  // --- 5. 画面に表示する内容（JSX） ---
  return (
    // SafeAreaViewの背景色は元の slate-100 ではなく、テーマ追従 or twrnc にしました。
    // 元に戻したい場合は bg-slate-100 に変更してください。
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={tw`p-4`}>
        <Text style={[tw`text-3xl font-bold mb-6`, { color: theme.colors.text }]}>
          設定
        </Text>
        
        {/* --- 元からあった「カテゴリー管理」機能 --- */}
        <TouchableOpacity 
          style={[tw`bg-white p-4 rounded-lg mb-4 shadow-sm`, {backgroundColor: theme.colors.card}]}
          onPress={() => navigation.navigate('CategorySettings')}
        >
          <Text style={[tw`text-lg`, {color: theme.colors.text}]}>カテゴリーを管理する</Text>
        </TouchableOpacity>

        {/* --- ★★★ ここに通知設定機能を追加 ★★★ --- */}
        <View style={[
            tw`bg-white p-4 rounded-lg mb-4 shadow-sm flex-row justify-between items-center`,
            {backgroundColor: theme.colors.card}
        ]}>
            <Text style={[tw`text-lg`, {color: theme.colors.text}]}>
                タスクの期日通知
            </Text>
            <Switch
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={'#f4f3f4'}
                onValueChange={handleToggleSwitch}
                value={isEnabled}
            />
        </View>

        {/* --- 元からあった「ログアウト」機能 --- */}
        <View style={tw`mt-8`}>
          <Button title="ログアウト" onPress={onLogout} color="gray" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;