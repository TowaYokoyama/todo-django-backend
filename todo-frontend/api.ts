import axios from 'axios'

const API_URL = 'http://192.168.0.11:8000/api/';

const apiClient = axios.create({
    baseURL: API_URL,
});

export default apiClient;