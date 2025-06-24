import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SafeAreaView, View, Text, Alert, ActivityIndicator, FlatList, TouchableOpacity, Modal, Button } from 'react-native';
import tw from 'twrnc';
import { useIsFocused } from '@react-navigation/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import type { MarkedDates } from 'react-native-calendars/src/types';
import DropDownPicker from 'react-native-dropdown-picker';
import apiClient from '../api';
import { useAppTheme } from './theme';
import { Ionicons } from '@expo/vector-icons';

// --- 型定義 ---
type Task = {
  id: number;
  title: string;
  due_date: string | null;
  completed: boolean;
};

// --- 日本語化の設定 ---
LocaleConfig.locales['jp'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: "今日"
};
LocaleConfig.defaultLocale = 'jp';


const CalendarScreen = () => {
  const theme = useAppTheme();
  const isFocused = useIsFocused();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [calendarMonth, setCalendarMonth] = useState(new Date().toISOString().substring(0, 7) + '-01');
  const [isPickerModalVisible, setPickerModalVisible] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth() + 1);
  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);

  useEffect(() => {
    if (isFocused) {
      const fetchTasks = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.get<Task[]>('/tasks/');
          setTasks(response.data);
        } catch (error) {
          console.error('カレンダー用タスク取得エラー:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTasks();
    }
  }, [isFocused]);

  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};
    tasks.forEach(task => {
      if (task.due_date) {
        marks[task.due_date] = { marked: true, dotColor: theme.colors.primary };
      }
    });
    if (selectedDate) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: theme.colors.primary };
    }
    return marks;
  }, [tasks, selectedDate, theme.colors.primary]);

  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return tasks.filter(task => task.due_date === selectedDate);
  }, [tasks, selectedDate]);

  const yearItems = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => ({ label: `${currentYear - 5 + i}年`, value: currentYear - 5 + i }));
  }, []);

  const monthItems = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, value: i + 1 }));
  }, []);

  const handleApplyMonthChange = () => {
    const newMonth = pickerMonth < 10 ? `0${pickerMonth}` : pickerMonth;
    const newDate = `${pickerYear}-${newMonth}-01`;
    setCalendarMonth(newDate);
    setPickerModalVisible(false);
  };

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString === selectedDate ? '' : day.dateString);
  };

  if (isLoading) { return <ActivityIndicator style={tw`flex-1 justify-center items-center`} size="large" />; }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.colors.background }]}>
      <Modal visible={isPickerModalVisible} transparent={true} animationType="fade">
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50 p-4`}>
          <View style={[tw`w-full p-6 rounded-lg`, { backgroundColor: theme.colors.card }]}>
            <Text style={[tw`text-xl font-bold mb-4 text-center`, { color: theme.colors.text }]}>年月を選択</Text>
            <DropDownPicker open={yearOpen} value={pickerYear} items={yearItems} setOpen={setYearOpen} setValue={setPickerYear} onOpen={() => setMonthOpen(false)} zIndex={2000} />
            <View style={tw`mt-4`}>
              <DropDownPicker open={monthOpen} value={pickerMonth} items={monthItems} setOpen={setMonthOpen} setValue={setPickerMonth} onOpen={() => setYearOpen(false)} zIndex={1000} />
            </View>
            <View style={tw`flex-row justify-end mt-6`}>
              <Button title="キャンセル" onPress={() => setPickerModalVisible(false)} />
              <View style={tw`w-4`} />
              <Button title="適用" onPress={handleApplyMonthChange} />
            </View>
          </View>
        </View>
      </Modal>

      <View style={tw`p-4`}>
        <Text style={[tw`text-3xl font-bold`, { color: theme.colors.text }]}>カレンダー</Text>
      </View>
      
      <Calendar
        key={calendarMonth}
        current={calendarMonth}
        renderHeader={(date) => {
          const headerText = `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
          return (
            <TouchableOpacity onPress={() => setPickerModalVisible(true)} style={tw`p-2`}>
              <View style={tw`flex-row items-center justify-center`}>
                <Text style={[tw`text-xl font-bold`, { color: theme.colors.primary }]}>{headerText}</Text>
                <Ionicons name="caret-down" size={16} color={theme.colors.primary} style={tw`ml-2`} />
              </View>
            </TouchableOpacity>
          );
        }}
        onDayPress={onDayPress}
        markingType={'dot'}
        markedDates={markedDates}
        theme={{ backgroundColor: theme.colors.background, calendarBackground: theme.colors.background, textSectionTitleColor: theme.colors.onSurfaceVariant, selectedDayBackgroundColor: theme.colors.primary, selectedDayTextColor: '#ffffff', todayTextColor: theme.colors.primary, dayTextColor: theme.colors.text, textDisabledColor: theme.colors.onSurfaceVariant, arrowColor: theme.colors.primary, monthTextColor: theme.colors.text }}
      />
      
      <View style={tw`p-4 border-b border-t border-gray-200 dark:border-gray-800`}>
        <Text style={[tw`text-xl font-bold`, { color: theme.colors.text }]}>{selectedDate ? `${selectedDate} のタスク` : '日付を選択してください'}</Text>
      </View>

      <FlatList
        style={tw`flex-1 px-4`}
        data={tasksForSelectedDate}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[tw`p-3 rounded-lg mb-2 flex-row items-center`, { backgroundColor: theme.colors.onSurfaceVariant }]}>
            <Ionicons name={item.completed ? "checkmark-circle" : "ellipse-outline"} size={22} color={item.completed ? 'green' : theme.colors.primary} />
            <Text style={[tw`ml-3 text-base`, { color: theme.colors.onSurface }]}>{item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<View style={tw`pt-4`}><Text style={{ color: theme.colors.onSurfaceVariant }}>{selectedDate ? 'この日のタスクはありません。' : ''}</Text></View>}
      />
    </SafeAreaView>
  );
};

export default CalendarScreen;