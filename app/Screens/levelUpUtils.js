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
    let expThreshold = calculateExpToLevelUp(newLevel);
    let remainingExp = currentExp; // เก็บค่า EXP ที่เหลือ
  
    console.log(`🔍 ตรวจสอบการเลเวลอัป: EXP ปัจจุบัน ${currentExp}, Level ปัจจุบัน ${newLevel}, ต้องใช้ EXP ${expThreshold}`);
  
    while (remainingExp >= expThreshold) {
      remainingExp -= expThreshold; // ใช้ EXP เพื่ออัปเลเวล
      newLevel += 1;
      expThreshold = calculateExpToLevelUp(newLevel);
      console.log(`⬆️ เลเวลอัป! Level ใหม่: ${newLevel}, EXP คงเหลือ: ${remainingExp}, ต้องใช้ EXP ถัดไป: ${expThreshold}`);
    }
  
    if (newLevel !== currentLevel) {
      console.log(`🎉 เลเวลอัป! เรียก onLevelUp ใหม่: Level ${newLevel}`);
      onLevelUp(newLevel);
      DeviceEventEmitter.emit('levelUp', { newLevel });
    } else {
      console.log(`✅ ไม่มีการเปลี่ยนแปลง Level`);
    }
  
    const userId = await AsyncStorage.getItem('userId');
    await updateUserExpLevel(userId, remainingExp, newLevel);
  
    return newLevel;
};