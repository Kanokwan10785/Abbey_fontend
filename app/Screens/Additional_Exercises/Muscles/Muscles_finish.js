import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import coin from '../../../../assets/image/coin.png';
import cancel from '../../../../assets/image/cancel.png';
import { useRoute } from '@react-navigation/native';
import { BalanceContext } from '../../BalanceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mapping for exercise level names
const exerciseMapping = {
  "6": "legs_advanced",
  "5": "legs_intermediate",
  "4": "legs_beginner",
  "3": "arms_advanced",
  "2": "arms_intermediate",
  "1": "arms_beginner",
  "12": "back_advanced",
  "11": "back_intermediate",
  "10": "back_beginner",
  "9": "chest_advanced",
  "8": "chest_intermediate",
  "7": "chest_beginner",
};

const mapExerciseLevel = (musclesId) => exerciseMapping[musclesId] || "unknown";

const Muscles_finish = () => {
  const navigation = useNavigation();
  const { balance, setBalance } = useContext(BalanceContext);
  const route = useRoute();
  const { item, items, currentIndex, musclesId } = route.params || {};

  if (!item) {
    console.error("Item is undefined");
    return (
      <View style={styles.container}>
        <Text>Loading item...</Text>
      </View>
    );
  }

  if (!item.trophy) {
    console.error("Trophy is undefined in item");
    return (
      <View style={styles.container}>
        <Text>Loading trophy...</Text>
      </View>
    );
  }

  useEffect(() => {
    const updateBalanceOnce = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updatedBalance = balance + item.trophy;
      setBalance(updatedBalance);

      try {
        await AsyncStorage.setItem('balance', updatedBalance.toString());
        await updateUserBalance(updatedBalance);
      } catch (error) {
        console.error('Error saving balance:', error);
      }
    };

    updateBalanceOnce();
  }, []);

  const updateUserBalance = async (newBalance) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');

      const response = await fetch(`http://192.168.1.200:1337/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ balance: newBalance }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to update balance:', error.message);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const updateWorkoutRecord = async () => {
    try {
        const token = await AsyncStorage.getItem('jwt');
        const userId = await AsyncStorage.getItem('userId');
        const timestamp = new Date().toISOString();

        // Map musclesId to exercise level and workout records
        const mappedExerciseLevel = mapExerciseLevel(musclesId);

        // Validate mappings
        if (mappedExerciseLevel === "unknown") {
            console.error("Invalid mapping for musclesId:", musclesId);
            return false;
        }

        // 1. สร้าง workout record ใหม่
        const workoutRecordResponse = await fetch('http://192.168.1.200:1337/api/workout-records', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                data: {
                    users_permissions_user: userId,
                    exercise_level: musclesId, // ID จริง
                    exercise_levels: mappedExerciseLevel, // คีย์ที่สัมพันธ์
                    timestamp, // บันทึกเวลาการออกกำลังกาย
                },
            }),
        });

        const workoutRecordData = await workoutRecordResponse.json();
        if (!workoutRecordResponse.ok) {
            console.error('สร้าง workout record ไม่สำเร็จ:', workoutRecordData.error?.message || workoutRecordData);
            return false;
        }

        // console.log('สร้าง workout record สำเร็จ:', workoutRecordData);

        // 2. ดึง `exercise_levels` ที่มีอยู่ของผู้ใช้
        const userResponse = await fetch(`http://192.168.1.200:1337/api/users/${userId}?populate=exercise_levels`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        const userData = await userResponse.json();
        if (!userResponse.ok) {
            console.error('ดึงข้อมูลผู้ใช้ล้มเหลว:', userData.error?.message || userData);
            return false;
        }

        // ตรวจสอบว่าข้อมูล exercise_levels มีอยู่หรือไม่
        const existingExerciseLevels = userData?.data?.exercise_levels?.map((level) => level.id) || [];
        // console.log('Existing exercise levels:', existingExerciseLevels);

        // เพิ่ม ID ใหม่เข้าไปใน `exercise_levels`
        const updatedExerciseLevels = [...new Set([...existingExerciseLevels, musclesId])]; // ใช้ Set เพื่อป้องกันการซ้ำกัน

        // 3. อัปเดตผู้ใช้ด้วย `exercise_levels` ที่อัปเดตแล้ว
        const userUpdateResponse = await fetch(`http://192.168.1.200:1337/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                exercise_levels: updatedExerciseLevels, // ต้องส่งเป็น array ของ ID
            }),
        });

        const userUpdateData = await userUpdateResponse.json();
        if (!userUpdateResponse.ok) {
            console.error('อัปเดต exercise_levels ของผู้ใช้ล้มเหลว:', userUpdateData.error?.message || userUpdateData);
            return false;
        }

        console.log('อัปเดต exercise_levels ของผู้ใช้สำเร็จ:', userUpdateData);
        return true;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัปเดต exercise_levels:', error);
        return false;
    }
};


  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Musclesexercies', { musclesId })}>
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
      <TouchableOpacity
        style={styles.finishButton}
        onPress={() => {
          updateWorkoutRecord().then(() => {
            navigation.navigate('Musclesexercies', { item, items, currentIndex, musclesId });
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

export default Muscles_finish;
