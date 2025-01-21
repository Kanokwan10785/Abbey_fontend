import React, { useState } from 'react';
import { Image, ImageBackground } from 'expo-image';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  const [username, setUsername] = useState(''); // เพิ่ม State
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [level, setLevel] = useState('');
  const [bmi, setBmi] = useState('');
  const [profileImage, setProfileImage] = useState(null); // รูปโปรไฟล์
  const [petImageUrls, setPetImageUrls] = useState([]); // อนิเมชันสัตว์เลี้ยง
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const loadBalance = async () => {
        const token = await AsyncStorage.getItem('jwt');
        const userId = await AsyncStorage.getItem('userId');
        if (!token || !userId) return;
        try {
          const userData = await fetchUserProfile(userId, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // อัปเดต State สำหรับข้อมูลโปรไฟล์
          setBalance(userData.balance || 0); // โหลดยอดเงิน
          setUsername(userData.username || "ไม่มีข้อมูล"); // ชื่อผู้ใช้
          setWeight(userData.weight || "ไม่มีข้อมูล"); // น้ำหนัก
          setHeight(userData.height || "ไม่มีข้อมูล"); // ส่วนสูง
          setAge(userData.age || "ไม่มีข้อมูล"); // อายุ
          setGender(userData.selectedGender === "male" ? "ชาย" : "หญิง"); // เพศ
          setLevel(userData.level || "1"); // เลเวล
          setBmi(userData.BMI || "ไม่มีข้อมูล"); // BMI.
          // console.log("User Data:", userData.BMI);

          // ตั้งค่ารูปโปรไฟล์
          const profileImageUrl = userData.picture?.formats?.medium?.url || null;
          if (profileImageUrl) {
            setProfileImage({ uri: profileImageUrl });
          } else {
            setProfileImage(require("../../assets/image/profile02.png")); // รูปเริ่มต้น
          }
          
        } catch (error) {
          console.error("Error fetching user profile", error);
        }
      };  
  
      const loadHomePetData = async () => {
        const token = await AsyncStorage.getItem('jwt');
        const userId = await AsyncStorage.getItem('userId');
        if (!token || !userId) return;
  
        try {
          const userData = await fetchUserProfileWithClothing(userId, token);
          // console.log("Matching userData found:", userData); 
          const clothingLabel = userData.clothing_pet?.label || 'BMI03S00P00K00';
          console.log("Matching pet found:", clothingLabel);
          const urls = await fetchHomePetUrlByLabel(clothingLabel, userId);
  
          if (urls) {
            setPetImageUrls(urls.map(item => item.url)); // ตั้งค่า URL รูปสัตว์เลี้ยง
          }
        } catch (error) {
          console.error("Error fetching home pet data", error);
        }
      };
  
      loadBalance();
      loadHomePetData();
    }, [])
  );
  
  useFocusEffect(
    React.useCallback(() => {
      if (petImageUrls.length > 0) {
        const interval = setInterval(() => {
          setCurrentUrlIndex(prevIndex => (prevIndex + 1) % petImageUrls.length);
        }, 10200);

        return () => clearInterval(interval);
      }
    }, [petImageUrls])
  );

  return (
    <ImageBackground source={gym} style={styles.background}>
      <View style={styles.header}>
        <ProfileButton 
        username = {username}
        weight = {weight} 
        height = {height} 
        age = {age} 
        gender = {gender} 
        bmi = {bmi} 
        profileImage = {profileImage} 
        level = {level}/>
        <DollarIcon balance={balance} /> 
      </View>
      <View style={styles.screenpetImages}>
        <View style={styles.sectionpetImages} />
        <View style={styles.sectionpetImages} />
        <View style={styles.sectionpetImages}>
          {petImageUrls.length > 0 ?(
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
