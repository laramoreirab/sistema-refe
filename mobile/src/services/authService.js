import api from '../config/api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  async login(email, senha) {
    // Ajuste a rota e os campos conforme definido em backend/routes/rotas.js
    const response = await api.post('/login', { email, senha });
    
    if (response.data.token) {
      await SecureStore.setItemAsync('user_token', response.data.token);
    }
    return response.data;
  },

  async logout() {
    await SecureStore.deleteItemAsync('user_token');
  },

  async getToken() {
    return await SecureStore.getItemAsync('user_token');
  }
};