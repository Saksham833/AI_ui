import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const sendPrompt = (prompt: string) =>
  api.post('/chat', { prompt });
