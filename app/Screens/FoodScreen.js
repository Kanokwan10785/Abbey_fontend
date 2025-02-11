import React, { useState, useEffect, useContext } from 'react';
import { Image, ImageBackground } from 'expo-image';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import BottomBar from './BottomBar';
import ProfileButton from './BottomProfile.js';
import DollarIcon from './Dollar.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import fruit from '../../assets/image/fruit-01.png';
import cross from '../../assets/image/Clothing-Icon/cross-icon-01.png';
import { updateFoodQuantity, fetchUserFoodData, fetchUserProfileWithClothing, fetchFoodPetUrlByLabel } from './api'; // Import ฟังก์ชันจาก api.js

const FoodScreen = ({ navigation }) => {
  const { selectedItems } = useState(null);
  const [foodData, setFoodData] = useState([]);
  const [currentPetImage, setCurrentPetImage] = useState(null);
  const [isEating, setIsEating] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [clothingLabel, setClothingLabel] = useState('S00P00K00'); // State สำหรับเก็บ clothingLabel

  useEffect(() => {
    const loadFoodDataFromStorage = async () => {
      try {
        const storedFoodData = await AsyncStorage.getItem('foodData');
        if (storedFoodData) {
          setFoodData(JSON.parse(storedFoodData));
        }
      } catch (error) {
        console.error("Failed to load food data from storage", error);
      }
    };

    const fetchAndUpdateFoodData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const data = await fetchUserFoodData(userId);
        setFoodData(data);

        // บันทึกข้อมูลล่าสุดลงใน AsyncStorage
        await AsyncStorage.setItem('foodData', JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch food data from API", error);
      }
    };

    loadFoodDataFromStorage(); // โหลดข้อมูลจาก AsyncStorage ก่อน
    fetchAndUpdateFoodData();  // อัปเดตข้อมูลจาก API หลังจากนั้น
    updatePetImage();          // อัปเดตภาพสัตว์เลี้ยง
  }, [selectedItems]);

  // ฟังก์ชันสำหรับลดจำนวนอาหาร
  const updateFoodQuantityAndSave = async (itemId, newQuantity) => {
    await updateFoodQuantity(itemId, newQuantity);

    const updatedFoodData = foodData.map(foodItem =>
      foodItem.id === itemId ? { ...foodItem, quantity: newQuantity } : foodItem
    );
    setFoodData(updatedFoodData);

    await AsyncStorage.setItem('foodData', JSON.stringify(updatedFoodData)); // บันทึกลง AsyncStorage
  };

  // ฟังก์ชันกำหนด BMI prefix ตามค่า BMI
  const getBmiPrefix = (bmi) => {
    if (!bmi || isNaN(bmi)) return 'BMI02'; 
    if (bmi < 18.60) return 'BMI01';
    if (bmi >= 18.60 && bmi < 24.99) return 'BMI02';
    if (bmi >= 25.00 && bmi < 29.99) return 'BMI03';
    return 'BMI04';
  };

  // ฟังก์ชันสำหรับการตั้งค่าภาพสัตว์เลี้ยง
  const updatePetImage = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('jwt');
      
      const userData = await fetchUserProfileWithClothing(userId, token);
      const fetchedClothingLabel = userData.clothing_pet?.label || 'BMI00S00P00K00';
      const bmi = userData.BMI || '0';
      const modifiedLabel = fetchedClothingLabel.slice(5); // ตัด 5 ตัวหน้าออก
      const bmiPrefix = getBmiPrefix(bmi);
      const newfetchedClothingLabel = `${bmiPrefix}${modifiedLabel}`;
      setClothingLabel(newfetchedClothingLabel); // เก็บ clothingLabel ใน state

      // ตรวจสอบใน AsyncStorage ว่ามีภาพสัตว์เลี้ยงที่เคยบันทึกไว้หรือไม่
      const cachedPetImageUrl = await AsyncStorage.getItem(`petImage_${newfetchedClothingLabel}_F00`);

      if (cachedPetImageUrl) {
        // ถ้ามี URL ใน AsyncStorage, ใช้ URL นั้นโดยไม่ต้องดึงจาก API
        // console.log('Loaded pet image from AsyncStorage:', cachedPetImageUrl);
        setCurrentPetImage(cachedPetImageUrl);
      } else {
        // ดึง URL ภาพสัตว์เลี้ยง (ค่าเริ่มต้นเป็น F00) จาก API หากไม่มีใน AsyncStorage
        const { url: petImageUrl } = await fetchFoodPetUrlByLabel(newfetchedClothingLabel, 'F00');
        
        // ตั้งค่า URL ของภาพเริ่มต้น หากภาพที่ดึงมาไม่ตรงกับภาพปัจจุบัน และบันทึกลงใน AsyncStorage
        if (petImageUrl && petImageUrl !== currentPetImage) {
          setCurrentPetImage(petImageUrl);
          await AsyncStorage.setItem(`petImage_${newfetchedClothingLabel}_F00`, petImageUrl); // บันทึก URL ใน AsyncStorage
          console.log('Fetched and saved pet image from API:', petImageUrl);
        }
      }

    } catch (error) {
      console.error("Error fetching home pet data", error);
    }
  };

  // ฟังก์ชันการจัดการเมื่อกดปุ่มกิน
  const handleEat = async (item) => {
    if (item.quantity <= 0 || isButtonDisabled || isEating) {
      console.log('Cannot eat. Either quantity is 0, button is disabled, or pet is already eating.');
      return; // ป้องกันการกดซ้ำหรือตอนปุ่มถูกปิด
    }
  
    console.log('Attempting to eat food:', {
      foodLabel: item.label, //
      foodName: item.name,
      foodId: item.id,
      foodQuantity: item.quantity,
      clothingLabel: clothingLabel,
      isButtonDisabled: isButtonDisabled,
      isEating: isEating,
    });
  
    setIsButtonDisabled(true);
    setIsEating(true);

    try {
      // สร้าง foodLabel เช่น F01, F04
      const foodLabel = item.label;
      console.log("Eating food:", foodLabel);

      // ตรวจสอบใน AsyncStorage ว่ามีภาพการกินสัตว์เลี้ยงที่เคยบันทึกไว้หรือไม่
      const cachedEatingImageUrl = await AsyncStorage.getItem(`petImage_${clothingLabel}_${foodLabel}`);

      let eatingPetImageUrl;
      if (cachedEatingImageUrl) {
        // ใช้ URL จาก AsyncStorage ถ้ามี
        eatingPetImageUrl = cachedEatingImageUrl;
        console.log('Loaded eating pet image from AsyncStorage:', eatingPetImageUrl);
      } else {
        // ดึง URL ภาพสัตว์เลี้ยงจาก API และบันทึกใน AsyncStorage
        const { url } = await fetchFoodPetUrlByLabel(clothingLabel, foodLabel);
        eatingPetImageUrl = url;
        await AsyncStorage.setItem(`petImage_${clothingLabel}_${foodLabel}`, eatingPetImageUrl);
        console.log('Fetched and saved eating pet image from API:', eatingPetImageUrl);
      }

      if (eatingPetImageUrl) {
        setCurrentPetImage(eatingPetImageUrl); // เปลี่ยนเป็นภาพอนิเมชันการกิน

        // ตั้ง Timeout เพื่อให้แสดงอนิเมชันการกินเป็นเวลา 3 วินาที
        setTimeout(async () => {
          // เปลี่ยนภาพเป็น F00 ก่อนเรียก updatePetImage เพื่ออัปเดตข้อมูลอื่น
          const defaultImageUrl = await fetchFoodPetUrlByLabel(clothingLabel, 'F00');
          
          if (defaultImageUrl?.url) {
            console.log('Returning to default pet image:', defaultImageUrl.url);
            setCurrentPetImage(defaultImageUrl.url); // เปลี่ยนเป็นภาพปกติ (F00)
            await AsyncStorage.setItem(`petImage_${clothingLabel}_F00`, defaultImageUrl.url); // บันทึกใน AsyncStorage
          }

          // อัปเดตข้อมูลสัตว์เลี้ยงในฐานข้อมูลหรือทำงานอื่นที่ต้องรอการเปลี่ยนภาพเสร็จสิ้น
          await updatePetImage(); 
          console.log('Returning to default pet image (F00) after eating.');

          setIsEating(false); 
          setIsButtonDisabled(false); // เปิดใช้งานปุ่มใหม่หลังจากเปลี่ยนกลับเป็นภาพปกติ
        }, 2450); // แสดงอนิเมชันการกินเป็นเวลา 3 วินาที
      }

      // ลดจำนวนอาหารและบันทึก
      const newQuantity = item.quantity - 1;
      console.log("Updating food quantity. New quantity:", newQuantity);
      await updateFoodQuantityAndSave(item.id, newQuantity);

    } catch (error) {
      console.error('Error while eating', error);
      setIsEating(false); 
      setIsButtonDisabled(false); 
    }
  };

  const clearCachedPetImages = async () => {
    try {
      console.log("Clearing cached pet images for FoodScreen...");
  
      const keys = await AsyncStorage.getAllKeys();
      const petImageKeys = keys.filter(key => key.startsWith('petImage_')); // ค้นหาคีย์ที่เกี่ยวข้อง
  
      if (petImageKeys.length > 0) {
        await AsyncStorage.multiRemove(petImageKeys); // ลบคีย์ทั้งหมดที่เกี่ยวข้อง
        console.log("Cleared cached pet images:", petImageKeys);
      } else {
        console.log("No cached pet images found.");
      }
    } catch (error) {
      console.error("Error clearing cached pet images:", error);
    }
  };  
  
  const renderItems = () => {
    const sortedFoodData = [...foodData].sort((a, b) => {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 0;
    });
    return (
      <>
        {sortedFoodData.map((item) => {
          const hideButtonAndQuantity = item.name === "ว่างเปล่า";

          return (
            <View key={item.id} style={styles.item}>
              {item.image && (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              )}
              {!hideButtonAndQuantity && (
                <>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.itemButton} onPress={() => handleEat(item)} disabled={isButtonDisabled}>
                    <Text style={styles.itemButtonText}>กิน</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.gymBackgroundContainer}>
        <ImageBackground source={gym} style={styles.gymBackground}>
          <View style={styles.header}>
            <ProfileButton />
            <DollarIcon />
          </View>
          {/* <TouchableOpacity style={styles.clearButton} onPress={clearCachedPetImages}>
            <Text style={styles.clearButtonText}>ล้างแคชภาพสัตว์เลี้ยง</Text>
          </TouchableOpacity> */}
          <View style={styles.petDisplay}>
            <Image source={{ uri: currentPetImage }} style={styles.petImage} />
          </View>
        </ImageBackground>
      </View>
      <View style={styles.orangeBackground}>
        <TouchableOpacity style={styles.crossButton} onPress={() => navigation.navigate('HomeScreen')}>
          <Image source={cross} style={styles.crossIcon} />
        </TouchableOpacity>
        <View style={styles.wardrobeMenu}>
          <Image source={fruit} style={styles.wardrobeIcon} />
          <Text style={styles.wardrobeText}>อาหาร</Text>
        </View>
        <View style={styles.itemsBackground}>
          <ScrollView style={styles.itemsMenu} contentContainerStyle={styles.itemsMenuContent}>
            {renderItems()}
          </ScrollView>
        </View>
      </View>
      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gymBackgroundContainer: { flex: 1 },
  gymBackground: { flex: 1, resizeMode: "cover" },
  orangeBackground: { flex: 1, backgroundColor: "#FFAF32" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20 },
  petDisplay: { flex: 2, alignItems: "center" },
  petImage: { width: "110%", height: "110%", resizeMode: "contain" },
  wardrobeIcon: { width: 50, height: 50, marginVertical: 10, alignSelf: "center" },
  wardrobeText: { fontSize: 32, color: "#FFF", fontFamily: "appfont_02", marginLeft: 15 },
  wardrobeMenu: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  crossButton: { width: 50, height: 50, justifyContent: "center", alignItems: "center", position: "absolute", right: -4, top: -4 },
  crossIcon: { width: 30, height: 30 },
  itemsBackground: { backgroundColor: "#9E640A", zIndex: 1, flex: 1 },
  itemsMenu: { flex: 1, marginTop: 18 },
  itemsMenuContent: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" },
  item: { width: '20%', marginHorizontal: '2.5%', marginBottom: '5%', height: 112, backgroundColor: "#FFAF32", alignItems: "center", borderColor: "#F9E79F", borderWidth: 8 },
  itemImage: { width: 60, height: 60, bottom: 4 },
  itemQuantity: { fontSize: 16, bottom: 8, color: "#000", position: "absolute", fontFamily: "appfont_02" },
  itemName: { fontSize: 14, bottom: 26, color: "#000", position: "absolute", fontFamily: "appfont_02" },
  itemButton: { backgroundColor: "#F9E79F", borderRadius: 10, paddingVertical: 2, paddingHorizontal: 10, borderWidth: 0.5, bottom: -28, width: '80%', alignItems: "center" },
  itemButtonText: { fontSize: 14, color: "#000", fontFamily: "appfont_02" },
  clearButton: { backgroundColor: 'red', padding: 10, top: 90, position: "absolute", zIndex: 100, borderRadius: 5 },
  clearButtonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
});

export default FoodScreen;
