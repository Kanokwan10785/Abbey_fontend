import axios from 'axios';

const API_URL = 'http://192.168.1.199:1337';

const api = axios.create({
  baseURL: API_URL,
});

export const fetchUserWeight = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`, {
      params: {
        fields: ['username', 'weight'],
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user weight:', error);
    throw error;
  }
};

export const postWeightRecord = async (weight, date) => {
  try {
    const response = await api.post('/api/weight-records', {
      weight,
      date,
    });
    return response.data;
  } catch (error) {
    console.error('Error posting weight record:', error);
    throw error;
  }
};
