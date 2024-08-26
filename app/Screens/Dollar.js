import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from 'react-native';
import dollar from '../../assets/image/dollar-01.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile } from './api'; // Import ฟังก์ชันที่ใช้ดึงข้อมูลจาก API

const DollarIcon = () => {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        // โหลดยอดเงินเก่าจาก AsyncStorage
        const storedBalance = await AsyncStorage.getItem('balance');
        if (storedBalance !== null) {
          setBalance(parseFloat(storedBalance));
        }

        // ดึงข้อมูลยอดเงินล่าสุดจาก API
        const token = await AsyncStorage.getItem('jwt');
        const userId = await AsyncStorage.getItem('userId');
        if (!token || !userId) return;

        const userData = await fetchUserProfile(userId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const newBalance = userData.balance;
        setBalance(newBalance); // อัปเดตยอดเงินใน state
        await AsyncStorage.setItem('balance', newBalance.toString()); // บันทึกยอดเงินล่าสุดใน AsyncStorage
      } catch (error) {
        console.error("Error loading balance", error);
      }
    };

    loadBalance();
  }, []); // useEffect จะทำงานเพียงครั้งเดียวเมื่อคอมโพเนนต์ถูกโหลด

  return (
    <View style={styles.currencyContainer}>
      <View style={styles.currencyBackground}>
        <Text style={styles.currencyText}>
          {balance !== null ? balance.toLocaleString() : "0"} 
        </Text>
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