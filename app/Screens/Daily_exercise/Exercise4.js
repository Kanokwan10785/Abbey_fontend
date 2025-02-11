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
  const [bonusMessage, setBonusMessage] = useState('');
  const [bonusMessageColor, setBonusMessageColor] = useState('#FFA500');
  const [localBalance, setLocalBalance] = useState(balance);
  const [exp, setExp] = useState(0);
  const [expText, setExpText] = useState(0);

  if (!item || !item.trophy) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  useEffect(() => {
    const loadExpAndBalance = async () => {
      const savedExp = await AsyncStorage.getItem('exp');
      setExp(savedExp ? parseInt(savedExp, 10) : 0);
      const savedWeekExp = await AsyncStorage.getItem('currentWeekExp');
      setExpText(savedWeekExp ? parseInt(savedWeekExp, 10) : 0);
    };
    loadExpAndBalance();
    processWorkoutAndBonus();
  }, [dayNumber, weekId, set, dayDate]);

  // console.log(`dayDate:  ${dayDate}`)
  // console.log(`item ${item.exp}`);

  const processWorkoutAndBonus = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');

      // 🔄 ดึงข้อมูลผู้ใช้จาก Strapi
      const userResponse = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userResponse.json();

      let { currentWeekCoins = 0, currentWeekExp = 0, EXP = 0, resetDate } = userData;
      console.log(`✅ ข้อมูลก่อนอัปเดต: currentWeekCoins: ${currentWeekCoins}, currentWeekExp: ${currentWeekExp}, EXP: ${EXP}, resetDate: ${resetDate}`);

      const currentDate = new Date(dayDate);
      resetDate = resetDate ? new Date(resetDate) : null;

      // ✅ รีเซ็ตเหรียญและ EXP หากถึงวันรีเซ็ต
      if (!resetDate || currentDate >= resetDate) {
        currentWeekCoins = 0;
        currentWeekExp = 0;
        resetDate = new Date(currentDate);
        resetDate.setDate(resetDate.getDate() + 7);
        console.log(`🔄 Resetting week coins: ${resetDate.toISOString()}`);
      }

      const rewardCoins = item.trophy;
      const rewardExp = item.exp;
      console.log(`🎁 Reward Coins: ${rewardCoins}, Reward EXP: ${rewardExp}`);

      let bonusMessages = [];

      // ✅ ตรวจสอบ EXP สะสมในสัปดาห์
      if (currentWeekExp > 15) {
        bonusMessages.push('สะสม EXP ครบ 400 ในสัปดาห์นี้');
      } else {
        currentWeekExp += rewardExp;
        EXP += rewardExp;
      }

      // ✅ ตรวจสอบเหรียญสะสมในสัปดาห์
      let updatedBalance = localBalance;
      if (currentWeekCoins > 150) {
        bonusMessages.push('สะสมเหรียญครบ 150 เหรียญในสัปดาห์นี้');
      } else {
        currentWeekCoins += rewardCoins;
        updatedBalance += rewardCoins;
      }

      // ✅ ตรวจสอบโบนัสออกกำลังกายต่อเนื่อง
      const isContinuous = await checkContinuousWorkout();
      if (isContinuous && currentWeekCoins + 2 <= 15) {
        updatedBalance += 2;
        currentWeekCoins += 2;
        bonusMessages.push('ได้รับโบนัส 2 เหรียญจากการออกกำลังกายต่อเนื่อง');
      }

      // ✅ อัปเดตค่าในแอป
      setBonusMessage(bonusMessages);
      setBonusMessageColor(bonusMessages.length > 0 ? 'red' : '#FFA500');
      setBalance(updatedBalance);
      setExpText(currentWeekExp);
      setExp(EXP);
      setLocalBalance(updatedBalance);

      // ✅ บันทึกค่าใน AsyncStorage
      await AsyncStorage.setItem('balance', updatedBalance.toString());
      await AsyncStorage.setItem('exp', EXP.toString());
      await AsyncStorage.setItem('currentWeekExp', currentWeekExp.toString());

      // ✅ ส่งค่าไปยัง API
      console.log("🛠 กำลังอัปเดตข้อมูลใน Strapi...");
      await updateUserBalance(updatedBalance, currentWeekCoins, EXP, currentWeekExp, resetDate);

      // ✅ บันทึก workout record
      await updateWorkoutRecord();
    } catch (error) {
      console.error('❌ Error processing workout and bonus:', error);
    }
  };

  /**
   * 📤 อัปเดตข้อมูล Balance, EXP และเหรียญไปยัง Strapi
   */
  const updateUserBalance = async (balance, weekCoins, exp, weekExp, resetDate) => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          balance,
          currentWeekCoins: weekCoins,
          currentWeekExp: weekExp,
          resetDate: resetDate.toISOString(),
          EXP: exp,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('❌ ไม่สามารถอัปเดตข้อมูลใน Strapi', data);
      } else {
        console.log(`✅ อัปเดตข้อมูลสำเร็จ: Balance: ${balance}, currentWeekCoins: ${weekCoins}, currentWeekExp: ${weekExp}, EXP: ${exp}`);
      }
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาดขณะอัปเดตข้อมูล:', error);
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

      let validRecords = 0

      // ตรวจสอบ 3 วันที่ต่อเนื่องก่อนหน้า
      for (let i = 1; i <= 3; i++) {
        const targetDay = dayNumber - i;

        if (targetDay < 1) {
          console.log(`Skipping day ${targetDay} (invalid day).`);
          continue; // ❗ ข้ามวันนั้นไปแต่ไม่ return false
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
        validRecords++;
        console.log(`Record found for Week ${weekId}, Day ${targetDay}:`, record);
      }

      if (validRecords >= 3) {
        console.log('🎉 โบนัสออกกำลังกายต่อเนื่องสำเร็จ!');
        return true;
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
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Image source={coin} style={styles.statIcon} />
            <Text style={styles.statText}>{localBalance?.toLocaleString() || '0'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>EXP:</Text>
            <Text style={styles.statText}>{exp}</Text>
          </View>
        </View>
      </View>
      <View style={styles.trophyContainer}>
        <Image source={require('../../../assets/image/trophy.png')} style={styles.trophyImage} />
        <View style={styles.statsContainer}>
          <View style={styles.coinRewardContainer}>
            <Image source={coin} style={styles.statIcon} />
            <Text style={styles.coinRewardText}>+{item.trophy}</Text>
          </View>
          <View style={styles.coinRewardContainer}>
            <Text style={styles.coinRewardText}>EXP : +{item.exp}</Text>
          </View>
        </View>
        {bonusMessage && bonusMessage.map((message, index) => (
          <Text key={index} style={[styles.bonusMessage, { color: bonusMessageColor }]}>
            {message}
          </Text>
        ))}
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
    alignItems: 'center',
    marginTop: 20,
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  close: {
    width: 35,
    height: 35,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    // marginVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 25,
    padding: 5,
  },
  statIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
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
    marginTop: 40,
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
    marginTop: 30,
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
  expBarContainer: {
    width: '80%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  expBar: {
    height: '100%',
    backgroundColor: '#FFA500',
  },
  expText: {
    fontSize: 16,
    fontFamily: 'appfont_01',
    color: '#808080',
  },
});

export default Exercise4;