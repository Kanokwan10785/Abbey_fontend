import axios from 'axios';

const API_URL = 'http://192.168.1.183:1337'; // Replace with your Strapi URL

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

export const updateFoodQuantity = async (foodId, newQuantity) => {
  try {
    const response = await api.put(`/api/food-items/${foodId}?populate=*`, {
      data: {
        quantity: newQuantity,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating food quantity', error);
    throw error;
  }
};

export const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}?populate=*`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, data) => {
  try {
    const response = await api.put(`/api/users/${userId}`, {
      data: {
        username: data.username,
        weight: data.weight,
        height: data.height,
        birthday: data.birthday,
        age: data.age,
        selectedGender: data.selectedGender,  // ตรวจสอบว่าเราส่ง selectedGender
        profileImage: data.profileImage,      // ส่งรูปภาพโปรไฟล์
        // เพิ่มฟิลด์อื่นๆ ที่ต้องการอัปเดตได้ที่นี่
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile', error);
    throw error;
  }
};