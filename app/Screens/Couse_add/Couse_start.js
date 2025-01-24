import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import cancel from '../../../assets/image/cancel.png';
import { Image } from 'expo-image';

const Couse_start = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { items, currentIndex,courseId } = route.params || {};

  useEffect(() => {
    // console.log('Received currentIndex in couse :', currentIndex);
    // console.log('courseId in couse start :', courseId);
  }, [currentIndex]);

  if (!items || currentIndex === undefined) {
    return (
      <View style={styles.container}>
        <Text>Loading123...</Text>
      </View>
    );
  }

  const item = items[currentIndex];
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const durationText = item.duration || '';
    const durationInSeconds = parseDurationToSeconds(durationText);

    if (durationInSeconds > 0) {
      setTime(durationInSeconds);
      setIsRunning(true);
    } else {
      setTime(0);
    }
  }, [item]);

  useEffect(() => {
    if (isRunning && time >= 0) {
      const id = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(id);
            setIsRunning(false);
            if (currentIndex < items.length - 1) {
              navigation.navigate('Couse_relax', { item, items, currentIndex,courseId });
            } else {
              navigation.navigate('Couse_finish', { item, items, currentIndex,courseId });
            }
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(id);
    }
  }, [currentIndex, navigation, isRunning, time]);

  const parseDurationToSeconds = (durationText) => {
    const match = durationText.match(/(\d+)\s*(วินาที|นาที|ครั้ง)/);
    if (match) {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === 'วินาที') return value;
      if (unit === 'นาที') return value * 60;
      if (unit === 'ครั้ง') return 30;
    }
    return 30;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleComplete = () => {
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      navigation.navigate('Couse_relax', { item: items[currentIndex + 1], items, currentIndex,courseId });
    } else {
      navigation.navigate('Couse_finish', { item, items, currentIndex,courseId });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      navigation.navigate('Couse_start', { item: items[currentIndex - 1], items, currentIndex: currentIndex - 1,courseId });
    } else {
      navigation.navigate('Couseexercies',{courseId});
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Couseexercies',{courseId})}>
      <Image source={cancel} style={styles.close} />
      </TouchableOpacity>
      <View style={styles.exerciseContainer}>
        <View style={styles.exerciseImageContainer}>
          <Image source={{ uri: item.animation }} style={styles.exerciseImage} />
        </View>
        <View style={styles.exerciseDetails}>
        <Text style={styles.exerciseTitle}>{item.name}</Text>
        <Text style={styles.exerciseCounter}>{currentIndex + 1}/{items.length}</Text>
        </View>
      </View>
      <Text style={styles.timer}>
        {item.duration.includes('ครั้ง') ? '15 ครั้ง' : formatTime(time)}
      </Text>
      <View style={styles.controlContainer}>
        {item.duration.includes('ครั้ง') ? (
          <TouchableOpacity style={styles.finButton} onPress={handleComplete}>
            <Text style={styles.completeText}>เสร็จสิ้น</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.controlButton} onPress={handleStartPause}>
            <Icon name={isRunning ? "pause" : "play"} size={50} color="#FFF" />
          </TouchableOpacity>
        )}
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
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  exerciseTitle: {
    fontSize: 22,
    fontFamily: 'appfont_01', 
    flex: 1,

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
  finButton : {
    backgroundColor: '#FFA500',
    width: 200,
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 30,
    marginBottom: 20,   
  },
  controlButton: {
    backgroundColor: '#FFA500',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 30,
    marginBottom: 0,
  },
  completeText: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: 'appfont_01',
    textAlign: 'center',
  },
});

export default Couse_start;
  