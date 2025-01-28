import React, { useState, useEffect, useContext } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import coin from '../../../assets/image/coin.png';
import cancel from '../../../assets/image/cancel.png';
import { BalanceContext } from './../BalanceContext';
import { API_BASE_URL } from './apiConfig.js';

const Exercise4 = () => {
  const navigation = useNavigation();
  const { balance, setBalance } = useContext(BalanceContext);
  const route = useRoute();
  const { item } = route.params || {};
  const { dayNumber, weekId, set, isMissed, dayDate } = route.params || {};
  const [bonusMessage, setBonusMessage] = useState(''); // ข้อความ
  const [bonusMessageColor, setBonusMessageColor] = useState('#FFA500'); // สีข้อความ
  const [localBalance, setLocalBalance] = useState(balance); // เก็บค่า balance ภายใน component

  if (!item || !item.trophy) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  useEffect(() => {
    processWorkoutAndBonus();
  }, [dayNumber, weekId, set, dayDate]);
  console.log(`dayDate:  ${dayDate}`)

  const processWorkoutAndBonus = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');

      // ดึงข้อมูลผู้ใช้จาก Strapi
      const userResponse = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userResponse.json();

      let { currentWeekCoins = 0,resetDate } = userData;
      
      const currentDate = new Date(dayDate);
      resetDate = resetDate ? new Date(resetDate) : null;

      console.log(`currentDate:  ${currentDate}, resetDate: ${resetDate}`);

      if (!resetDate || currentDate >= resetDate) {
        currentWeekCoins = 0; // รีเซ็ตเหรียญ
        resetDate = new Date(currentDate);
        resetDate.setDate(resetDate.getDate() + 7); // ตั้ง resetDate เป็นอีก 7 วันข้างหน้า
        console.log(`Resetting week coins. Next reset date: ${resetDate.toISOString()}`);
      }

      const rewardCoins = item.trophy;

      // ตรวจสอบเหรียญสะสมในสัปดาห์
      if (currentWeekCoins + rewardCoins > 15) {
        setBonusMessage('คุณสะสมเหรียญครบ 15 เหรียญในสัปดาห์นี้!');
        setBonusMessageColor('red');
        // บันทึกข้อมูลการออกกำลังกาย แต่ไม่เพิ่มเหรียญ
        await updateWorkoutRecord();
        return;
      }


      // เพิ่มเหรียญรางวัล
      currentWeekCoins += rewardCoins;

      let updatedBalance = localBalance;
      console.log(`เพิ่มเหรียญรางวัล currentWeekCoins: ${currentWeekCoins}`);

      // ตรวจสอบโบนัส
      const isContinuous = await checkContinuousWorkout();
      if (isContinuous) {
        if (currentWeekCoins + 2 <= 15) {
          updatedBalance += 2; // เพิ่มโบนัส 2 เหรียญ
          currentWeekCoins += 2;
          setBonusMessage('คุณได้รับโบนัส 2 เหรียญจากการออกกำลังกายต่อเนื่อง!');
        } else {
          setBonusMessage('คุณสะสมเหรียญครบ 15 เหรียญในสัปดาห์นี้!');
          setBonusMessageColor('red');
        }
      }

      // อัปเดต balance
      updatedBalance += rewardCoins;
      setLocalBalance(updatedBalance);
      setBalance(updatedBalance);
      await AsyncStorage.setItem('balance', updatedBalance.toString());

      // อัปเดตข้อมูลใน Strapi
      await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          balance: updatedBalance,
          currentWeekCoins,
          resetDate: resetDate.toISOString(),
        }),
      });

      // บันทึกข้อมูลการออกกำลังกาย
      await updateWorkoutRecord();

      console.log(`Updated balance: ${updatedBalance}, currentWeekCoins: ${currentWeekCoins}`);
    } catch (error) {
      console.error('Error processing workout and bonus:', error);
    }
  };


  // console.log('Dayexercise: Received params:', { dayDate});

  const updateUserBalance = async (newBalance) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}?pagination[limit]=100`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ balance: newBalance }),
      });
      const data = await response.json();
      // console.log('API Response:', data);
      if (!response.ok) {
        console.log('Failed to update balance:', data.message);
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
      const status = isMissed ? false : true;

      console.log('Updating workout record for user:', userId);
      // console.log('Week ID:', weekId, 'Day Number:', dayNumber, 'Status:', status);

      const response = await fetch(`${API_BASE_URL}/api/workout-records?pagination[limit]=100`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

      if (!response.ok) {
        const data = await response.json();
        console.error('Failed to update workout record:', data.error.message);
      } else {
        console.log('Workout record updated successfully at:', timestamp);
      }
    } catch (error) {
      console.error('Error updating workout record:', error);
    }
  };


  const checkContinuousWorkout = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(
        `${API_BASE_URL}/api/workout-records?filters[users_permissions_user][id][$eq]=${userId}&populate=*&pagination[limit]=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        console.error('Failed to fetch workout records:', data.error.message);
        return false;
      }

      const records = data.data;

      // console.log('Fetched workout records:', records);

      // เรียงลำดับ records ตาม week และ day
      const sortedRecords = records.sort((a, b) => {
        const weekA = a.attributes.week?.data?.id || 0;
        const weekB = b.attributes.week?.data?.id || 0;
        const dayA = a.attributes.day?.data?.attributes?.dayNumber || 0;
        const dayB = b.attributes.day?.data?.attributes?.dayNumber || 0;

        if (weekA !== weekB) {
          return weekA - weekB;
        }
        return dayA - dayB;
      });

      // console.log('Sorted workout records:', sortedRecords);

      // ตรวจสอบว่า week และ day ปัจจุบันถูกบันทึกแล้วหรือไม่
      const currentRecord = sortedRecords.find(
        (r) =>
          r.attributes.week?.data?.id === weekId &&
          r.attributes.day?.data?.attributes?.dayNumber === dayNumber
      );

      if (currentRecord) {
        console.log(
          `Current week (${weekId}) and day (${dayNumber}) already exist in records. Bonus will not be given.`
        );
        return false; // หากเคยบันทึก week/day นี้แล้ว จะไม่ให้โบนัส
      }

      // ตรวจสอบ 3 วันที่ต่อเนื่องก่อนหน้า
      for (let i = 1; i <= 3; i++) {
        const targetDay = dayNumber - i;

        if (targetDay <= 0) {
          console.log(`Skipping day ${targetDay} (invalid day).`);
          return false;
        }

        const record = sortedRecords.find(
          (r) =>
            r.attributes.week?.data?.id === weekId &&
            r.attributes.day?.data?.attributes?.dayNumber === targetDay
        );

        if (!record) {
          console.log(`No record found for Week ${weekId}, Day ${targetDay}.`);
          return false;
        }

        if (record.attributes.status === false) {
          console.log(
            `Record found for Week ${weekId}, Day ${targetDay} with status = false. No bonus will be given.`
          );
          return false;
        }

        console.log(`Record found for Week ${weekId}, Day ${targetDay}:`, record);
      }

      console.log('All previous 3 days are completed with status = true.');
      return true;
    } catch (error) {
      console.error('Error checking continuous workout:', error);
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
            {localBalance !== null ? localBalance.toLocaleString() : '0'}
          </Text>
        </View>
      </View>
      <View style={styles.trophyContainer}>
        <Image source={require('../../../assets/image/trophy.png')} style={styles.trophyImage} />
        <View style={styles.coinRewardContainer}>
          <Image source={coin} style={styles.coin} />
          <Text style={styles.coinRewardText}>{item.trophy}</Text>
        </View>
        {bonusMessage && (
          <Text style={[styles.bonusMessage, { color: bonusMessageColor }]}>
            {bonusMessage}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.finishButton}
        onPress={() => navigation.navigate('Homeexercise')}
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
    marginVertical: 20,
  },
  coinRewardText: {
    fontFamily: 'appfont_01',
    fontSize: 18,
    color: '#FFF',
    marginLeft: 8,
    marginHorizontal: 10,
  },
  bonusMessage: {
    fontSize: 16,
    color: '#FFA500',
    marginTop: 20,
    textAlign: 'center',
    fontFamily: 'appfont_01',
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

export default Exercise4;