import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://172.30.81.13:1337'; // Replace with your Strapi URL

const api = axios.create({
  baseURL: API_URL,
});

export const login = async (username, password) => {
  try {
    const response = await api.post('/api/auth/local', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Login error', error);
    throw error;
  }
};

export const register = async (username, email, password,height, weight,age,selectedGender,selectPet) => {
  try {
    const response = await api.post('/api/auth/local/register', {
      username,
      email,
      password,
      height, 
      weight,
      age,
      selectedGender,
      selectPet
    });
    return response.data;
  } catch (error) {
    console.error('Register error', error);
    throw error;
  }
};


export const getDailyExercise = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/daily-exercises?populate=exercise`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily exercise', error);
    throw error;
  }
};