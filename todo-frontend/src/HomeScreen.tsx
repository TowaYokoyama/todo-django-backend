// screens/HomeScreen.tsx

import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import tw from 'twrnc';

const HomeScreen = () => {
  return (
    <SafeAreaView style={tw`flex-1 justify-center items-center`}>
      <Text style={tw`text-2xl`}>ホーム画面</Text>
    </SafeAreaView>
  );
};

export default HomeScreen;