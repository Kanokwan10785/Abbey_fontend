import axios from 'axios';

const API_URL = 'http://172.30.89.67:1337'; // Replace with your Strapi URL

const api = axios.create({
  baseURL: API_URL,
});

export const login = async (identifier, password) => {
  try {
    const response = await api.post('/api/auth/local', {
      identifier,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error', error);
    throw error;
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await api.post('/api/auth/local/register', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Register error', error);
    throw error;
  }
};

