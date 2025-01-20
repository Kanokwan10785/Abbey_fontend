import axios from 'axios';

const API_URL = 'http://192.168.1.199:1337';

const api = axios.create({
  baseURL: API_URL,
});

// ฟังก์ชันสำหรับดึงข้อมูลน้ำหนัก
export const fetchWeightRecords = async (userId) => {
  try {
    const response = await api.get(`/api/weight-records`, {
      params: {
        'populate[user][fields][0]': 'username',
        'fields': ['date', 'weight'],
        'pagination[limit]': 100,
      },
    });
    return response.data.data.filter(item => item.attributes.user.data.id === userId);
  } catch (error) {
    console.error('Error fetching weight records:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับบันทึกข้อมูลน้ำหนัก
export const saveWeightRecord = async (weight, date, userId) => {
  try {
    const response = await api.post(`/api/weight-records`, {
      data: {
        weight,
        date,
        user: userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving weight record:', error);
    throw error;
  }
};
