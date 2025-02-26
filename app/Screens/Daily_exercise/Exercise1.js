import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import cancel from '../../../assets/image/cancel.png';
import { Image } from 'expo-image';

const Exercise1 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { items, currentIndex, dayNumber, weekId, set, isMissed, dayDate } = route.params || {};

  if (!items || currentIndex === undefined) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const item = items[currentIndex];
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);

  useEffect(() => {
    console.log("item.duration:", item.duration);
    const durationInSeconds = parseDurationToSeconds(item.duration);

    if (durationInSeconds !== null) {
      setTime(durationInSeconds);
      setIsRunning(true);
    } else {
      setTime(0);
      setIsRunning(false);
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
            handleNext();
            return 0;
          }
        });
      }, 1000);

      return () => clearInterval(id);
    }
  }, [currentIndex, navigation, isRunning, time]);

  const parseDurationToSeconds = (durationText) => {
    if (!durationText) return 30; 

    durationText = durationText.trim().replace(/\s+/g, ''); 

    if (durationText.includes("ครั้ง")) {
        return null; 
    }

    const timeMatch = durationText.match(/(\d{2}):(\d{2})น./);
    if (timeMatch) {
        const minutes = parseInt(timeMatch[1], 10);
        const seconds = parseInt(timeMatch[2], 10);
        console.log(`⏳ แปลงเวลา: ${minutes} นาที ${seconds} วินาที`);
        return (minutes * 60) + seconds; 
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
      navigation.navigate('Exercise2', { item: items[currentIndex + 1], items, currentIndex, dayNumber, weekId, set, isMissed, dayDate });
    } else {
      navigation.navigate('Exercise4', { item, items, currentIndex, dayNumber, weekId, set, isMissed, dayDate });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      navigation.navigate('Exercise1', { item: items[currentIndex - 1], items, currentIndex: currentIndex - 1, dayNumber, weekId, set, isMissed, dayDate });
    } else {
      navigation.navigate('Dayexercise', { dayNumber, weekId, set, isMissed, dayDate });
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Dayexercise', { dayNumber, weekId, set, isMissed, dayDate })}>
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
        {item.duration.includes('ครั้ง') ? item.duration 
          : formatTime(time)}
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
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: 20,
  },
  navButton: {
    padding: 10,
  },
  controlContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
  finButton: {
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

export default Exercise1;
