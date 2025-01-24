import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import cancel from '../../../assets/image/cancel.png';
import { Image } from 'expo-image';

const Startex = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { items,dayNumber, weekId,set, isMissed } = route.params || {};
  const item = items ? items[0] : null;
  const [isRunning, setIsRunning] = useState(true);
  const [time, setTime] = useState(3); // นับถอยหลัง 5 วินาทีสำหรับการออกกำลังกาย
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    setTime(3);
    setIsRunning(true);
  }, [item,dayNumber, weekId,set, isMissed]);


  useEffect(() => {
    if (time === 0 && !isRunning) {
      // นำทางเมื่อเวลาหมด
      navigation.navigate('Exercise1', { items, currentIndex: 0, dayNumber, weekId, set, isMissed });
    }
  }, [time, isRunning, navigation]);
  
  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(id);
            setIsRunning(false);
            return 0;
          }
        });
      }, 1000);
  
      setIntervalId(id);
  
      return () => clearInterval(id);
    }
  }, [isRunning]);  

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleNext = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    navigation.navigate('Exercise1', { items, currentIndex: 0,dayNumber, weekId,set, isMissed }); // ไปยังหน้า Exercise1 ทันทีเมื่อกดปุ่มไปข้างหน้า
  };

  const handlePrevious = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    navigation.navigate('Dayexercise',{dayNumber, weekId,set, isMissed}); // กลับไปยังหน้า ExerciseScreen เมื่อกดปุ่มไปข้างหลัง
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Dayexercise',{items,dayNumber, weekId,set, isMissed})}>
        <Image source={cancel} style={styles.close} />
      </TouchableOpacity>
      <View style={styles.exerciseContainer}>
        <View style={styles.exerciseImageContainer}>
          <Image source={{ uri: item.animation }} style={styles.exerciseImage} />
        </View>
        <Text style={styles.Title}>Ready go!</Text>
        <Text style={styles.exerciseTitle}>{item.name}</Text>
      </View>
      <Text style={styles.timer}>{formatTime(time)}</Text>
      <View style={styles.controlContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handleStartPause}>
          <Icon name={isRunning ? "pause" : "play"} size={50} color="#FFF" />
        </TouchableOpacity>
      </View>
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
    borderWidth: 3,
    borderColor: '#FFA500',
    alignItems: 'center',
    marginVertical: 20,
  },
  exerciseImage: {
    width: 350,
    height: 250,
  },
  Title: {
    fontSize: 35,
    color: '#FFA500',
    fontFamily: 'appfont_02',
  },
  exerciseTitle: {
    fontSize: 25,
    marginTop: 20,
    // marginVertical: 20,
    fontFamily: 'appfont_01',
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
    position: 'absolute', // จัดตำแหน่งเป็นแบบ absolute
    bottom: 60, // ชิดกับด้านล่างของหน้าจอ (ปรับค่าตามที่ต้องการ)
    paddingHorizontal: 20, // เพิ่ม padding แนวนอนเพื่อให้มีระยะห่างจากขอบจอ
  },
  navButton: {
    padding: 10,
  },
  controlContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: '#FFA500',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 10,
  },
});

export default Startex;
