import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';
import { useAppTheme } from '../theme';
import tw from 'twrnc';

// このコンポーネントが受け取るpropsの型定義
type StyledDropdownProps = {
  label: string;
  items: ItemType<any>[];
  open: boolean;
  value: any;
  setOpen: (open: boolean) => void;
  setValue: (callback: (prev: any) => any) => void;
  onOpen?: () => void; // onOpenを受け取れるように追加
  zIndex?: number;
};

const StyledDropdown = ({
  label, items, open, value, setOpen, setValue, onOpen, zIndex = 1,
}: StyledDropdownProps) => {
  const theme = useAppTheme();

  return (
    <View style={{ zIndex }}>
      <Text style={[tw`text-lg mb-2 font-semibold`, { color: theme.colors.text }]}>{label}</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={(val) => setOpen(typeof val === 'function' ? val(false) : val)}
        setValue={setValue}
        onOpen={onOpen} // 受け取ったonOpenを渡す
        
        listMode="MODAL"
        style={{
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        }}
        textStyle={{
          color: theme.colors.text,
          fontSize: 16,
        }}
        placeholder="選択してください..."
        dropDownContainerStyle={{
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        }}
        arrowIconStyle={{ width: 20, height: 20 }}
        tickIconStyle={{ width: 20, height: 20 }}
      />
    </View>
  );
};

export default StyledDropdown;