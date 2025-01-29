import React, { useState, useEffect } from 'react';
import { Image, ImageBackground } from 'expo-image';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import BottomBar from './BottomBar';
import ProfileButton from './BottomProfile.js';
import DollarIcon from './Dollar.js';
import { fetchUserProfile, fetchUserProfileWithClothing, fetchHomePetUrlByLabel } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// ในฟังก์ชัน HomeScreen
export default function HomeScreen() {
  const isFocused = useIsFocused(); // ใช้ useIsFocused เพื่อให้รู้ว่าอยู่ใน focus หรือไม่

  const [balance, setBalance] = useState(0);
  const [petImageUrls, setPetImageUrls] = useState([]);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  // ฟังก์ชันกำหนด BMI prefix ตามค่า BMI
  const getBmiPrefix = (bmi) => {
    if (!bmi || isNaN(bmi)) return 'BMI02'; 
    if (bmi < 18.60) return 'BMI01';
    if (bmi >= 18.60 && bmi < 24.99) return 'BMI02';
    if (bmi >= 25.00 && bmi < 29.99) return 'BMI03';
    return 'BMI04';
  };

  const loadBalance = async () => {
    const token = await AsyncStorage.getItem('jwt');
    const userId = await AsyncStorage.getItem('userId');
    if (!token || !userId) return;
    try {
      const userData = await fetchUserProfile(userId, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(userData.balance || 0); 
    } catch (error) {
      console.error('Error fetching user profile', error);
    }
  };

  const loadHomePetData = async () => {
    const token = await AsyncStorage.getItem('jwt');
    const userId = await AsyncStorage.getItem('userId');
    if (!token || !userId) return;

    try {
      const userData = await fetchUserProfileWithClothing(userId, token);
      const label = userData.clothing_pet?.label || 'BMI03S00P00K00';
      const bmi = userData.BMI || '0';
      const modifiedLabel = label.slice(5);
      const bmiPrefix = getBmiPrefix(bmi);
      const newLabel = `${bmiPrefix}${modifiedLabel}`;
      const clothingLabel = newLabel;
      const urls = await fetchHomePetUrlByLabel(clothingLabel, userId, bmiPrefix);

      if (urls) {
        setPetImageUrls(urls.map((item) => item.url));
      }
    } catch (error) {
      console.error('Error fetching home pet data', error);
    }
  };

  useEffect(() => {
    if (isFocused) {  // ใช้ useIsFocused เพื่อเช็คว่าหน้า HomeScreen ถูกเปิดอยู่
      loadBalance();
      loadHomePetData();
    }
  }, [isFocused]); // รีเฟรชข้อมูลเมื่อหน้า HomeScreen อยู่ใน focus

  useEffect(() => {
    if (petImageUrls.length > 0) {
      const interval = setInterval(() => {
        setCurrentUrlIndex((prevIndex) => (prevIndex + 1) % petImageUrls.length);
      }, 10200);

      return () => clearInterval(interval);
    }
  }, [petImageUrls]);

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
          {petImageUrls.length > 0 ? (
            <Image source={{ uri: petImageUrls[currentUrlIndex] }} style={styles.petImages} />
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
  background: { flex: 1, resizeMode: 'cover', },
  header: { flexDirection: 'row', justifyContent: 'space-between', margin: 20, },
  screenpetImages: { flex: 1, flexDirection: 'column', },
  sectionpetImages: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  foodButton: { position: 'absolute', right: 10, top: 100, width: 70, height: 85, borderRadius: 15, backgroundColor: '#FFAF32', justifyContent: 'center', alignItems: 'center', borderColor: '#F9E79F', borderWidth: 8, },
  foodIcon: { width: 50, height: 50, },
  petImages: { width: '250%', height: '250%', resizeMode: 'contain', },
});
