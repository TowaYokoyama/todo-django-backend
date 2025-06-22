import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper'; // themeは文字色などに使うため残します
import tw from 'twrnc';

type StyledButtonProps = {
  title: string;
} & TouchableOpacityProps;

const StyledButton = ({ title, style, ...props }: StyledButtonProps) => {
  // 文字色などにテーマを使う可能性があるので、themeの取得は残しておきます
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        tw`py-3 px-6 rounded-lg justify-center items-center shadow-sm w-full`,
        
        // ▼▼▼ ここの色を直接、紫色のコードに書き換えます ▼▼▼
        { backgroundColor: '#8B5CF6' }, // 紫色の例 (Tailwind CSSの violet-500)
        
        style, 
      ]}
      {...props}
    >
      <Text style={[
        tw`text-lg font-bold`,
        // 文字色はテーマの白（onPrimary）のままにしておくと、見やすいです
        { color: theme.colors.onPrimary } 
      ]}>
          保存
      </Text>
    </TouchableOpacity>
  );
};

export default StyledButton;