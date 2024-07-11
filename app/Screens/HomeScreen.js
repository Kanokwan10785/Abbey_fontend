import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import BottomBar from './BottomBar';
import gym from '../../assets/image/gym-02.gif';
import dollar from '../../assets/image/dollar-01.png';
import fruit from '../../assets/image/fruit-01.png';
import dogrun from '../../assets/image/dog-run-01.gif';

const ProfileInfo = () => (
  <View style={styles.profileContainer}>
    <View style={styles.levelCircle}>
      <Text style={styles.levelText}>13</Text>
    </View>
    <TouchableOpacity style={styles.usernameContainer} onPress={() => alert('เปิดหน้าต่างโปรไฟล์')}>
      <Text style={styles.username}>AEK</Text>
    </TouchableOpacity>
  </View>
);

const CurrencyInfo = () => (
  <View style={styles.currencyContainer}>
    <View style={styles.currencyBackground}>
      <Text style={styles.currencyText}>1,250</Text>
      <Image source={dollar} style={styles.currencyIcon} />
    </View>
  </View>
);

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
          <ProfileInfo />
          <CurrencyInfo />
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
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFCC00',
    borderWidth: 5,
    marginRight: -4,
    zIndex: 1,
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  usernameContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 25,
    marginLeft: -8,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  currencyBackground: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: -5,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 14,
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
