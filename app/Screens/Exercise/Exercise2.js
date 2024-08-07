import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import cancel from '../../../assets/image/cancel.png';

const Exercise2 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item, items, currentIndex } = route.params || {};

  if (!item || !items) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  const [time, setTime] = useState(3); // นับถอยหลัง 3 วินาทีสำหรับการพักผ่อน
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    setTime(3); // รีเซ็ตเวลาเมื่อเริ่มต้นใหม่

    const id = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(id);
          if (currentIndex < items.length - 1) {
            navigation.navigate('Exercise1', { item: items[currentIndex + 1], items, currentIndex: currentIndex + 1 }); // ไปยังท่าถัดไป
          } else {
            navigation.navigate('Exercise4'); // ไปยังหน้าสิ้นสุดการออกกำลังกาย
          }
          return 0;
        }
      });
    }, 1000);
    setIntervalId(id);

    return () => clearInterval(id);
  }, [currentIndex]);

  const handleNext = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (currentIndex < items.length - 1) {
      navigation.navigate('Exercise1', { item: items[currentIndex + 1], items, currentIndex: currentIndex + 1 });
    } else {
      navigation.navigate('Exercise4');
    }
  };

  const handlePrevious = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (currentIndex > 0) {
      navigation.navigate('Exercise1', { item: items[currentIndex - 1], items, currentIndex: currentIndex - 1 });
    } else {
      navigation.navigate('Exercise1', { item: items[0], items, currentIndex: 0 });
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('ExerciseScreen')}>
        <Image source={cancel} style={styles.close} />
      </TouchableOpacity>
      <View style={styles.exerciseContainer}>
        <View style={styles.exerciseImageContainer}>
          <Image source={items[currentIndex + 1]?.image} style={styles.exerciseImage} />
        </View>
        <Text style={styles.exerciseTitle}>{items[currentIndex + 1]?.name}</Text>
        <Text style={styles.exerciseCounter}>{currentIndex + 2}/{items.length}</Text>
      </View>
      <Text style={styles.timer}>พักผ่อน</Text>
      <Text style={styles.timer}>{formatTime(time)}</Text>
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
});

export default Exercise2;
