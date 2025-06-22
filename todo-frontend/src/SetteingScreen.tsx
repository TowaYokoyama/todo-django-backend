import React from 'react';
import { View, Text, Button, TouchableOpacity, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';

type SettingsScreenProps = {
  onLogout: () => void;
};

const SettingsScreen = ({ onLogout }: SettingsScreenProps) => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-3xl font-bold mb-6`}>設定</Text>
        
        <TouchableOpacity 
          style={tw`bg-white p-4 rounded-lg mb-4 shadow-sm`}
          onPress={() => navigation.navigate('CategorySettings')}
        >
          <Text style={tw`text-lg`}>カテゴリーを管理する</Text>
        </TouchableOpacity>

        <View style={tw`mt-8`}>
          <Button title="ログアウト" onPress={onLogout} color="gray" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;