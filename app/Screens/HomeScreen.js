import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomBar from './BottomBar';
import ProfileButton from './BottomProfile.js';
import DollarIcon from './Dollar.js';
import { fetchUserProfile, fetchHomePets } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClothingContext } from './ClothingContext';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import fruit from '../../assets/image/fruit-01.png';

const FoodButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.foodButton} onPress={() => navigation.navigate('FoodScreen')}>
      <Image source={fruit} style={styles.foodIcon} />
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { selectedItems } = useContext(ClothingContext);
  const [balance, setBalance] = useState(0);
  const [petImageUrl, setPetImageUrl] = useState(null);

  useEffect(() => {
    const loadBalance = async () => {
      const token = await AsyncStorage.getItem('jwt');
      const userId = await AsyncStorage.getItem('userId');
      console.log("Token:", token); // ตรวจสอบ token
      console.log("User ID:", userId); // ตรวจสอบ user ID

      if (!token || !userId) return;

      try {
        const userData = await fetchUserProfile(userId, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log("User Data:", userData); // ตรวจสอบข้อมูลผู้ใช้ที่ได้รับ
        setBalance(userData.balance || 0);
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    };

    loadBalance();
  }, []);

  useEffect(() => {
    const loadHomePetImage = async () => {
      try {
        const shirtLabel = selectedItems?.shirt?.label || 'S00';
        const pantLabel = selectedItems?.pant?.label || 'P00';
        const skinLabel = selectedItems?.skin?.label || 'K00';
  
        const petKey = `${shirtLabel}${pantLabel}${skinLabel}`;
        console.log("Generated Pet Home label:", petKey);
  
        const homePetsData = await fetchHomePets();
        const matchingPet = homePetsData.find(pet => pet.label === petKey);
  
        if (matchingPet && matchingPet.url) {
          setPetImageUrl(matchingPet.url); // ตรวจสอบว่ามี URL ก่อนตั้งค่า
        } else {
          setPetImageUrl(null); // ตั้งค่าเป็น null หรือรูปภาพเริ่มต้น
        }
      } catch (error) {
        console.error("Error loading home pet image", error);
      }
    };
  
    if (selectedItems) {
      loadHomePetImage(); // โหลดภาพสัตว์เลี้ยงเมื่อ selectedItems เปลี่ยน
    }
  }, [selectedItems]); // ทำงานทุกครั้งที่ selectedItems เปลี่ยน

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
          {petImageUrl ? (
            <Image source={{ uri: petImageUrl }} style={styles.petImages} />
          ) : (
            <Text style={styles.noImageText}>No Image Available</Text>
          )}
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
