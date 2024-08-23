import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from 'react-native';
import dollar from '../../assets/image/dollar-01.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile } from './api'; // Import ฟังก์ชันที่ใช้ดึงข้อมูลจาก API

const DollarIcon = () => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const loadUserProfile = async () => {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) return;

      try {
        const userData = await fetchUserProfile(userId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBalance(userData.balance); // อัปเดตค่า balance จากข้อมูลที่ได้รับ
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    };

    loadUserProfile();
  }, []); // useEffect จะทำงานเพียงครั้งเดียวเมื่อคอมโพเนนต์ถูกโหลด

  return (
    <View style={styles.currencyContainer}>
      <View style={styles.currencyBackground}>
      <Text style={styles.currencyText}> {balance}</Text>
        <Image source={dollar} style={styles.currencyIcon} />
      </View>
    </View>
  );
};

  
const styles = StyleSheet.create({
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyBackground: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  currencyText: {
    fontSize: 18,
    marginRight: 16,
    fontFamily: 'appfont_02',
  },
  currencyIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: -5,
  },
});
export default DollarIcon;