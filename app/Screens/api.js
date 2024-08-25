import axios from 'axios';

const API_URL = 'http://192.168.1.117:1337'; // Replace with your Strapi URL 

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

// ฟังก์ชันการดึงข้อมูลอาหารที่ผู้ใช้มี
export const fetchUserFoodData = async (userId) => {
  try {
    // เรียกข้อมูลจาก shop-items เพื่อดึงชื่อและ URL ของ image
    const shopResponse = await api.get(`/api/shop-items?populate[image][fields][0]=url&[fields][0]=name`);

    // เรียกข้อมูลจาก pet-food-items เพื่อดึงชื่ออาหารและข้อมูลอื่นๆ ของผู้ใช้
    const petFoodResponse = await api.get(`/api/pet-food-items?filters[user][id][$eq]=${userId}&populate[choose_food][fields][0]=name`);

    // สร้างแผนที่เพื่อให้เข้าถึง URL ได้ง่าย
    const shopItemsMap = shopResponse.data.data.reduce((map, item) => {
      map[item.attributes.name] = item.attributes.image?.data?.attributes?.url || null;
      return map;
    }, {});

    // รวมข้อมูลจากทั้งสอง API
    const foodItems = petFoodResponse.data.data?.map(item => {
      const chooseFoodName = item.attributes.choose_food?.data?.attributes?.name;
      const imageUrl = shopItemsMap[chooseFoodName] || null;

      return {
        id: item.id,
        name: chooseFoodName, // ใช้ชื่อจาก choose_food
        quantity: item.attributes.quantity,
        image: imageUrl, // ดึง URL ของ image จาก shop-items ถ้ามี
      };
    }) || [];

    return foodItems;
  } catch (error) {
    console.error('Error fetching user food data', error);
    throw error;
  }
};

// ฟังก์ชันการอัปเดตจำนวนอาหาร
export const updateFoodQuantity = async (itemId, newQuantity) => {
  try {
    const response = await axios.put(`${API_URL}/api/pet-food-items/${itemId}`, {
      data: { quantity: newQuantity },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating pet food item quantity', error);
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
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers, // รวม header จาก config
    },
    body: JSON.stringify(data),
  });

  return response; // ตรวจสอบให้แน่ใจว่าส่งคืนค่า response โดยตรง
};

// ฟังก์ชันการอัปโหลดไฟล์
export const uploadFile = async (formData, token) => {
  try {
    const uploadResponse = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }

    const uploadData = await uploadResponse.json();
    return uploadData; // ส่งคืนข้อมูลที่ได้จากการอัปโหลด
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// ฟังก์ชันใหม่สำหรับดึงข้อมูลรายการสินค้าจาก API
export const fetchItemsData = async () => {
  try {
    const response = await api.get('/api/shop-items?populate=image,pet_food_items,clothing_items');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching items data', error);
    return [];
  }
};