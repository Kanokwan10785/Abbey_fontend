import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useContext } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import coin from '../../../assets/image/coin.png';
import cancel from '../../../assets/image/cancel.png'
import { BalanceContext } from './../BalanceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Exercise4 = () => {
  const navigation = useNavigation();
  const { balance, setBalance } = useContext(BalanceContext);
  const route = useRoute();
  const [intervalId, setIntervalId] = useState(null);
  const { item } = route.params || {};
  const { dayNumber, weekId, set, isMissed } = route.params || {};

  // ตรวจสอบว่า item ถูกกำหนดค่าหรือไม่
  if (!item || !item.trophy) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  // console.log('Exercise4:', item);

  useEffect(() => {
    const updateBalanceOnce = async () => {
      // เพิ่มค่า item.trophy เข้าไปใน balance
      const updatedBalance = balance + item.trophy;
      setBalance(updatedBalance);  // อัปเดต balance ใน state

      // บันทึก balance ใหม่ลงใน AsyncStorage และส่งไปยังเซิร์ฟเวอร์
      try {
        await AsyncStorage.setItem('balance', updatedBalance.toString());
        await updateUserBalance(updatedBalance); // อัปเดต balance ไปยัง Backend
      } catch (error) {
        console.error('Error saving balance:', error);
      }
    };

    // เรียกใช้งานฟังก์ชันนี้ครั้งเดียว
    updateBalanceOnce();
  }, [dayNumber, weekId, set]);

  console.log('dayNumber, weekId ex4', dayNumber, weekId, set, isMissed)

  const updateUserBalance = async (newBalance) => {
    try {
      const token = await AsyncStorage.getItem('jwt');  // รับ JWT token
      const userId = await AsyncStorage.getItem('userId');  // รับ userId ของผู้ใช้

      const response = await fetch(`http://192.168.1.200:1337/api/users/${userId}`, {
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

  const checkAndAddBonus = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');
  
      // ดึงข้อมูล workout-records ของ user
      const response = await fetch(
        `http://192.168.1.200:1337/api/workout-records?filters[users_permissions_user][id][$eq]=${userId}&filters[week][id][$eq]=${weekId}&sort[0]=day`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
  
      // ตรวจสอบว่า 3 วันล่าสุดมี status = true หรือไม่
      const records = data.data;
      const lastThreeDays = records
        .filter(record => record.attributes.status === true)
        .slice(-3); // เลือก 3 วันล่าสุดที่ status = true
  
      if (lastThreeDays.length === 3) {
        // ถ้าครบ 3 วันต่อเนื่อง เพิ่มโบนัส
        const bonus = 2; // ตั้งค่าโบนัส
        const updatedBalance = balance + bonus;
  
        // อัปเดต balance ใน state และ backend
        setBalance(updatedBalance);
        await AsyncStorage.setItem('balance', updatedBalance.toString());
        await updateUserBalance(updatedBalance);
  
        console.log(`Bonus added: ${bonus} coins for 3-day streak!`);
      } else {
        console.log('No 3-day streak detected.');
      }
    } catch (error) {
      console.error('Error checking bonus:', error);
    }
  };

  const updateWorkoutRecord = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');
      const timestamp = new Date().toISOString();

      const status = isMissed ? false : true;

      const response = await fetch('http://192.168.1.200:1337/api/workout-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            users_permissions_user: userId,
            week: weekId,
            day: dayNumber,
            completed: true,
            status: status,
            timestamp: timestamp,
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Workout record updated successfully:', data);

        await checkAndAddBonus();

        return true; // Return success
      } else {
        console.error('Failed to update workout record:', data.error.message);
        return false;
      }
    } catch (error) {
      console.error('Error updating workout record:', error);
      return false;
    }
  };


  return (
    <View style={styles.container}>
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.closeButton}
      onPress={() => navigation.navigate('Homeexercise')}
    >
      <Image source={cancel} style={styles.close} />
    </TouchableOpacity>
    <View style={styles.coinsContainer}>
      <Image source={coin} style={styles.coin} />
      <Text style={styles.coinsText}>
        {balance !== null ? balance.toLocaleString() : "0"}
      </Text>
    </View>
  </View>

  <View style={styles.trophyContainer}>
    <Image
      source={require('../../../assets/image/trophy.png')}
      style={styles.trophyImage}
    />
    <View style={styles.coinRewardContainer}>
      <Image source={coin} style={styles.coin} />
      <Text style={styles.coinRewardText}>{item.trophy}</Text>
    </View>
  </View>

  {item.trophy > 0 && (
    <View style={styles.bonusContainer}>
      <Text style={styles.bonusTitle}>🎉 โบนัส ออกกำลังกาย 3 วันติด! 🎉</Text>
      <View style={styles.bonuscoinContainer}>
        <Image source={coin} style={styles.coin} />
        <Text style={styles.bonuscoinText}>{item.trophy}</Text>
      </View>
    </View>
  )}

  <TouchableOpacity
    style={styles.finishButton}
    onPress={() => {
      updateWorkoutRecord().then((success) => {
        if (success) {
          console.log('Record updated and navigating to Homeexercise');
          navigation.navigate('Homeexercise'); // นำทางไปหน้าหลัก
        } else {
          console.error('Failed to update record');
        }
      });
    }}
  >
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
    marginTop: 60
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
    marginTop: 60
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
  bonusContainer: {
    marginVertical: 40,
    backgroundColor:'rgba(255, 223, 0, 0.4)',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  bonusTitle: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'appfont_01',
  },
  bonuscoinContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    margin: 10,
    padding: 7,
    backgroundColor: '#FFA500',
    paddingHorizontal: 10,
    borderRadius: 25,
  },
  bonuscoinText: {
    fontFamily: 'appfont_01',
    fontSize: 18,
    marginLeft: 8,
    color: '#fff',
    marginHorizontal: 10,
  }
});

export default Exercise4;