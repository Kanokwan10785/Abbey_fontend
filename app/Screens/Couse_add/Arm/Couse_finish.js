import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import coin from '../../../../assets/image/coin.png';
import cancel from '../../../../assets/image/cancel.png'
import { useRoute } from '@react-navigation/native';
import { BalanceContext } from '../../BalanceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Couse_finish = () => {
  const navigation = useNavigation();
  const { balance, setBalance } = useContext(BalanceContext);
  const route = useRoute();
  const [intervalId, setIntervalId] = useState(null);
  const { item,items, currentIndex} = route.params || {};

   // ตรวจสอบว่า item ถูกกำหนดค่าหรือไม่
   if (!item || !item.trophy) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  useEffect(() => {

    const id = setInterval(async () => {

      // เพิ่มค่า item.dollar เข้าไปใน balance
      const updatedBalance = balance + item.trophy;
      setBalance(updatedBalance);  // อัปเดต balance ใน state

      // บันทึก balance ใหม่ลงใน AsyncStorage และส่งไปยังเซิร์ฟเวอร์
      try {
        await AsyncStorage.setItem('balance', updatedBalance.toString());
        await updateUserBalance(updatedBalance); // อัปเดต balance ไปยัง Backend
      } catch (error) {
        console.error('Error saving balance:', error);

      }
    }, 1000);
    setIntervalId(id);

    return () => clearInterval(id);
  }, [currentIndex, items, navigation]);

  const updateUserBalance = async (newBalance) => {
    try {
      const token = await AsyncStorage.getItem('jwt');  // รับ JWT token
      const userId = await AsyncStorage.getItem('userId');  // รับ userId ของผู้ใช้

      const response = await fetch(`http://192.168.1.174:1337/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',  // กำหนดประเภทของข้อมูลที่ส่งไปยังเซิร์ฟเวอร์
          'Authorization': `Bearer ${token}`,  // ส่ง JWT token เพื่อยืนยันตัวตน
        },
        body: JSON.stringify({
          balance: newBalance,  // ส่ง balance ที่อัปเดตไปยัง Backend
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Balance updated successfully:', data);
      } else {
        console.log('Failed to update balance:', data.message);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };





  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}
        onPress={() => navigation.navigate('Armexercies')}>
          <Image source={cancel} style={styles.close} />
        </TouchableOpacity>
        <View style={styles.coinsContainer}>
          <Image source={coin} style={styles.coin} />
          <Text style={styles.coinsText}>{balance !== null ? balance.toLocaleString() : "0"}</Text>
        </View>
      </View>
      <View style={styles.trophyContainer}>
        <Image source={require('../../../../assets/image/trophy.png')} style={styles.trophyImage} />
        <View style={styles.coinRewardContainer}>
          <Image source={coin} style={styles.coin} />
          <Text style={styles.coinRewardText}>{item.trophy}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.finishButton}
        onPress={() => navigation.navigate('Armexercies')}>
        <Text style={styles.finishButtonText}>เสร็จสิ้น</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  closeButton: {
    marginTop: 20,
  },
  close: {
    width: 35,
    height: 35,
  },
  coin: {
    width: 30,
    height: 30,
  },
  coinsContainer: {
    backgroundColor: '#FFA500',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 25,
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  coinsText: {
    fontSize: 18,
    marginLeft: 8,
    fontFamily: 'appfont_01',
    color: '#fff',
  },
  trophyContainer: {
    alignItems: 'center',
    marginVertical: 70,
  },
  trophyImage: {
    width: 200,
    height: 200,
    marginTop: 80,
  },
  coinRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    padding: 8,
    borderRadius: 25,
    marginVertical: 60,
  },
  coinRewardText: {
    fontFamily: 'appfont_01',
    fontSize: 18,
    color: '#FFF',
    marginLeft: 8,
    marginHorizontal: 10,
  },
  finishButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    borderRadius: 50,
    width: 320,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'appfont_01',
  },
});

export default Couse_finish;
