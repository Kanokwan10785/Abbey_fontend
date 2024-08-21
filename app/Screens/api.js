import axios from 'axios';

const API_URL = 'http://172.20.10.5:1337'; // Replace with your Strapi URL

const api = axios.create({
  baseURL: API_URL,
});

// ฟังก์ชันการล็อกอิน รับ JWT token และข้อมูลผู้ใช้
export const login = async (identifier, password) => {
  try {
    const response = await api.post('/api/auth/local', {
      identifier,
      password,
    });
    return response.data; // response.data จะมีทั้ง jwt และข้อมูล user
  } catch (error) {
    console.error('Login error', error);
    throw error;
  }
};

// ฟังก์ชันการลงทะเบียน
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
    console.error('Register error details:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// ฟังก์ชันการดึงข้อมูลการออกกำลังกาย
export const getDailyExercise = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/daily-exercises?populate=exercise`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily exercise', error);
    throw error;
  }
};

// ฟังก์ชันการดึงข้อมูลอาหาร
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

// ฟังก์ชันการอัปเดตจำนวนอาหาร
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

// ฟังก์ชันการดึงข้อมูลโปรไฟล์ผู้ใช้ โดยรับ token ใน headers
export const fetchUserProfile = async (userId, config = {}) => {
  try {
    const response = await api.get(`/api/users/${userId}?populate=*`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile', error);
    throw error;
  }
};

// ฟังก์ชันการอัปเดตข้อมูลโปรไฟล์ผู้ใช้ 
export const updateUserProfile = async (userId, data, config) => {
  const response = await fetch(`http://172.20.10.5:1337/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers, // รวม header จาก config
    },
    body: JSON.stringify(data),
  });

  return response; // ตรวจสอบให้แน่ใจว่าส่งคืนค่า response โดยตรง
};


// ฟังก์ชันการอัปเดตข้อมูลรูปโปรไฟล์ผู้ใช้