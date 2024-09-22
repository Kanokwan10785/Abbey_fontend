import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
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

export default function HomeScreen() {
  const [balance, setBalance] = useState(0);
  const [petImageUrl, setPetImageUrl] = useState(null);

  // ใช้ useFocusEffect แทน useEffect เพื่อให้โหลดข้อมูลใหม่ทุกครั้งที่เปิดหน้า HomeScreen
  useFocusEffect(
    React.useCallback(() => {
      const loadBalance = async () => {
        const token = await AsyncStorage.getItem('jwt');
        const userId = await AsyncStorage.getItem('userId');
        // console.log("Token:", token); // ตรวจสอบ token
        // console.log("User ID:", userId); // ตรวจสอบ user ID
  
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

      const loadHomePetData = async () => {
        const token = await AsyncStorage.getItem('jwt');
        const userId = await AsyncStorage.getItem('userId');
    
        if (!token || !userId) return;
    
        try {
          // เรียก API ส่วนที่ 1 เพื่อดึงข้อมูลผู้ใช้และ clothing_pet.label
          const userData = await fetchUserProfileWithClothing(userId, token);
          const clothingLabel = userData.clothing_pet?.label || 'S00P00K00';
    
          // เรียก API ส่วนที่ 2 เพื่อหาข้อมูล URL ของ home_pet โดยใช้ clothingLabel
          const petImageUrl = await fetchHomePetUrlByLabel(clothingLabel);
    
          // ตั้งค่า petImageUrl
          setPetImageUrl(petImageUrl);
          
        } catch (error) {
          console.error("Error fetching home pet data", error);
        }
      };
  
      // โหลดข้อมูล balance และข้อมูลสัตว์เลี้ยง
      loadBalance();
      loadHomePetData();
    }, [])  // dependencies array ว่างเพื่อให้ทำงานทุกครั้งที่หน้า HomeScreen เปิดขึ้น
  );

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
