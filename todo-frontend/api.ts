import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Webブラウザでの開発では、'localhost'が使えます。
const API_BASE_URL = 'http://localhost:8000'; // または 'http://127.0.0.1:8000'

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ★★★ このインターセプター部分はWebでも必須です ★★★
apiClient.interceptors.request.use(
  async (config) => {
    // AsyncStorageから認証トークンを取得
    const token = await AsyncStorage.getItem('authToken');
    
    // もしトークンがあれば、リクエストヘッダーにAuthorization情報を追加
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // 改造したリクエスト設定を返す
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;