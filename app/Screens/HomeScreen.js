import { View, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import BottomBar from './BottomBar';
import ProfileButton from './Profile.js';
import DollarIcon from './Dollar.js';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import fruit from '../../assets/image/fruit-01.png';
import dogrun from '../../assets/image/Home-Pet/S02P02K00.gif';

const FoodButton = () => (
  <TouchableOpacity style={styles.foodButton} onPress={() => alert('รับประทานอาหาร')}>
    <Image source={fruit} style={styles.foodIcon} />
  </TouchableOpacity>
);

const DogRun = () => (
  <Image source={dogrun} style={styles.dogRun} />
);

export default function HomeScreen() {
  return (
    <ImageBackground source={gym} style={styles.background}>
        <View style={styles.header}>
          <ProfileButton />
          <DollarIcon />
        </View>
        <View style={styles.screenDogrun}>
          <View style={styles.sectionDogrun} />
          <View style={styles.sectionDogrun} />
          <View style={styles.sectionDogrun}>
            <DogRun />
          </View>
          <View style={styles.sectionDogrun} />
        </View>
        <FoodButton />
        <BottomBar />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  screenDogrun: {
    flex: 1,
    flexDirection: 'column',
  },
  sectionDogrun: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodButton: {
    position: 'absolute',
    right: 10,
    top: 100,
    width: 70,
    height: 85,
    borderRadius: 15,
    backgroundColor: '#FFAF32',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#F9E79F',
    borderWidth: 8,
  },
  foodIcon: {
    width: 50,
    height: 50,
  },
  dogRun: {
    width: '280%',
    height: '280%',
    resizeMode: 'contain',
  },
});