import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import cancel from '../../../../assets/image/cancel.png';

const Arm_start = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item, items, currentIndex } = route.params || {};

  if (!item || !items) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  const [isRunning, setIsRunning] = useState(true);
  const [time, setTime] = useState(10); // นับถอยหลัง 10 วินาทีสำหรับการออกกำลังกาย
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    // รีเซ็ตเวลาเมื่อเริ่มต้นใหม่หรือเปลี่ยนท่าทาง และเริ่มนับถอยหลังอัตโนมัติ
    setTime(10);
    setIsRunning(true);

    const id = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(id);
          setIsRunning(false);
          // ไปยังหน้าพักผ่อน 3 วินาทีถ้าไม่ใช่ท่าสุดท้าย
          if (currentIndex < items.length - 1) {
            navigation.navigate('Arm_relax', { item, items, currentIndex });
          } else {
            navigation.navigate('Arm_finish');
          }
          return 0;
        }
      });
    }, 1000);
    setIntervalId(id);

    return () => clearInterval(id);
  }, [currentIndex, navigation, items]);

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalId);
    }
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    const id = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(id);
          setIsRunning(false);
          // ไปยังหน้าพักผ่อน 3 วินาทีถ้าไม่ใช่ท่าสุดท้าย
          if (currentIndex < items.length - 1) {
            navigation.navigate('Arm_relax', { item, items, currentIndex });
          } else {
            navigation.navigate('Arm_finish');
          }
          return 0;
        }
      });
    }, 1000);
    setIntervalId(id);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleNext = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (currentIndex < items.length - 1) {
      navigation.navigate('Arm_relax', { item, items, currentIndex });
    } else {
      navigation.navigate('Arm_finish');
    }
  };

  const handlePrevious = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (currentIndex > 0) {
      navigation.navigate('', { item: items[currentIndex - 1], items, currentIndex: currentIndex - 1 });
    } else {
      navigation.navigate('Armexercies');
    }
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
        <Image source={item.image} style={styles.exerciseImage} />
        </View>
        <Text style={styles.exerciseTitle}>{item.name}</Text>
        <Text style={styles.exerciseCounter}>{currentIndex + 1}/{items.length}</Text>
      </View>
      <Text style={styles.timer}>{formatTime(time)}</Text>
      <View style={styles.controlContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={handleStart}>
          <Icon name="play" size={50} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
          <Icon name="stop" size={50} color="#FFF" />
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
  exerciseTitle: {
    fontSize: 25,
    marginVertical: 20,
    fontFamily: 'appfont_01',
  },
  exerciseCounter: {
    fontSize: 18,
    color: '#808080',
    fontFamily: 'appfont_01',
  },
  timer: {
    fontSize: 48,
    marginVertical: 20,
    fontFamily: 'appfont_01',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
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
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
});

export default Arm_start;
  