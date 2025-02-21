import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserExpLevel } from './api';
import { DeviceEventEmitter } from 'react-native';

// ฟังก์ชันคำนวณ EXP ที่ต้องใช้ในการเลื่อนระดับ
export const calculateExpToLevelUp = (level) => {
  return 100 + (level * 50);
};

// ฟังก์ชันตรวจสอบเลเวลจาก EXP สะสม และอัปเดตลงฐานข้อมูล
export const updateLevelBasedOnExp = async (currentExp, currentLevel, onLevelUp) => {
  let newLevel = currentLevel;
  let expForNextLevel = calculateExpToLevelUp(newLevel);

  while (currentExp >= expForNextLevel) {
    currentExp -= expForNextLevel;
    newLevel += 1;
    expForNextLevel = calculateExpToLevelUp(newLevel);
    console.log(`🔼 Level Up! New Level: ${newLevel}, Remaining EXP: ${currentExp}, Next Level EXP: ${expForNextLevel}`);
  }

  if (newLevel !== currentLevel) {
    console.log(`🎉 Level Up Triggered! Level: ${newLevel}`);
    onLevelUp(newLevel);
    DeviceEventEmitter.emit('levelUp', { newLevel });
    DeviceEventEmitter.emit('expUpdated'); // แจ้งเตือนให้โหลด EXP ใหม่
  }

  const userId = await AsyncStorage.getItem('userId');
  await updateUserExpLevel(userId, currentExp, newLevel);

  return { newLevel, currentExp, expForNextLevel };
};
