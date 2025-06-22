import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { useTheme } from 'react-native-paper'; // paperからインポート
import tw from 'twrnc';

type StyledTextInputProps = {
  label: string;
} & TextInputProps;

const StyledTextInput = ({ label, ...props }: StyledTextInputProps) => {
  // react-native-paper のテーマを取得
  const theme = useTheme();

  return (
    <View style={tw`mb-4`}>
      {/* ラベル部分 */}
      <Text style={[tw`text-lg mb-2 font-semibold`, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
      
      {/* テキスト入力部分 */}
      <TextInput
        style={[
          tw`border rounded-lg p-3`,
          // ▼▼▼ theme.colors から色を指定するように修正 ▼▼▼
          { 
            borderColor: theme.colors.outline, 
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          },
          props.multiline && { height: 128, textAlignVertical: 'top' }
        ]}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        {...props}
      />
    </View>
  );
};

export default StyledTextInput;