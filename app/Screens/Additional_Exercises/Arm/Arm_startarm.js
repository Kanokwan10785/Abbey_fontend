import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import cancel from '../../../../assets/image/cancel.png';

const Arm_startarm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { items } = route.params || {};

  // ใช้รายการแรกเป็น item ที่ต้องการแสดง
  const item = items ? items[0] : null;

  if (!item) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  const [isRunning, setIsRunning] = useState(true);
  const [time, setTime] = useState(3); // นับถอยหลัง 3 วินาทีสำหรับการออกกำลังกาย

  useEffect(() => {
    setTime(3);  // รีเซ็ตเวลาเมื่อ item เปลี่ยน
    setIsRunning(true);
  }, [item]);

  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(id);  // ให้แน่ใจว่า interval ถูกล้างเมื่อเวลาหมด
            setIsRunning(false);
            navigation.navigate('Arm_start', { items, currentIndex: 0 });
            return 0;
          }
        });
      }, 1000);
  
      // ล้าง interval เมื่อคอมโพเนนต์ unmount หรือ `isRunning` เปลี่ยนค่า
      return () => clearInterval(id);
    }
  }, [isRunning, navigation, items]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleNext = () => {
    navigation.navigate('Arm_start', { items, currentIndex: 0 }); // ไปยังหน้า Exercise1 ทันทีเมื่อกดปุ่มไปข้างหน้า
  };

  const handlePrevious = () => {
    navigation.navigate('Armexercies'); // กลับไปยังหน้า Armexercies เมื่อกดปุ่มไปข้างหลัง
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Armexercies')}>
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

export default Arm_startarm;
