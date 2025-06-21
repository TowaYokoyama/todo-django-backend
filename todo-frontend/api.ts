import axios from 'axios';
import { Platform } from 'react-native';

// あなたのPCのIPアドレス
const YOUR_COMPUTER_IP = '192.168.0.11'; 

const API_BASE_URL = Platform.OS === 'android' 
  ? `http://10.0.2.2:8000`
  : `http://${YOUR_COMPUTER_IP}:8000`; 

// インスタンスを作成して、エクスポートするだけ。
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;