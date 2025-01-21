import React, { useState, useEffect, useContext, useRef } from 'react';
import { Image, ImageBackground } from 'expo-image';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from './BottomBar';
import ProfileButton from './BottomProfile.js';
import DollarIcon from './Dollar.js';
import { ClothingContext } from './ClothingContext';
import { useFocusEffect } from '@react-navigation/native';
import { fetchUserClothingData, fetchClothingPets, fetchUserProfile, fetchAndUpdateClothingPets } from './api.js';
import wardrobe from '../../assets/image/bar-02.png';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import shirtIcon from '../../assets/image/Clothing-Icon/Shirt/shirt-icon-02.png';
import pantsIcon from '../../assets/image/Clothing-Icon/Pant/pant-icon-02.png';
import skinIcon from '../../assets/image/Clothing-Icon/Skin/skin-icon-02.png';
import empty from '../../assets/image/Clothing-Icon/empty-icon-01.png';
import cross from '../../assets/image/Clothing-Icon/cross-icon-01.png';

export default function ClothingScreen({ navigation, route }) {
  const {selectedItems, setSelectedItems } = useContext(ClothingContext);
  const [selectedCategory, setSelectedCategory] = useState("shirt");
  const [itemsData, setItemsData] = useState({ shirt: [], pant: [], skin: [] });
  const [petImageUrl, setPetImageUrl] = useState(null);
  const previousCombinedLabelRef = useRef(null);
  const [bmi, setBmi] = useState(null);

  // ใช้เพื่อเก็บข้อมูล cache สำหรับ clothing pets
  const cachedClothingPetsData = useRef(null);

  // ฟังก์ชันโหลดข้อมูลเมื่อมีการรีเฟรช
  const refreshData = async () => {
    // console.log('Refreshing ClothingScreen...');
    try {
      await fetchAndStoreBMI(); // โหลดข้อมูล BMI ใหม่
      await loadUserClothingData(); // โหลดข้อมูลเสื้อผ้าใหม่
  
      // ตรวจสอบว่าข้อมูลใหม่ถูกโหลดสำเร็จ
      const updatedUserId = await getUserId();
      const updatedOutfit = await AsyncStorage.getItem(`userOutfit-${updatedUserId}`);
      // console.log('Updated Outfit:', updatedOutfit);
      // console.log('Updated BMI:', bmi);
  
    } catch (error) {
      console.error('Error refreshing ClothingScreen:', error);
    }
  };  

  // ฟังก์ชันสำหรับเรียกข้อมูลเสื้อผ้า
  const loadUserClothingData = async () => {
    // Logic การโหลดเสื้อผ้า (โค้ดเดิม)
  };

  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.refresh) {
        console.log('Triggered refresh from route params');
        refreshData();
      } else {
        console.log('No refresh triggered');
      }
    }, [route.params?.refresh]) // ติดตามค่า refresh จาก route.params
  );  

  // ฟังก์ชัน helper เพื่อดึง userId จาก AsyncStorage
  const getUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found in AsyncStorage');
      return userId;
    } catch (error) {
      console.error('Error retrieving user ID:', error);
      return null;
    }
  };

  // โหลดข้อมูลเสื้อผ้าผู้ใช้จาก AsyncStorage และ API
  useEffect(() => {
    const loadUserClothingData = async () => {
      try {
        const userId = await getUserId();
        if (!userId) return;

        // ดึงข้อมูลจาก AsyncStorage หากมีการเก็บข้อมูลไว้
        const savedOutfits = await AsyncStorage.getItem(`userOutfit-${userId}`);
        const cachedClothingData = await AsyncStorage.getItem(`clothingData-${userId}`);

        if (savedOutfits) {
          setSelectedItems(JSON.parse(savedOutfits)); // อัปเดต state ด้วยข้อมูลที่ดึงจาก AsyncStorage
        }

        if (cachedClothingData) {
          organizeClothingData(JSON.parse(cachedClothingData));
        }

        // ดึงข้อมูลจาก API และจัดเก็บใน AsyncStorage
        const data = await fetchUserClothingData(userId);
        if (data && data.length > 0) {
          // console.log('Fetched clothing data from API:', data);
          organizeClothingData(data);
          await AsyncStorage.setItem(`clothingData-${userId}`, JSON.stringify(data)); // จัดเก็บข้อมูลใหม่ใน AsyncStorage
        }
      } catch (error) {
        console.error('Error loading user clothing data:', error.message);
      }
    };

    loadUserClothingData();
  }, [setSelectedItems]);

  // จัดหมวดหมู่เสื้อผ้าผู้ใช้
  const organizeClothingData = (data) => {
    const organizedData = { shirt: [], pant: [], skin: [] };

    data.forEach(item => {
      const label = item.label || '';
      let category = '';

      if (label.startsWith('S')) {
        category = 'shirt';
      } else if (label.startsWith('P')) {
        category = 'pant';
      } else if (label.startsWith('K')) {
        category = 'skin';
      }

      if (category && organizedData[category]) {
        organizedData[category].push({
          id: item.id,
          image: item.image || null,
          name: item.name || 'Unknown',
          label: item.label || 'Unknown',
        });
      }
    });

    setItemsData(organizedData); // อัปเดตข้อมูลใน state
  };

  // ฟังก์ชันเพื่อดึงข้อมูล BMI
  const fetchAndStoreBMI = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // ดึง userId จาก AsyncStorage
      const token = await AsyncStorage.getItem('jwt'); // ดึง token จาก AsyncStorage
      if (!userId || !token) {
        console.error('User ID or Token not found');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const profileData = await fetchUserProfile(userId, config); // เรียกใช้ฟังก์ชัน fetchUserProfile
      // console.log('Fetched Profile Data:', profileData); // ตรวจสอบข้อมูลที่ดึงมา

      if (profileData && profileData.BMI) {
        setBmi(profileData.BMI); // อัปเดต BMI ใน state
        await AsyncStorage.setItem(`bmi-${userId}`, profileData.BMI.toString()); // เก็บ BMI ใน AsyncStorage
      }
    } catch (error) {
      console.error('Error fetching and storing BMI:', error);
    }
  };

  // เรียกใช้ฟังก์ชันใน useEffect
  useEffect(() => {
    fetchAndStoreBMI(); // ดึงข้อมูล BMI เมื่อเริ่มต้น
  }, [selectedItems]);

  // โหลดข้อมูลเสื้อผ้าสัตว์เลี้ยงจาก cache หากมี
  const fetchAndCacheClothingPets = async () => {
    if (cachedClothingPetsData.current) {
      return cachedClothingPetsData.current;
    }
    try {
      const data = await fetchClothingPets();
      cachedClothingPetsData.current = data;
      return data;
    } catch (error) {
      console.error('Error fetching clothing pets:', error);
      throw error;
    }
  };

  // อัปเดตภาพสัตว์เลี้ยงเมื่อเสื้อผ้าเปลี่ยนแปลง
  useEffect(() => {
    const updatePetImage = async () => {
      const shirtLabel = selectedItems.shirt?.label || 'S00';
      const pantLabel = selectedItems.pant?.label || 'P00';
      const skinLabel = selectedItems.skin?.label || 'K00';

      // คำนวณ BMI Category
      const userId = await getUserId();
      const storedBmi = await AsyncStorage.getItem(`bmi-${userId}`); // ดึง BMI จาก AsyncStorage
      const bmiCategory = getBMICategory(parseFloat(storedBmi)); // คำนวณระดับ BMI

      const combinedLabel = `${bmiCategory}${shirtLabel}${pantLabel}${skinLabel}`;

      if (combinedLabel !== previousCombinedLabelRef.current) {
        previousCombinedLabelRef.current = combinedLabel;
        console.log('Generated Pet Clothes label:', combinedLabel);

        try {
          const clothingPetsData = await fetchAndCacheClothingPets();
          const matchingPet = clothingPetsData.find(item => item.label === combinedLabel);

          if (matchingPet) {
            console.log('Matching Pet Found:', matchingPet);
            setPetImageUrl(matchingPet.url || null);
            const userId = await getUserId();
            if (!userId) return;

             // บันทึกเฉพาะกรณีที่ URL มีค่า
            if (matchingPet.url) {
              setPetImageUrl(matchingPet.url);
              await AsyncStorage.setItem(`petImageUrl-${userId}`, matchingPet.url || ''); // บันทึก URL ที่ถูกต้อง
            } else {
              setPetImageUrl(null); // ตั้งค่าใน state เป็น null
              await AsyncStorage.removeItem(`petImageUrl-${userId}`); // ลบค่า URL ที่ไม่ถูกต้องออกจาก AsyncStorage
              console.log('No matching pet found for label:', combinedLabel);
            }
            
            // อัปเดตข้อมูลสัตว์เลี้ยงในเซิร์ฟเวอร์
            await fetchAndUpdateClothingPets(combinedLabel, userId);
          } else {
            setPetImageUrl(null);
          }
        } catch (error) {
          console.error('Error fetching and updating pet image:', error);
        }
      }
    };

    updatePetImage();
  }, [selectedItems, bmi]);

  // console.log('Current BMI:', bmi);
  // console.log('Selected Items:', selectedItems);

  // ฟังก์ชันการสวมใส่เสื้อผ้า
  const handleWear = async (category, image, name, label) => {
    const userId = await getUserId();
    if (!userId) return;

    const updatedItems = {
      ...selectedItems,
      [category]: { image, label, name },
    };

    setSelectedItems(updatedItems); // อัปเดตข้อมูลการสวมใส่ใน state
    await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(updatedItems)); // เก็บข้อมูลใหม่ใน AsyncStorage
  };

  // ฟังก์ชันการถอดเสื้อผ้า
  const handleRemove = async (category) => {
    const userId = await getUserId();
    if (!userId) return;

    const updatedItems = {
      ...selectedItems,
      [category]: null,
    };

    setSelectedItems(updatedItems); // อัปเดตข้อมูลการถอดเสื้อผ้าใน state
    await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(updatedItems)); // จัดเก็บการอัปเดตลงใน AsyncStorage
  };

  const getBMICategory = (bmi) => {
    // console.log('Received BMI for categorization:', bmi);
    if (!bmi || isNaN(bmi)) return 'BMI01'; 
    if (bmi >= 30.0) return 'BMI04';
    if (bmi >= 25.0) return 'BMI03';
    if (bmi >= 18.6) return 'BMI02';
    return 'BMI01';
  };

  // แสดงรายการเสื้อผ้า
  const renderItems = () => {
    if (!itemsData[selectedCategory].length) {
      return null;
    }

    return itemsData[selectedCategory].map((item) => (
      <View key={item.id} style={styles.item}>
        <Image source={item.image ? { uri: item.image } : empty} style={styles.itemImage} />
        <Text style={styles.itemName}>{item.name}</Text>
        {item.image && selectedItems[selectedCategory]?.label !== item.label && (
          <TouchableOpacity
            style={styles.itemButton}
            onPress={() => handleWear(selectedCategory, item.image, item.name, item.label)}
          >
            <Text style={styles.itemButtonText}>สวมใส่</Text>
          </TouchableOpacity>
        )}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.gymBackgroundContainer}>
        <ImageBackground source={gym} style={styles.gymBackground}>
          <View style={styles.header}>
            <ProfileButton />
            <DollarIcon />
          </View>
          <View style={styles.petDisplay}>
            <Image source={petImageUrl ? { uri: petImageUrl } : empty} style={styles.petImage} />
          </View>
        </ImageBackground>
      </View>
      <View style={styles.orangeBackground}>
        <View style={styles.wardrobeMenu}>
          <Image source={wardrobe} style={styles.wardrobeIcon} />
          <Text style={styles.wardrobeText}>ตู้เสื้อผ้า</Text>
        </View>
        <View style={styles.collectionWearMenu}>
          {['shirt', 'pant', 'skin'].map((category, index) => (
            <View key={index} style={styles.collectionWearButton}>
              <View style={styles.insidecollectionWear}>
              {selectedItems[category] && selectedItems[category].image !== empty && selectedItems[category].label !== 'K00' && (
                <TouchableOpacity style={styles.crossButton} onPress={() => handleRemove(category)}>
                  <Image source={cross} style={styles.crossIcon} />
                </TouchableOpacity>
              )}
                <Image 
                  source={selectedItems[category] && selectedItems[category].image ? { uri: selectedItems[category].image.toString() } : empty}
                  style={styles.collectionWearIcon}
                />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.collectionMenu}>
          <TouchableOpacity style={styles.collectionButton} onPress={() => setSelectedCategory("shirt")}>
            <View style={selectedCategory === "shirt" ? styles.afterinsidecollection : styles.beforeinsidecollection}>
              <Image source={shirtIcon} style={styles.collectionIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.collectionButton} onPress={() => setSelectedCategory("pant")}>
            <View style={selectedCategory === "pant" ? styles.afterinsidecollection : styles.beforeinsidecollection}>
              <Image source={pantsIcon} style={styles.collectionIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.collectionButton} onPress={() => setSelectedCategory("skin")}>
            <View style={selectedCategory === "skin" ? styles.afterinsidecollection : styles.beforeinsidecollection}>
              <Image source={skinIcon} style={styles.collectionIcon} />
            </View>
          </TouchableOpacity>
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
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gymBackgroundContainer: { flex: 4 },
  gymBackground: { flex: 1, resizeMode: "cover" },
  orangeBackground: { flex: 6, backgroundColor: "#FFAF32" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20 },
  petDisplay: { flex: 2, justifyContent: "center", alignItems: "center" },
  petImage: { width: 280, height: 280, resizeMode: "contain" },
  wardrobeIcon: { width: 50, height: 50, marginVertical: 10, alignSelf: "center" },
  wardrobeText: { fontSize: 32, color: "#FFF", fontFamily: "appfont_02", marginLeft: 15 },
  wardrobeMenu: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  collectionWearMenu: { flexDirection: "row", justifyContent: "center", zIndex: 2 },
  collectionWearButton: { width: 96, height: 96, borderRadius: 15, backgroundColor: "#FFAF32", justifyContent: "center", alignItems: "center", borderColor: "#9E640A", marginTop: 6, borderWidth: 8, marginHorizontal: 10 },
  insidecollectionWear: { width: 82, height: 82, borderRadius: 12, justifyContent: "center", alignItems: "center", borderColor: "#F9E79F", borderWidth: 8 },
  collectionWearIcon: { width: 60, height: 60, resizeMode: "contain", position: "absolute" },
  crossButton: { width: 50, height: 50, justifyContent: "center", alignItems: "center", top: -42, left: 42 },
  crossIcon: { width: 30, height: 30, position: "absolute" },
  collectionMenu: { flexDirection: "row", marginTop: 10, marginLeft: 10, zIndex: 2 },
  collectionButton: { width: 70, height: 70, borderRadius: 15, backgroundColor: "#FFAF32", justifyContent: "center", alignItems: "center", borderColor: "#9E640A", borderWidth: 6, margin: 2 },
  beforeinsidecollection: { width: 60, height: 60, borderRadius: 10, justifyContent: "center", alignItems: "center", borderColor: "#F9E79F", borderWidth: 6 },
  afterinsidecollection: { width: 60, height: 60, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  collectionIcon: { width: 40, height: 40, resizeMode: "contain" },
  itemsBackground: { backgroundColor: "#9E640A", top: -20, zIndex: 1, flex: 1, marginBottom: -20 },
  itemsMenu: { flex: 1, marginTop: 18 },
  itemsMenuContent: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", margin: 5 },
  item: { width: "21%", marginHorizontal: "2%", marginBottom: "5%", height: 100, backgroundColor: "#FFAF32", alignItems: "center", borderColor: "#F9E79F", borderWidth: 8 },
  itemImage: { width: 60, height: 60, resizeMode: "contain", top: 3 },
  itemName: { fontSize: 10, bottom: 26, color: "#FFF", top: 1, fontFamily: "appfont_02", textAlign: "center" },
  itemButton: { backgroundColor: "#F9E79F", borderRadius: 10, paddingVertical: 2, paddingHorizontal: 10, borderWidth: 0.5, top: 2 },
  itemButtonText: { fontSize: 14, color: "#000", fontFamily: "appfont_02" },
});
