import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; // Platformをインポート

// ▼▼▼ ここをあなたのPCのIPアドレスに書き換えてください ▼▼▼
const YOUR_COMPUTER_IP = '192.168.0.11'; // 例：先ほど確認したIPアドレス

// OSを自動判別し、適切なAPIのURLを決定します。
const API_BASE_URL = Platform.OS === 'android' 
  ? `http://10.0.2.2:8000` // Android "エミュレータ" 用の特別なアドレス
  : `http://${YOUR_COMPUTER_IP}:8000`; // iOSシミュレータや実機はこちら

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ▼▼▼ このインターセプター部分は変更不要です ▼▼▼
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;