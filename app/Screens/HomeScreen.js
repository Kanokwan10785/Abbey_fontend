import React, { useState, useCallback } from 'react';
import { Image, ImageBackground } from 'expo-image';
import { View, Text, DeviceEventEmitter, StyleSheet, TouchableOpacity } from 'react-native';
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
  const [petImageUrls, setPetImageUrls] = useState([]);
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
          const userData = await fetchUserProfileWithClothing(userId, token);
          // console.log("Matching userData found:", userData); 
          const clothingLabel = userData.clothing_pet?.label || 'BMI03S00P00K00';
          console.log("Matching pet found:", clothingLabel);
          const urls = await fetchHomePetUrlByLabel(clothingLabel, userId);

          if (urls) {
            setPetImageUrls(urls.map(item => item.url));
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
        <ProfileButton />
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
