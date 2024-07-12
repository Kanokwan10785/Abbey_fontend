import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Exercise2 = () => {
  const navigation = useNavigation();
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState('00:15');
  const [coins, setCoins] = useState(1325);
  const [exerciseIndex, setExerciseIndex] = useState(1);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const exercises = [
    { name: 'ท่ากระโดดตบ', image: require('../../../assets/image/ex1.png') },
    { name: 'ท่าถัดไป', image: require('../../../assets/image/ex1.png') },
    { name: 'ท่านักปีนเขา', image: require('../../../assets/image/ex1.png') },
    // เพิ่มท่าออกกำลังกายตามที่ต้องการ
  ];

  const handleNextExercise = () => {
    setExerciseIndex((prevIndex) => (prevIndex < exercises.length - 1 ? prevIndex + 1 : 0));
  };

  const handlePrevExercise = () => {
    setExerciseIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : exercises.length - 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}
        onPress={() => navigation.navigate('ExerciseScreen')}>
          <Icon name="close" size={30} color="#FFA500" />
        </TouchableOpacity>
        <View style={styles.coinsContainer}>
          <Icon name="coin" size={24} color="#FFA500" />
          <Text style={styles.coinsText}>{coins}</Text>
        </View>
      </View>
      <View style={styles.exerciseContainer}>
        <Image source={exercises[exerciseIndex].image} style={styles.exerciseImage} />
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseTitle}>{exercises[exerciseIndex].name}</Text>
          <Text style={styles.exerciseCounter}>{exerciseIndex + 1}/{exercises.length}</Text>
        </View>
      </View>
      <Text style={styles.timer}>พักผ่อน</Text>
      <Text style={styles.timer}>{time}</Text>
      <View style={styles.coinRewardContainer}>
        <Icon name="coin" size={24} color="#FFA500" />
        <Text style={styles.coinRewardText}>20</Text>
      </View>
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevExercise}>
          <Icon name="chevron-left" size={40} color="#808080" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleNextExercise}>
          <Icon name="chevron-right" size={40} color="#FFA500" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  closeButton: {
    margin: 5,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  coinsText: {
    fontSize: 18,
    marginLeft: 8,
    fontFamily: 'appfont_01',
    color: '#FFA500',
  },
  exerciseContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  exerciseImage: {
    width: 350,
    height: 200,
    borderColor: '#FFA500',
    borderWidth: 3,
  },
  exerciseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 20,
  },
  exerciseTitle: {
    fontSize: 22,
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
  coinRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 25,
    marginVertical: 20,
  },
  coinRewardText: {
    fontSize: 18,
    color: '#FFF',
    marginLeft: 8,
    fontFamily: 'appfont_01',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
  },
  navButton: {
    padding: 10,
  },
});

export default Exercise2;
