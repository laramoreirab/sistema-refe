import api from '../config/api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  async login(email, senha) {
    // Ajuste os nomes dos campos conforme o AuthController.js do backend
    const response = await api.post('/login', { email, senha });
    if (response.data.token) {
      await SecureStore.setItemAsync('user_token', response.data.token);
    }
    return response.data;
  },

  async cadastrar(dados) {
    // Exemplo: { nome, email, matricula, senha }
    const response = await api.post('/usuarios', dados);
    return response.data;
  },

  async logout() {
    await SecureStore.deleteItemAsync('user_token');
  },
};