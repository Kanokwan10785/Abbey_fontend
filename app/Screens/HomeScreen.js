import { View, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import BottomBar from './BottomBar';
import ProfileButton from './Profile.js';
import DollarIcon from './Dollar.js';
import gym from '../../assets/image/gym-02.gif';
import fruit from '../../assets/image/fruit-01.png';
import dogrun from '../../assets/image/dog-run-01.gif';

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
      <View style={styles.container}>
        <View style={styles.header}>
          <ProfileButton />
          <DollarIcon />
        </View>
        <View style={styles.screen}>
          <View style={styles.section} />
          <View style={styles.section} />
          <View style={styles.section}>
            <DogRun />
          </View>
          <View style={styles.section} />
        </View>
        <FoodButton />
        <BottomBar />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  screen: {
    flex: 1,
    flexDirection: 'column',
  },
  section: {
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
    width: 340,
    height: 340,
    resizeMode: 'contain',
  },
});
