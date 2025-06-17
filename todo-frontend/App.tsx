// App.tsx

import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc'; // twrncをインポート
import apiClient from './api';

type Task = {
  id:number;
  title: string;
  completed:boolean;
}

export default function App() {

  const [tasks,setTasks] = useState<Task[]>([]);

  //コンポーネントが最初に表示されたときに、タスクを表示する
  useEffect(()=> {
    const fetchTasks = async () => {
      try {
        const response = await apiClient.get('/tasks/');
        setTasks(response.data);
      }catch(error) {
        console.error(error)
      }
    };

    fetchTasks();
  }, []);
  
  return (
    <View style={tw`flex-1 items-center justify-center bg-slate-100`}>
      <Text style={tw`text-xl text-blue-600 font-bold`}>Hello, twrnc!</Text>
      <StatusBar style="auto" />
    </View>
  );
}