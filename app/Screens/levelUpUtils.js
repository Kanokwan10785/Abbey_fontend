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
  
    console.log(`🔍 ตรวจสอบการเลเวลอัป: EXP ปัจจุบัน ${currentExp}, Level ปัจจุบัน ${newLevel}, ต้องใช้ EXP ${expThreshold}`);
  
    while (currentExp >= expThreshold) {
      newLevel += 1;
      expThreshold = calculateExpToLevelUp(newLevel);
      console.log(`⬆️ เลเวลอัป! Level ใหม่: ${newLevel}, ต้องใช้ EXP ถัดไป: ${expThreshold}`);
    }
  
    if (newLevel !== currentLevel) {
      console.log(`🎉 เรียกใช้งาน onLevelUp! เลเวลใหม่: ${newLevel}`);
      onLevelUp(newLevel);

      // 📢 แจ้งเตือนว่าเลเวลอัปโดยใช้ DeviceEventEmitter
      DeviceEventEmitter.emit('levelUp', { newLevel });
      console.log(`🚀 DeviceEventEmitter: ส่ง event "levelUp" ด้วยค่า: Level ${newLevel}`);
    } else {
      console.log(`✅ ไม่มีการเปลี่ยนแปลง Level`);
    }
  
    const userId = await AsyncStorage.getItem('userId');
    await updateUserExpLevel(userId, currentExp, newLevel);
  
    return newLevel;
};
