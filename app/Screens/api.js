import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.136:1337'; // Replace with your Strapi URL

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

// export const question = async (height, weight, birthday, gender, pet, userId) => {
//   try {
//     const jwt = await AsyncStorage.getItem('jwt');
//     if (!jwt) {
//       throw new Error('No JWT token found');
//     }

//     const response = await api.post('/api/personal-infors', {
//       data: {
//         height,
//         weight,
//         birthday,
//         gender,
//         pet,
//         user: userId,
//       }
//     }, {
//       headers: {
//         Authorization: `Bearer ${jwt}`,
//       }
//     });
    
//     return response.data;
//   } catch (error) {
//     console.error('Question error', error);
//     throw error;
//   }
// };