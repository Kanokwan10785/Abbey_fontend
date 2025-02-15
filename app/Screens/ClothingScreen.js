import React, { useState, useEffect, useRef } from 'react';
import { Image, ImageBackground } from 'expo-image';
import { View, Text, StyleSheet, TouchableOpacity, DeviceEventEmitter, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from './BottomBar';
import ProfileButton from './BottomProfile.js';
import DollarIcon from './Dollar.js';
import { fetchUserClothingData, fetchClothingPets, fetchUserProfile, fetchAndUpdateClothingPets, saveUserOutfitToServer } from './api.js';
import wardrobe from '../../assets/image/bar-02.png';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import shirtIcon from '../../assets/image/Clothing-Icon/Shirt/shirt-icon-02.png';
import pantsIcon from '../../assets/image/Clothing-Icon/Pant/pant-icon-02.png';
import skinIcon from '../../assets/image/Clothing-Icon/Skin/skin-icon-02.png';
import empty from '../../assets/image/Clothing-Icon/empty-icon-01.png';
import cross from '../../assets/image/Clothing-Icon/cross-icon-01.png';

export default function ClothingScreen({}) {
  const [selectedItems, setSelectedItems] = useState({
    shirt: null,
    pant: null,
    skin: { 
      label: 'K00', 
      image: 'https://res.cloudinary.com/durwrb53f/image/upload/v1723148270/K00_636d3caec1.png', 
      name: 'ลายทางสีเทา' 
    }, 
  });  
  const [selectedCategory, setSelectedCategory] = useState("shirt");
  const [itemsData, setItemsData] = useState({ shirt: [], pant: [], skin: [] });
  const [petImageUrl, setPetImageUrl] = useState(null);
  const previousCombinedLabelRef = useRef(null);
  const [bmi, setBmi] = useState(null);
  const previousSelectedItemsRef = useRef(null);
  const previousBmiRef = useRef(null);

  const cachedClothingPetsData = useRef(null);

  // ฟังก์ชันโหลดข้อมูลเมื่อมีการรีเฟรช
  const refreshData = async () => {
    try {
      await fetchAndStoreBMI();
      await loadUserClothingData();
    } catch (error) {
      console.error('Error refreshing ClothingScreen:', error);
    }
  }; 

  // ฟังก์ชันสำหรับเรียกข้อมูลเสื้อผ้า
  const loadUserClothingData = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;
  
      // ดึงข้อมูลจาก AsyncStorage หากมี
      const savedOutfits = await AsyncStorage.getItem(`userOutfit-${userId}`);
      const cachedClothingData = await AsyncStorage.getItem(`clothingData-${userId}`);
  
      if (savedOutfits) {
        setSelectedItems(JSON.parse(savedOutfits)); // อัปเดต state ด้วยข้อมูลที่ดึงจาก AsyncStorage
      }
  
      if (cachedClothingData) {
        organizeClothingData(JSON.parse(cachedClothingData));
      }
  
      // ดึงข้อมูลจาก API และอัปเดต AsyncStorage
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

  useEffect(() => {
    loadUserClothingData();
  }, [setSelectedItems]);

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

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('clothingUpdated', async () => {
        console.log("Clothing Updated, fetching new data...");
        await loadUserClothingData(); // โหลดข้อมูลเสื้อผ้าใหม่
    });

    return () => {
        subscription.remove(); // ลบ Listener เมื่อ Component ถูก Unmount
    };
  }, []);

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

  // ฟังก์ชันสำหรับอัปเดตเสื้อผ้าสัตว์เลี้ยง
  const updatePetImage = async () => {
    const shirtLabel = selectedItems.shirt?.label || 'S00';
    const pantLabel = selectedItems.pant?.label || 'P00';
    const skinLabel = selectedItems.skin?.label || 'K00';

    console.log("🔄 Checking if pet image update is needed...");

    // คำนวณ BMI Category
    const userId = await getUserId();
    const storedBmi = await AsyncStorage.getItem(`bmi-${userId}`);
    const bmiCategory = getBMICategory(parseFloat(storedBmi));

    const combinedLabel = `${bmiCategory}${shirtLabel}${pantLabel}${skinLabel}`;

    // ถ้าไม่มีการเปลี่ยนแปลงของป้ายเสื้อผ้า → ไม่ต้องทำ PUT
    if (combinedLabel === previousCombinedLabelRef.current) {
        console.log('✅ No change in clothing label, skipping PUT.');

        // โหลดรูปภาพจาก AsyncStorage เพื่อแสดงรูปเดิม
        const savedPetImageUrl = await AsyncStorage.getItem(`petImageUrl-${userId}`);
        if (savedPetImageUrl) {
            setPetImageUrl(savedPetImageUrl);
        }
        return;
    }

    // อัปเดตค่าเก็บไว้
    previousCombinedLabelRef.current = combinedLabel;

    try {
        const clothingPetsData = await fetchAndCacheClothingPets();
        const matchingPet = clothingPetsData.find(item => item.label === combinedLabel);

        if (matchingPet) {
            setPetImageUrl(matchingPet.url || null);
            await AsyncStorage.setItem(`petImageUrl-${userId}`, matchingPet.url || '');

            // ทำการ PUT ไปที่ API
            await fetchAndUpdateClothingPets(combinedLabel, userId);
            console.log('✅ Clothing label updated:', combinedLabel);
            console.log("🛠 Matched Pet URL:", matchingPet ? matchingPet.url : "No match");
        } else {
            setPetImageUrl(null);
        }
    } catch (error) {
        console.error('❌ Error fetching and updating pet image:', error);
    }
};

  useEffect(() => {
    // ตรวจสอบว่ามีการเปลี่ยนแปลงจริง ๆ หรือไม่
    const isItemsChanged = JSON.stringify(selectedItems) !== JSON.stringify(previousSelectedItemsRef.current);
    const isBmiChanged = bmi !== previousBmiRef.current;
  
    if (isItemsChanged || isBmiChanged) {
      updatePetImage(); // เรียก updatePetImage เมื่อมีการเปลี่ยนแปลง
    }
  
    // อัปเดตค่าปัจจุบัน
    previousSelectedItemsRef.current = selectedItems;
    previousBmiRef.current = bmi;
  }, [selectedItems, bmi]);

  // console.log('Current BMI:', bmi);
  // console.log('Selected Items:', selectedItems);

  // ฟังก์ชันการสวมใส่เสื้อผ้า
  const handleWear = async (category, image, name, label) => {
    const userId = await getUserId();
    const token = await AsyncStorage.getItem('jwt');
    if (!userId || !token) return;

    const updatedItems = {
        ...selectedItems,
        [category]: { image, label, name },
    };

    if (JSON.stringify(updatedItems) !== JSON.stringify(selectedItems)) {
        setSelectedItems(updatedItems);
        await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(updatedItems));

        try {
            await saveUserOutfitToServer(userId, updatedItems, token);
            console.log(`✅ ${category} updated on server`);
        } catch (error) {
            console.error(`❌ Failed to update ${category} on server:`, error);
        }
    }
  };
  
  // ฟังก์ชันการถอดเสื้อผ้า
  const handleRemove = async (category) => {
    const userId = await getUserId();
    const token = await AsyncStorage.getItem('jwt'); // ดึง Token
    if (!userId || !token) return;

    let updatedItems = { ...selectedItems };

    if (category === 'skin') {
        updatedItems.skin = { 
            label: 'K00', 
            image: 'https://res.cloudinary.com/durwrb53f/image/upload/v1723148270/K00_636d3caec1.png', 
            name: 'ลายทางสีเทา'
        };
    } else {
        updatedItems[category] = null;
    }

    if (JSON.stringify(updatedItems) !== JSON.stringify(selectedItems)) {
        setSelectedItems(updatedItems);
        await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(updatedItems));

        // **อัปเดตข้อมูลไปยังเซิร์ฟเวอร์**
        try {
            await saveUserOutfitToServer(userId, updatedItems, token);
            console.log(`✅ Removed ${category} and updated on server`);
        } catch (error) {
            console.error(`❌ Failed to update server after removing ${category}:`, error);
        }
    }
  };

    // ฟังก์ชันกำหนด BMI prefix ตามค่า BMI
    const getBMICategory  = (bmi) => {
      if (!bmi || isNaN(bmi)) return 'BMI02'; 
      if (bmi < 18.60) return 'BMI01';
      if (bmi >= 18.60 && bmi < 24.99) return 'BMI02';
      if (bmi >= 25.00 && bmi < 29.99) return 'BMI03';
      return 'BMI04';
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
  gymBackground: { flex: 1, contentFit: "cover" },
  orangeBackground: { flex: 6, backgroundColor: "#FFAF32" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20 },
  petDisplay: { flex: 2, justifyContent: "center", alignItems: "center" },
  petImage: { width: 280, height: 280, contentFit: "contain" },
  wardrobeIcon: { width: 50, height: 50, marginVertical: 10, alignSelf: "center" },
  wardrobeText: { fontSize: 32, color: "#FFF", fontFamily: "appfont_02", marginLeft: 15 },
  wardrobeMenu: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  collectionWearMenu: { flexDirection: "row", justifyContent: "center", zIndex: 2 },
  collectionWearButton: { width: 96, height: 96, borderRadius: 15, backgroundColor: "#FFAF32", justifyContent: "center", alignItems: "center", borderColor: "#9E640A", marginTop: 6, borderWidth: 8, marginHorizontal: 10 },
  insidecollectionWear: { width: 82, height: 82, borderRadius: 12, justifyContent: "center", alignItems: "center", borderColor: "#F9E79F", borderWidth: 8 },
  collectionWearIcon: { width: 60, height: 60, contentFit: "contain", position: "absolute" },
  crossButton: { width: 50, height: 50, justifyContent: "center", alignItems: "center", top: -42, left: 42 },
  crossIcon: { width: 30, height: 30, position: "absolute" },
  collectionMenu: { flexDirection: "row", marginTop: 10, marginLeft: 10, zIndex: 2 },
  collectionButton: { width: 70, height: 70, borderRadius: 15, backgroundColor: "#FFAF32", justifyContent: "center", alignItems: "center", borderColor: "#9E640A", borderWidth: 6, margin: 2 },
  beforeinsidecollection: { width: 60, height: 60, borderRadius: 10, justifyContent: "center", alignItems: "center", borderColor: "#F9E79F", borderWidth: 6 },
  afterinsidecollection: { width: 60, height: 60, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  collectionIcon: { width: 40, height: 40, contentFit: "contain" },
  itemsBackground: { backgroundColor: "#9E640A", top: -20, zIndex: 1, flex: 1, marginBottom: -20 },
  itemsMenu: { flex: 1, marginTop: 18 },
  itemsMenuContent: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", margin: 5 },
  item: { width: "21%", marginHorizontal: "2%", marginBottom: "5%", height: 100, backgroundColor: "#FFAF32", alignItems: "center", borderColor: "#F9E79F", borderWidth: 8 },
  itemImage: { width: 60, height: 60, contentFit: "contain", top: 3 },
  itemName: { fontSize: 10, bottom: 26, color: "#FFF", top: 1, fontFamily: "appfont_02", textAlign: "center" },
  itemButton: { backgroundColor: "#F9E79F", borderRadius: 10, paddingVertical: 2, paddingHorizontal: 10, borderWidth: 0.5, top: 2 },
  itemButtonText: { fontSize: 14, color: "#000", fontFamily: "appfont_02" },
});
