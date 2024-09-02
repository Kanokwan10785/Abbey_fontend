import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from './BottomBar';
import ProfileButton from './BottomProfile.js';
import DollarIcon from './Dollar.js';
import { ClothingContext } from './ClothingContext';
import { fetchUserClothingData, fetchClothingPets, fetchAndUpdateClothingPets } from './api.js';
import wardrobe from '../../assets/image/bar-02.png';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import shirtIcon from '../../assets/image/Clothing-Icon/Shirt/shirt-icon-02.png';
import pantsIcon from '../../assets/image/Clothing-Icon/Pant/pant-icon-02.png';
import skinIcon from '../../assets/image/Clothing-Icon/Skin/skin-icon-02.png';
import empty from '../../assets/image/Clothing-Icon/empty-icon-01.png';
import cross from '../../assets/image/Clothing-Icon/cross-icon-01.png';

export default function ClothingScreen() {
  const { selectedItems, setSelectedItems } = useContext(ClothingContext);
  const [selectedCategory, setSelectedCategory] = useState("shirt");
  const [itemsData, setItemsData] = useState({ shirt: [], pant: [], skin: [] });
  const [petImageUrl, setPetImageUrl] = useState(null);

  useEffect(() => {
    const loadUserClothingData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found in AsyncStorage');
          return;
        }

        // โหลดข้อมูลสำรองจาก AsyncStorage
        const savedOutfits = await AsyncStorage.getItem(`userOutfit-${userId}`);
        const savedPetImageUrl = await AsyncStorage.getItem(`petImageUrl-${userId}`);
        if (savedOutfits) {
          setSelectedItems(JSON.parse(savedOutfits));
        }
        if (savedPetImageUrl) {
          setPetImageUrl(savedPetImageUrl);
        }

        const cachedClothingData = await AsyncStorage.getItem(`clothingData-${userId}`);
        if (cachedClothingData) {
          organizeClothingData(JSON.parse(cachedClothingData));
        }

        // ดึงข้อมูลล่าสุดจาก API และเก็บข้อมูลใน AsyncStorage
        const data = await fetchUserClothingData(userId);
        organizeClothingData(data);
        await AsyncStorage.setItem(`clothingData-${userId}`, JSON.stringify(data));
      } catch (error) {
        console.error('Error loading user clothing data:', error.message);
      }
    };

    loadUserClothingData();
  }, []);

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

    setItemsData(organizedData);
  };

  useEffect(() => {
    const updatePetImage = async () => {
      const shirtLabel = selectedItems.shirt?.label || 'S00';
      const pantLabel = selectedItems.pant?.label || 'P00';
      const skinLabel = selectedItems.skin?.label || 'K00';
  
      const combinedLabel = `${shirtLabel}${pantLabel}${skinLabel}`;
      console.log('Combined label:', combinedLabel);
  
      try {
        // ขั้นตอนที่ 1 และ 2
        const clothingPetsData = await fetchClothingPets();
        const matchingPet = clothingPetsData.find(item => item.label === combinedLabel);

        if (matchingPet) {
          // ถ้าเจอชุดที่ตรงกัน ให้ทำการ PUT API เพื่อลิงก์ผู้ใช้กับเสื้อผ้านั้น
          const userId = await AsyncStorage.getItem('userId');
          if (userId) {
            await fetchAndUpdateClothingPets(combinedLabel, userId);
          }

          // อัปเดต URL ของภาพสัตว์เลี้ยง และบันทึกใน AsyncStorage
          const petUrl = matchingPet.url;
          setPetImageUrl(petUrl);
          await AsyncStorage.setItem(`petImageUrl-${userId}`, petUrl);
        } else {
          setPetImageUrl(null);
        }
      } catch (error) {
        console.error('Error fetching and updating pet image:', error);
      }
    };
  
    updatePetImage();
  }, [selectedItems.shirt, selectedItems.pant, selectedItems.skin]); 

  const handleWear = async (category, image, name, label) => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in AsyncStorage');
      return;
    }

    const updatedItems = {
      ...selectedItems,
      [category]: { image, label, name },
    };

    setSelectedItems(updatedItems);

    // บันทึกข้อมูลการสวมใส่ล่าสุดใน AsyncStorage
    await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(updatedItems));
  };

  const handleRemove = async (category) => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      console.error('User ID not found in AsyncStorage');
      return;
    }

    if (category === 'skin') {
      try {
        const clothingPetsData = await fetchClothingPets();
        const matchingPet = clothingPetsData.find(item => item.label === 'K00');
        
        if (matchingPet) {
          const updatedItems = {
            ...selectedItems,
            [category]: { image: matchingPet.url, name: 'K00', label: 'K00' },
          };
          setSelectedItems(updatedItems);

          await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(updatedItems));
        } else {
          console.error('No matching pet found for label K00');
          const updatedItems = {
            ...selectedItems,
            [category]: { image: empty, name: 'Unknown', label: 'K00' },
          };
          setSelectedItems(updatedItems);

          await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(updatedItems));
        }
      } catch (error) {
        console.error('Error fetching pet image for K00:', error);
        const updatedItems = {
          ...selectedItems,
          [category]: { image: empty, name: 'Unknown', label: 'K00' },
        };
        setSelectedItems(updatedItems);

        await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(updatedItems));
      }
    } else {
      const updatedItems = {
        ...selectedItems,
        [category]: null,
      };
      setSelectedItems(updatedItems);

      await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(updatedItems));
    }
  };

  const renderItems = () => {
    if (!itemsData[selectedCategory].length) {
      return null;
    }

    return (
      <>
        {itemsData[selectedCategory].map((item) => (
          <View key={item.id} style={styles.item}>
            <Image source={item.image ? { uri: item.image } : empty} style={styles.itemImage} />
            <Text style={styles.itemName}>{item.name}</Text>
            {item.image && (
              <TouchableOpacity style={styles.itemButton} onPress={() => handleWear(selectedCategory, item.image, item.name, item.label)}>
                <Text style={styles.itemButtonText}>สวมใส่</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
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
                {selectedItems[category] && selectedItems[category].image !== empty && (
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
  container: {
    flex: 1,
  },
  gymBackgroundContainer: {
    flex: 4, // 4/10 ของหน้าจอ
  },
  gymBackground: {
    flex: 1,
    resizeMode: "cover",
  },
  orangeBackground: {
    flex: 6, // 6/10 ของหน้าจอ
    backgroundColor: "#FFAF32",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  petDisplay: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  petImage: {
    width: 210,
    height: 210,
    resizeMode: "contain",
  },
  wardrobeIcon: {
    width: 50,
    height: 50,
    marginVertical: 10,
    alignSelf: "center",
  },
  wardrobeText: {
    fontSize: 32,
    color: "#FFF",
    fontFamily: "appfont_02",
    marginLeft: 15,
  },
  wardrobeMenu: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  collectionWearMenu: {
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 2, // เพิ่ม zIndex เพื่อให้อยู่ข้างหน้าของ itemsMenu
  },
  collectionWearButton: {
    width: 96,
    height: 96,
    borderRadius: 15,
    backgroundColor: "#FFAF32",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#9E640A",
    marginTop: 6,
    borderWidth: 8,
    marginHorizontal: 10,
  },
  insidecollectionWear: {
    width: 82,
    height: 82,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#F9E79F",
    borderWidth: 8,
  },
  collectionWearIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    position: "absolute",
    // backgroundColor: "#fff",
  },
  crossButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    top: -42,
    left: 42,
  },
  crossIcon: {
    width: 30,
    height: 30,
    position: "absolute",
  },
  collectionMenu: {
    flexDirection: "row",
    marginTop: 10,
    marginLeft: 10,
    zIndex: 2, // เพิ่ม zIndex เพื่อให้อยู่ข้างหน้าของ itemsMenu
  },
  collectionButton: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: "#FFAF32",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#9E640A",
    borderWidth: 6,
    margin: 2,
  },
  beforeinsidecollection: {
    width: 60,
    height: 60,
    borderRadius: 10, //มีปัญหา
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#F9E79F",
    borderWidth: 6,
  },
  afterinsidecollection: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  collectionIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  itemsBackground: {
    backgroundColor: "#9E640A",
    top: -20,
    zIndex: 1, // เพิ่ม zIndex ให้ต่ำกว่าของ collectionMenu
    flex: 1,
    marginBottom: -20,
  },
  itemsMenu: {
    flex: 1,
    marginTop: 18,
  },
  itemsMenuContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    margin: 5,
  },
  item: {
    width: '21%',
    marginHorizontal: '2%',
    marginBottom: '5%',
    height: 100,
    backgroundColor: "#FFAF32",
    alignItems: "center",
    borderColor: "#F9E79F",
    borderWidth: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    top: 3,
  },
  itemName: {
    fontSize: 10,
    bottom: 26,
    color: "#FFF",
    top: 1,

    fontFamily: "appfont_02",
    textAlign: "center",
  },
  itemButton: {
    backgroundColor: "#F9E79F",
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    top: 2,
  },
  itemButtonText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "appfont_02",
  },
});
