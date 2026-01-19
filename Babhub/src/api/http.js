import axios from 'axios';

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '';
console.log('API BASE URL:', process.env.EXPO_PUBLIC_API_BASE_URL);

const http = axios.create({
  baseURL,
  withCredentials: true,
});

export default http;
