// MainScreen.tsx の一番上の方
import { Button, SafeAreaView, Text, View } from 'react-native';
import tw from 'twrnc';
// propsの型定義を追加
type MainScreenProps = {
  onLogout: () => void;
};

// コンポーネント定義を修正して、propsを受け取る
export default function MainScreen({ onLogout }: MainScreenProps) {
  // ... tasks, newTitleなどのstate宣言はそのまま ...

  // return 文の中、<Text>タスク一覧</Text> の隣あたりにボタンを追加
  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      <View style={tw`p-4`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-2xl font-bold`}>タスク一覧</Text>
          <Button title="ログアウト" onPress={onLogout} color="gray" />
        </View>
        {/* ... それ以下の部分は変更なし ... */}
      </View>
    </SafeAreaView>
  );
}