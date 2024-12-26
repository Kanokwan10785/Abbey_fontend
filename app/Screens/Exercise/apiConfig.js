const API_BASE_URL = 'http://192.168.1.123:1337/api';

export const API_ENDPOINTS = {
  updateUserBalance: (userId) => `${API_BASE_URL}/users/${userId}`,
  createWorkoutRecord: `${API_BASE_URL}/workout-records`,
  fetchUserExerciseLevels: (userId) => `${API_BASE_URL}/users/${userId}?populate=exercise_levels`,
};

export default API_ENDPOINTS;
