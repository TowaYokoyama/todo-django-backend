import React from 'react';
import { View, Text, Button } from 'react-native';
import tw from 'twrnc';

// MainScreenと同様に、onLogoutを受け取るようにしておく
type ProfileScreenProps = {
  onLogout: () => void;
};

const ProfileScreen = ({ onLogout }: ProfileScreenProps) => {
  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Text style={tw`text-2xl font-bold mb-4`}>プロフィール画面</Text>
      <Button title="ログアウト" onPress={onLogout} />
    </View>
  );
};

export default ProfileScreen;