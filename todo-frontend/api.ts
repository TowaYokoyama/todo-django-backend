import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 例としてAsyncStorage使用

const YOUR_COMPUTER_IP = '192.168.0.11';

const API_BASE_URL = Platform.OS === 'android'
  ? `http://10.0.2.2:8000`
  : `http://${YOUR_COMPUTER_IP}:8000`;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプターでトークンを追加
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken'); // 保存したトークンを取得

      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (e) {
      console.error('トークン取得またはヘッダー設定中にエラー:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
