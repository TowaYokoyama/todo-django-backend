import axios from 'axios'

/*const API_URL = 'http://192.168.0.11:8000/api/';*/
// api.ts
const API_URL = 'http://localhost:8000/api/'; // または 'http://127.0.0.1:8000/api/'

const apiClient = axios.create({
    baseURL: API_URL,
});

export default apiClient;