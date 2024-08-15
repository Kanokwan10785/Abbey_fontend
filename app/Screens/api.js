import axios from 'axios';

const API_URL = 'http://192.168.1.183:1337'; // Replace with your Strapi URL

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

export const fetchFoodData = async () => {
  try {
    const response = await api.get('/api/food-items?populate=*');
    const formattedData = response.data.data.map(item => ({
      id: item.id,
      label: item.attributes.label,
      name: item.attributes.name,
      image: item.attributes.food?.data?.attributes?.formats?.large?.url,
      quantity: item.attributes.quantity,
    }));
    return formattedData;
  } catch (error) {
    console.error('Error fetching food data', error);
    throw error;
  }
};
