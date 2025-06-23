// components/StyledButton.tsx

import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { useTheme } from 'react-native-paper';
import tw from 'twrnc';

type StyledButtonProps = {
  title: string;
} & TouchableOpacityProps;

const StyledButton = ({ title, style, ...props }: StyledButtonProps) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[
        tw`py-3 px-6 rounded-lg justify-center items-center shadow-sm w-full`,
        { backgroundColor: '#8B5CF6' },
        style, 
      ]}
      {...props} // ★ onPressなどのpropsは、ここに正しく渡されています
    >
      <Text style={[
        tw`text-lg font-bold`,
        { color: theme.colors.onPrimary } 
      ]}>
        
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default StyledButton;