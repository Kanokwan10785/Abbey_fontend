import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.199:1337';

const api = axios.create({
  baseURL: API_URL,
});

export const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) throw new Error('User ID not found');
    return parseInt(userId, 10); // แปลงเป็นตัวเลข
  } catch (error) {
    console.error('Error retrieving user ID:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับค้นหา Record ในวันเดียวกัน
export const findRecordByDate = async (userId, date) => {
  try {
    const response = await api.get(`/api/weight-records`, {
      params: {
        'filters[user][id][$eq]': userId,
        'filters[date][$eq]': date,
      },
    });

    if (response.data.data.length > 0) {
      return response.data.data[0]; // ส่งคืน record ที่พบ
    }
    return null; // หากไม่พบ
  } catch (error) {
    console.error('Error finding record by date:', error.response?.data || error.message);
    throw error;
  }
};

// ฟังก์ชันสำหรับทำการแก้ไข ในวันเดียวกัน
export const updateWeightRecord = async (recordId, weightValue) => {
  try {
    const response = await api.put(`/api/weight-records/${recordId}`, {
      data: { weight: weightValue },
    });
    return response.data; // ส่งกลับข้อมูลหลังอัปเดตสำเร็จ
  } catch (error) {
    console.error('Error updating weight record:', error.response?.data || error.message);
    throw error;
  }
};

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
    // console.log('saveWeightRecord response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error saving weight record:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับบันทึกข้อมูลน้ำหนักของผู้ใช้
export const saveWeightUesr = async (weight, userId) => {
  try {
    const response = await api.put(`/api/users/${userId}`, {
      weight,
    });
    return response.data;
  } catch (error) {
    console.error('Error in saveWeightUesr:', error.response?.data || error.message);
    throw error;
  }
};

// ฟังก์ชันนี้ทำหน้าที่อัปเดตส่วนสูงและ BMI ของผู้ใช้
export const saveHeightUesr = async (height, bmi, userId) => {
  // console.log('Uesr :',height, bmi, userId);
  try {
    const response = await api.put(`/api/users/${userId}`, {
      height,
      BMI: bmi, // อัปเดตค่าดัชนีมวลกาย
    });
    // console.log('saveHeightUesr response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in saveHeightUesr:', error.response?.data || error.message);
    throw error;
  }
};
