import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomBar from './BottomBar';
import ProfileButton from './BottomProfile.js';
import DollarIcon from './Dollar.js';
import { fetchUserProfile } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClothingContext } from './ClothingContext';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import fruit from '../../assets/image/fruit-01.png';

const petImages = {
  S00P00K00: require('../../assets/image/Home-Pet/S00P00K00.gif'),
  S00P00K01: require('../../assets/image/Home-Pet/S00P00K01.gif'),
  S00P01K00: require('../../assets/image/Home-Pet/S00P01K00.gif'),
  S00P01K01: require('../../assets/image/Home-Pet/S00P01K01.gif'),
  S00P02K00: require('../../assets/image/Home-Pet/S00P02K00.gif'),
  S00P02K01: require('../../assets/image/Home-Pet/S00P02K01.gif'),
  S01P00K00: require('../../assets/image/Home-Pet/S01P00K00.gif'),
  S01P00K01: require('../../assets/image/Home-Pet/S01P00K01.gif'),
  S01P01K00: require('../../assets/image/Home-Pet/S01P01K00.gif'),
  S01P01K01: require('../../assets/image/Home-Pet/S01P01K01.gif'),
  S01P02K00: require('../../assets/image/Home-Pet/S01P02K00.gif'),
  S01P02K01: require('../../assets/image/Home-Pet/S01P02K01.gif'),
  S02P00K00: require('../../assets/image/Home-Pet/S02P00K00.gif'),
  S02P00K01: require('../../assets/image/Home-Pet/S02P00K01.gif'),
  S02P01K00: require('../../assets/image/Home-Pet/S02P01K00.gif'),
  S02P01K01: require('../../assets/image/Home-Pet/S02P01K01.gif'),
  S02P02K00: require('../../assets/image/Home-Pet/S02P02K00.gif'),
  S02P02K01: require('../../assets/image/Home-Pet/S02P02K01.gif'),
};

const FoodButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.foodButton} onPress={() => navigation.navigate('FoodScreen')}>
      <Image source={fruit} style={styles.foodIcon} />
    </TouchableOpacity>
  );
};

const CatImage = ({ imageKey }) => (
  <Image source={petImages[imageKey]} style={styles.petImages} />
);

export default function HomeScreen() {
  const { selectedItems } = useContext(ClothingContext);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const loadBalance = async () => {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');
      if (!token || !userId) return;

      try {
        const userData = await fetchUserProfile(userId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBalance(userData.balance);
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    };

    loadBalance();
  }, []); // ดึงยอดเงินเมื่อหน้าจอถูกโหลดครั้งแรก

  const shirtName = selectedItems.shirt ? selectedItems.shirt.name : 'S00';
  const pantName = selectedItems.pant ? selectedItems.pant.name : 'P00';
  const skinName = selectedItems.skin ? selectedItems.skin.name : 'K00';

  const petKey = `${shirtName}${pantName}${skinName}`; 

  return (
    <ImageBackground source={gym} style={styles.background}>
      <View style={styles.header}>
        <ProfileButton />
        <DollarIcon balance={balance} /> 
      </View>
      <View style={styles.screenpetImages}>
        <View style={styles.sectionpetImages} />
        <View style={styles.sectionpetImages} />
        <View style={styles.sectionpetImages}>
          <CatImage imageKey={petKey} />
        </View>
        <View style={styles.sectionpetImages} />
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
  screenpetImages: {
    flex: 1,
    flexDirection: 'column',
  },
  sectionpetImages: {
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
  petImages: {
    width: '280%',
    height: '280%',
    resizeMode: 'contain',
  },
});
