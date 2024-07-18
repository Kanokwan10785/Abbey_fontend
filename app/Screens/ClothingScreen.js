import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import BottomBar from './BottomBar';
import ProfileButton from './Profile.js';
import DollarIcon from './Dollar.js';
import { ClothingContext } from './ClothingContext';
import wardrobe from '../../assets/image/bar-02.png';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import shirtIcon from '../../assets/image/Clothing-Icon/Shirt/shirt-icon-02.png';
import pantsIcon from '../../assets/image/Clothing-Icon/Pant/pant-icon-02.png';
import skinIcon from '../../assets/image/Clothing-Icon/Skin/skin-icon-02.png';
import empty from '../../assets/image/Clothing-Icon/empty-icon-01.png';
import cross from '../../assets/image/Clothing-Icon/cross-icon-01.png';

const itemsData = {
  shirt: [
    { id: 1, image: require('../../assets/image/Clothing-Item/Shirt/S01.png'), name: 'S01' },
    { id: 2, image: require('../../assets/image/Clothing-Item/Shirt/S02.png'), name: 'S02' },
    { id: 3, image: null }, { id: 4, image: null }, { id: 5, image: null }, 
    { id: 6, image: null }, { id: 7, image: null }, { id: 8, image: null }, 
    { id: 9, image: null }, { id: 10, image: null }, { id: 11, image: null }, 
  ],
  pant: [
    { id: 1, image: require('../../assets/image/Clothing-Item/Pant/P01.png'), name: 'P01' },
    { id: 2, image: require('../../assets/image/Clothing-Item/Pant/P02.png'), name: 'P02' },
    { id: 3, image: null }, { id: 4, image: null },
  ],
  skin: [
    { id: 1, image: require('../../assets/image/Clothing-Item/Skin/K00.png'), name: 'K00' },
    { id: 2, image: require('../../assets/image/Clothing-Item/Skin/K01.png'), name: 'K01' },
    { id: 3, image: null }, { id: 4, image: null },
  ],
};

const petImages = {
  S00P00K00: require('../../assets/image/Clothing-Pet/S00P00K00.png'),
  S00P00K01: require('../../assets/image/Clothing-Pet/S00P00K01.png'),
  S00P01K00: require('../../assets/image/Clothing-Pet/S00P01K00.png'),
  S00P01K01: require('../../assets/image/Clothing-Pet/S00P01K01.png'),
  S00P02K00: require('../../assets/image/Clothing-Pet/S00P02K00.png'),
  S00P02K01: require('../../assets/image/Clothing-Pet/S00P02K01.png'),
  S01P00K00: require('../../assets/image/Clothing-Pet/S01P00K00.png'),
  S01P00K01: require('../../assets/image/Clothing-Pet/S01P00K01.png'),
  S01P01K00: require('../../assets/image/Clothing-Pet/S01P01K00.png'),
  S01P01K01: require('../../assets/image/Clothing-Pet/S01P01K01.png'),
  S01P02K00: require('../../assets/image/Clothing-Pet/S01P02K00.png'),
  S01P02K01: require('../../assets/image/Clothing-Pet/S01P02K01.png'),
  S02P00K00: require('../../assets/image/Clothing-Pet/S02P00K00.png'),
  S02P00K01: require('../../assets/image/Clothing-Pet/S02P00K01.png'),
  S02P01K00: require('../../assets/image/Clothing-Pet/S02P01K00.png'),
  S02P01K01: require('../../assets/image/Clothing-Pet/S02P01K01.png'),
  S02P02K00: require('../../assets/image/Clothing-Pet/S02P02K00.png'),
  S02P02K01: require('../../assets/image/Clothing-Pet/S02P02K01.png'),
};

export default function ClothingScreen() {
  const { selectedItems, setSelectedItems } = useContext(ClothingContext);
  const [selectedCategory, setSelectedCategory] = useState("shirt");

  useEffect(() => {
    updatePetImage();
  }, [selectedItems.shirt, selectedItems.pant, selectedItems.skin]);

  const handleWear = (category, image, name) => {
    setSelectedItems(prevState => ({
      ...prevState,
      [category]: { image, name },
    }));
  };

  const handleRemove = (category) => {
    setSelectedItems(prevState => ({
      ...prevState,
      [category]: category === 'skin' ? { image: require('../../assets/image/Clothing-Item/Skin/K00.png'), name: 'K00' } : null,
    }));
  };

  const updatePetImage = () => {
    const { shirt, pant, skin } = selectedItems;
    const shirtName = shirt ? shirt.name : 'S00';
    const pantName = pant ? pant.name : 'P00';
    const skinName = skin ? skin.name : 'K00';

    const petKey = `${shirtName}${pantName}${skinName}`;
    setSelectedItems(prevState => ({
      ...prevState,
      mypet: petImages[petKey] || null,
    }));
  };

  const renderItems = () => {
    return (
      <>
        {itemsData[selectedCategory].map((item) => (
          <View key={item.id} style={styles.item}>
            <Image source={item.image ? item.image : empty} style={styles.itemImage} />
            {item.image && (
              <TouchableOpacity style={styles.itemButton} onPress={() => handleWear(selectedCategory, item.image, item.name)}>
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
            <Image source={selectedItems.mypet ? selectedItems.mypet : empty} style={styles.petImage} />
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
                <Image source={selectedItems[category] ? selectedItems[category].image : empty} style={styles.collectionWearIcon} />
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
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#F9E79F",
    borderWidth: 6,
  },
  afterinsidecollection: {
    width: 60,
    height: 60,
    borderRadius: 10,
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
    width: '20%',
    marginHorizontal: '2.5%',
    marginBottom: '5%',
    height: 85,
    backgroundColor: "#FFAF32",
    alignItems: "center",
    borderColor: "#F9E79F",
    borderWidth: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  itemButton: {
    backgroundColor: "#F9E79F",
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderWidth: 0.5,
  },
  itemButtonText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "appfont_02",
  },
});
