import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Exercise3 = () => {
  const navigation = useNavigation();
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState('00:30');

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} 
      onPress={() => navigation.navigate('ExerciseScreen')}>
        <Icon name="close" size={30} color="#FFA500" />
      </TouchableOpacity>
      <View style={styles.exerciseContainer}>
        <Image source={require('../../../assets/image/ex1.png')} style={styles.exerciseImage} />
        <Text style={styles.exerciseTitle}>ท่ากระโดดตบ</Text>
        <Text style={styles.exerciseCounter}>1/15</Text>
      </View>
      <Text style={styles.timer}>X 12</Text>
      <Text style={styles.finish}>เสร็จสิ้น</Text>
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="chevron-left" size={60} color="#808080" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
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
    margin: 5,
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
    finish: {
        fontSize: 30,
        backgroundColor: '#FFA500',
        borderRadius: 20,
        padding: 10,
        width: 200,
        textAlign: 'center',
        color: '#FFF',
        marginVertical: 20,
        fontFamily: 'appfont_01',
        padding: 7,
    // height: 40,
    // width: 120,
    // backgroundColor: '#F6A444',
    // borderRadius: 20,
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

export default Exercise3;
