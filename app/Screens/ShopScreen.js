import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import BottomBar from './BottomBar';
import ProfileButton from './Profile.js';
import DollarIcon from './Dollar.js';
import { ClothingContext } from './ClothingContext';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import shirtIcon from '../../assets/image/Clothing-Icon/Shirt/shirt-icon-02.png';
import pantsIcon from '../../assets/image/Clothing-Icon/Pant/pant-icon-02.png';
import skinIcon from '../../assets/image/Clothing-Icon/Skin/skin-icon-02.png';
import foodIcon from '../../assets/image/food-01.png';

const itemsData = {
  shirt: [
    { id: 1, image: require('../../assets/image/Clothing-Item/Shirt/S01.png'), name: 'S01', price: 'XX.XX' },
    { id: 2, image: require('../../assets/image/Clothing-Item/Shirt/S02.png'), name: 'S02', price: 'XX.XX' },
    { id: 3, image: null }, { id: 4, image: null }, { id: 5, image: null }, 
    { id: 6, image: null }, { id: 7, image: null }, { id: 8, image: null }, 
    { id: 9, image: null }, { id: 10, image: null }, { id: 11, image: null }, 
    { id: 12, image: null }, { id: 13, image: null }, { id: 14, image: null }, 
    { id: 15, image: null }, { id: 16, image: null }, { id: 17, image: null }, 
    { id: 18, image: null }, { id: 19, image: null }, { id: 20, image: null }, 
  ],
  pant: [
    { id: 1, image: require('../../assets/image/Clothing-Item/Pant/P01.png'), name: 'P01', price: 'XX.XX' },
    { id: 2, image: require('../../assets/image/Clothing-Item/Pant/P02.png'), name: 'P02', price: 'XX.XX' },
    { id: 3, image: null }, { id: 4, image: null },
  ],
  skin: [
    { id: 1, image: require('../../assets/image/Clothing-Item/Skin/K00.png'), name: 'K00', price: 'XX.XX' },
    { id: 2, image: require('../../assets/image/Clothing-Item/Skin/K01.png'), name: 'K01', price: 'XX.XX' },
    { id: 3, image: null }, { id: 4, image: null },
  ],
  food: [
    { id: 1, image: require('../../assets/image/Clothing-Item/Food/F01.png'), name: 'F01', price: 'XX.XX' },
    { id: 2, image: require('../../assets/image/Clothing-Item/Food/F02.png'), name: 'F02', price: 'XX.XX' },
    { id: 3, image: require('../../assets/image/Clothing-Item/Food/F03.png'), name: 'F03', price: 'XX.XX' },
    { id: 4, image: require('../../assets/image/Clothing-Item/Food/F04.png'), name: 'F04', price: 'XX.XX' },
    { id: 5, image: require('../../assets/image/Clothing-Item/Food/F05.png'), name: 'F05', price: 'XX.XX' },
    { id: 6, image: require('../../assets/image/Clothing-Item/Food/F06.png'), name: 'F06', price: 'XX.XX' },
    { id: 7, image: null }, { id: 8, image: null },
  ],
};

export default function ShopScreen() {
  const { selectedItems, setSelectedItems } = useContext(ClothingContext);
  const [balance, setBalance] = useState(1250);
  const [selectedCategory, setSelectedCategory] = useState('shirt');

  const handleBuy = (item) => {
    if (balance >= parseFloat(item.price)) {
      setBalance(balance - parseFloat(item.price));
      setSelectedItems(prevState => ({
        ...prevState,
        [selectedCategory]: item,
      }));
    } else {
      alert('ยอดเงินไม่พอ');
    }
  };

  const renderItems = () => {
    return itemsData[selectedCategory].map((item) => (
      <View key={item.id} style={styles.item}>
        <View style={styles.insideitemImage}>
          <Image source={item.image} style={styles.itemImage} />
        </View>
        {item.image && (
          <>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.itemButton} onPress={() => handleBuy(item)}>
              <Text style={styles.itemButtonText}>ซื้อ</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={gym} style={styles.gymBackground}>
        <View style={styles.header}>
          <ProfileButton />
          <DollarIcon />
        </View>
      </ImageBackground>
      <View style={styles.categoryMenu}>
        <TouchableOpacity style={styles.categoryButton} onPress={() => setSelectedCategory("shirt")}>
          <View style={selectedCategory === "shirt" ? styles.afterinsidecategory : styles.beforeinsidecategory}>
            <Image source={shirtIcon} style={styles.categoryIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton} onPress={() => setSelectedCategory("pant")}>
          <View style={selectedCategory === "pant" ? styles.afterinsidecategory : styles.beforeinsidecategory}>
            <Image source={pantsIcon} style={styles.categoryIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton} onPress={() => setSelectedCategory("skin")}>
          <View style={selectedCategory === "skin" ? styles.afterinsidecategory : styles.beforeinsidecategory}>
            <Image source={skinIcon} style={styles.categoryIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton} onPress={() => setSelectedCategory("food")}>
          <View style={selectedCategory === "food" ? styles.afterinsidecategory : styles.beforeinsidecategory}>
            <Image source={foodIcon} style={styles.categoryIcon} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.itemsBackground}>
        <ScrollView style={styles.itemsMenu} contentContainerStyle={styles.itemsMenuContent}>
          {renderItems()}
        </ScrollView>
      </View>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gymBackground: {
    resizeMode: "cover",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  categoryMenu: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#9E640A',
    marginTop: -10,
    // zIndex: 2, // เพิ่ม zIndex เพื่อให้อยู่ข้างหน้าของ itemsMenu
  },
  categoryButton: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#FFAF32",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: -6,
  },
  beforeinsidecategory: {
    width: 85,
    height: 85,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9E79F",
  },
  afterinsidecategory: {
    width: 85,
    height: 85,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  itemsBackground: {
    backgroundColor: "#9E640A",
    flex: 1,
    zIndex: 1, // เพิ่ม zIndex ให้ต่ำกว่าของ collectionMenu
  },
  itemsMenu: {
    flex: 1,
    // marginTop: 8,
    // marginBottom: -8,
    backgroundColor: "#FFAF32",
  },
  itemsMenuContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  item: {
    width: '28%',
    marginHorizontal: '2.5%',
    marginBottom: '2.5%',
    height: 136,
    backgroundColor: '#9E640A',
    borderRadius: 10,
    alignItems: 'center',
    borderColor: "#F9E79F",
    borderWidth: 6,
    marginBottom: 18,
    marginTop: 5,
  },
  insideitemImage: {
    width: 90,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    borderRadius: 15,
    backgroundColor: '#FFAF32',
    marginTop: 8,
  },
  itemImage: {
    width: 85,
    height: 85,
  },
  itemPrice: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    fontFamily: "appfont_02",
  },
  itemButton: {
    backgroundColor: "#F9E79F",
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 25,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemButtonText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "appfont_02",
  },
});
