import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import cancel from '../../../../assets/image/cancel.png';
import { BalanceContext } from '../../BalanceContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import coin from '../../../../assets/image/coin.png';
import { Image } from 'expo-image';
import { API_BASE_URL } from './../apiConfig.js';

const Muscles_relax = () => {
  const navigation = useNavigation();
  const { balance, setBalance } = useContext(BalanceContext);
  const [currentWeekCoins, setCurrentWeekCoins] = useState(0);
  const route = useRoute();
  const { item, items, currentIndex, musclesId } = route.params || {};
  const [alertMessage, setAlertMessage] = useState('');
  const [time, setTime] = useState(3); // นับถอยหลัง 3 วินาทีสำหรับการพักผ่อน
  const [intervalId, setIntervalId] = useState(null);

  // console.log('musclesId in couse relax:', musclesId);

  if (!item || !items) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  useEffect(() => {
    const fetchCurrentWeekCoins = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        const userId = await AsyncStorage.getItem('userId');

        const response = await fetch(`http://192.168.1.125:1337/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        const weekCoins = userData.currentWeekCoins || 0;
        setCurrentWeekCoins(weekCoins);
      } catch (error) {
        console.error('Error fetching currentWeekCoins:', error);
      }
    };
    fetchCurrentWeekCoins();
    setTime(5); // รีเซ็ตเวลาเมื่อเริ่มต้นใหม่

    const id = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime === 3) {
          // อัปเดต balance เมื่อเหลือเวลา 3 วินาที
          updateBalance();
        }

        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(id);
          if (currentIndex < items.length - 1) {
            navigation.navigate('Muscles_start', { item: items[currentIndex + 1], items, currentIndex: currentIndex + 1, musclesId });
          } else {
            navigation.navigate('Muscles_finish', { item, items, currentIndex, musclesId });
          }
          return 0;
        }
      });
    }, 1000);

    setIntervalId(id);

    return () => clearInterval(id);
  }, [currentIndex]);

  const updateBalance = async () => {
    if (currentWeekCoins === null) {
      console.error('CurrentWeekCoins is not initialized yet.');
      return;
    }

    const updatedBalance = balance + item.dollar;

    setCurrentWeekCoins((prevCoins) => {
      const updatedWeekCoins = prevCoins + item.dollar;

      if (prevCoins + item.dollar <= 15) {
        console.log(`currentWeekCoins + item.dollar <= 15 : ${prevCoins} +  ${item.dollar} <= 15 `);
        setBalance(updatedBalance);
        setAlertMessage('');
      }

      if (updatedWeekCoins > 15) {
        setAlertMessage('คุณสะสมเหรียญครบ 15 เหรียญในสัปดาห์นี้!');
        return prevCoins; // คืนค่าเดิมแทน undefined
      }

      setTimeout(() => {
        console.log('✅ API Update:', { balance: updatedBalance, currentWeekCoins: updatedWeekCoins });
        updateUserBalance(updatedBalance, updatedWeekCoins);
      }, 0);

      return updatedWeekCoins;

    });

    try {
      await AsyncStorage.setItem('balance', updatedBalance.toString());
    } catch (error) {
      console.error('Error saving balance:', error);
    }
  };

  const updateUserBalance = async (newBalance, newWeekCoins) => {
    try {
      const token = await AsyncStorage.getItem('jwt');  // รับ JWT token
      const userId = await AsyncStorage.getItem('userId');  // รับ userId ของผู้ใช้

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          balance: newBalance,
          currentWeekCoins: newWeekCoins,
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

  const handleNext = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (currentIndex < items.length) {
      navigation.navigate('Muscles_start', { item: items[currentIndex + 1], items, currentIndex: currentIndex + 1, musclesId });
    } else {
      navigation.navigate('Muscles_finish', { item, items, currentIndex, musclesId });
    }
  };

  const handlePrevious = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (currentIndex > 0) {
      navigation.navigate('Muscles_start', { item: items[currentIndex - 1], items, currentIndex: currentIndex - 1, musclesId });
    } else {
      navigation.navigate('Muscles_start', { item: items[0], items, currentIndex: 0, musclesId });
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      <View style={styles.exerciseContainer}>
        <View style={styles.exerciseImageContainer}>
          <Image source={{ uri: items[currentIndex + 1]?.animation }} style={styles.exerciseImage} />
        </View>
        <View style={styles.exerciseDetails}>
          <Text style={styles.exerciseCounter}>ท่าถัดไป</Text>
          <Text style={styles.exerciseTitle}>{items[currentIndex + 1]?.name}</Text>
        </View>
      </View>
      <Text style={styles.timer}>พักผ่อน</Text>
      <Text style={styles.timer}>{formatTime(time)}</Text>
      <View style={styles.trophyContainer}>
        <View style={styles.coinRewardContainer}>
          <Image source={coin} style={styles.coin} />
          <Text style={styles.coinRewardText}>{item.dollar}</Text>
        </View>
      </View>
      {alertMessage && (
        <Text style={[styles.alertMessage]}>
          {alertMessage}
        </Text>
      )}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
          <Icon name="chevron-left" size={60} color="#808080" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <Icon name="chevron-right" size={60} color="#FFA500" />
        </TouchableOpacity>
      </View>
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
  closeButton: {
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  close: {
    width: 35,
    height: 35,
  },
  exerciseContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  exerciseImageContainer: {
    borderColor: '#FFA500',
    borderWidth: 3,
    alignItems: 'center',
    marginVertical: 20,
  },
  exerciseImage: {
    width: 350,
    height: 250,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  exerciseTitle: {
    fontSize: 22,
    fontFamily: 'appfont_01',
  },
  exerciseCounter: {
    fontSize: 18,
    color: '#808080',
    fontFamily: 'appfont_01',
    flex: 1,
  },
  timer: {
    fontSize: 48,
    marginVertical: 10,
    fontFamily: 'appfont_01',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  coin: {
    width: 30,
    height: 30,
  },
  coinsContainer: {
    backgroundColor: '#FFA500',
    padding: 5,
    margin: 10,
    borderRadius: 25,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsText: {
    fontSize: 18,
    marginLeft: 8,
    fontFamily: 'appfont_01',
    color: '#fff',
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
  alertMessage: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'appfont_01',
    textAlign: 'center',
  },
});

export default Muscles_relax;
