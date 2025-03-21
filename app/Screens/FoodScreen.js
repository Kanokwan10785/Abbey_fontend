import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import BottomBar from './BottomBar';
import ProfileButton from './BottomProfile.js';
import DollarIcon from './Dollar.js';
import { ClothingContext } from './ClothingContext';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import empty from '../../assets/image/Clothing-Icon/empty-icon-01.png';
import fruit from '../../assets/image/fruit-01.png';
import cross from '../../assets/image/Clothing-Icon/cross-icon-01.png';

const initialFoodData = [
  { id: 1, image: require('../../assets/image/Clothing-Item/Food/F01.png'), name: 'F01', quantity: 12 },
  { id: 2, image: require('../../assets/image/Clothing-Item/Food/F02.png'), name: 'F02', quantity: 0 },
  { id: 3, image: require('../../assets/image/Clothing-Item/Food/F03.png'), name: 'F03', quantity: 0 },
  { id: 4, image: require('../../assets/image/Clothing-Item/Food/F04.png'), name: 'F04', quantity: 8 },
  { id: 5, image: require('../../assets/image/Clothing-Item/Food/F05.png'), name: 'F05', quantity: 0 },
  { id: 6, image: require('../../assets/image/Clothing-Item/Food/F06.png'), name: 'F06', quantity: 0 },
];

const defaultPetImages = {
  S00P00K00: require('../../assets/image/Food-Pet/S00P00K00.gif'),
  S00P00K01: require('../../assets/image/Food-Pet/S00P00K01.gif'),
  S00P01K00: require('../../assets/image/Food-Pet/S00P01K00.gif'),
  S00P01K01: require('../../assets/image/Food-Pet/S00P01K01.gif'),
  S00P02K00: require('../../assets/image/Food-Pet/S00P02K00.gif'),
  S00P02K01: require('../../assets/image/Food-Pet/S00P02K01.gif'),
  S01P00K00: require('../../assets/image/Food-Pet/S01P00K00.gif'),
  S01P00K01: require('../../assets/image/Food-Pet/S01P00K01.gif'),
  S01P01K00: require('../../assets/image/Food-Pet/S01P01K00.gif'),
  S01P01K01: require('../../assets/image/Food-Pet/S01P01K01.gif'),
  S01P02K00: require('../../assets/image/Food-Pet/S01P02K00.gif'),
  S01P02K01: require('../../assets/image/Food-Pet/S01P02K01.gif'),
  S02P00K00: require('../../assets/image/Food-Pet/S02P00K00.gif'),
  S02P00K01: require('../../assets/image/Food-Pet/S02P00K01.gif'),
  S02P01K00: require('../../assets/image/Food-Pet/S02P01K00.gif'),
  S02P01K01: require('../../assets/image/Food-Pet/S02P01K01.gif'),
  S02P02K00: require('../../assets/image/Food-Pet/S02P02K00.gif'),
  S02P02K01: require('../../assets/image/Food-Pet/S02P02K01.gif'),
};

const eatingPetImages = {
  S00P00K00F01: require('../../assets/image/Food-Pet/S00P00K00F01.gif'),
  S00P00K01F01: require('../../assets/image/Food-Pet/S00P00K01F01.gif'),
  S00P01K00F01: require('../../assets/image/Food-Pet/S00P01K00F01.gif'),
  S00P01K01F01: require('../../assets/image/Food-Pet/S00P01K01F01.gif'),
  S00P02K00F01: require('../../assets/image/Food-Pet/S00P02K00F01.gif'),
  S00P02K01F01: require('../../assets/image/Food-Pet/S00P02K01F01.gif'),
  S01P00K00F01: require('../../assets/image/Food-Pet/S01P00K00F01.gif'),
  S01P00K01F01: require('../../assets/image/Food-Pet/S01P00K01F01.gif'),
  S01P01K00F01: require('../../assets/image/Food-Pet/S01P01K00F01.gif'),
  S01P01K01F01: require('../../assets/image/Food-Pet/S01P01K01F01.gif'),
  S01P02K00F01: require('../../assets/image/Food-Pet/S01P02K00F01.gif'),
  S01P02K01F01: require('../../assets/image/Food-Pet/S01P02K01F01.gif'),
  S02P00K00F01: require('../../assets/image/Food-Pet/S02P00K00F01.gif'),
  S02P00K01F01: require('../../assets/image/Food-Pet/S02P00K01F01.gif'),
  S02P01K00F01: require('../../assets/image/Food-Pet/S02P01K00F01.gif'),
  S02P01K01F01: require('../../assets/image/Food-Pet/S02P01K01F01.gif'),
  S02P02K00F01: require('../../assets/image/Food-Pet/S02P02K00F01.gif'),
  S02P02K01F01: require('../../assets/image/Food-Pet/S02P02K01F01.gif'),
  
  S00P00K00F04: require('../../assets/image/Food-Pet/S00P00K00F04.gif'),
  S00P00K01F04: require('../../assets/image/Food-Pet/S00P00K01F04.gif'),
  S00P01K00F04: require('../../assets/image/Food-Pet/S00P01K00F04.gif'),
  S00P01K01F04: require('../../assets/image/Food-Pet/S00P01K01F04.gif'),
  S00P02K00F04: require('../../assets/image/Food-Pet/S00P02K00F04.gif'),
  S00P02K01F04: require('../../assets/image/Food-Pet/S00P02K01F04.gif'),
  S01P00K00F04: require('../../assets/image/Food-Pet/S01P00K00F04.gif'),
  S01P00K01F04: require('../../assets/image/Food-Pet/S01P00K01F04.gif'),
  S01P01K00F04: require('../../assets/image/Food-Pet/S01P01K00F04.gif'),
  S01P01K01F04: require('../../assets/image/Food-Pet/S01P01K01F04.gif'),
  S01P02K00F04: require('../../assets/image/Food-Pet/S01P02K00F04.gif'),
  S01P02K01F04: require('../../assets/image/Food-Pet/S01P02K01F04.gif'),
  S02P00K00F04: require('../../assets/image/Food-Pet/S02P00K00F04.gif'),
  S02P00K01F04: require('../../assets/image/Food-Pet/S02P00K01F04.gif'),
  S02P01K00F04: require('../../assets/image/Food-Pet/S02P01K00F04.gif'),
  S02P01K01F04: require('../../assets/image/Food-Pet/S02P01K01F04.gif'),
  S02P02K00F04: require('../../assets/image/Food-Pet/S02P02K00F04.gif'),
  S02P02K01F04: require('../../assets/image/Food-Pet/S02P02K01F04.gif'),
};

export default function FoodScreen({ navigation }) {
  const { selectedItems } = useContext(ClothingContext);
  const [foodData, setFoodData] = useState(initialFoodData);
  const [currentPetImage, setCurrentPetImage] = useState(null);
  const [isEating, setIsEating] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    updatePetImage();
  }, [selectedItems]);

  useEffect(() => {
    if (isEating) {
      const { shirt, pant, skin } = selectedItems;
      const shirtName = shirt ? shirt.name : 'S00';
      const pantName = pant ? pant.name : 'P00';
      const skinName = skin ? skin.name : 'K00';
      setTimeout(() => {
        setCurrentPetImage(`${shirtName}${pantName}${skinName}`);
        setIsEating(false);
        setIsButtonDisabled(false); // Enable button after 2.8 seconds
      }, 2800);
    }
  }, [isEating]);

  const handleEat = (item) => {
    if (item.quantity <= 0 || isButtonDisabled) {
      return;
    }
    setIsButtonDisabled(true); // Disable button after clicking "กิน"
    const { shirt, pant, skin } = selectedItems;
    const shirtName = shirt ? shirt.name : 'S00';
    const pantName = pant ? pant.name : 'P00';
    const skinName = skin ? skin.name : 'K00';
    const petKey = `${shirtName}${pantName}${skinName}${item.name}`;

    setCurrentPetImage(petKey);
    setIsEating(true);

    // Update foodData to reduce quantity
    setFoodData(prevFoodData =>
      prevFoodData.map(foodItem =>
        foodItem.id === item.id ? { ...foodItem, quantity: foodItem.quantity - 1 } : foodItem
      )
    );
  };

  const updatePetImage = () => {
    const { shirt, pant, skin } = selectedItems;
    const shirtName = shirt ? shirt.name : 'S00';
    const pantName = pant ? pant.name : 'P00';
    const skinName = skin ? skin.name : 'K00';

    setCurrentPetImage(`${shirtName}${pantName}${skinName}`);
  };

  const renderItems = () => {
    return (
      <>
        {foodData.map((item) => (
          <View key={item.id} style={styles.item}>
            <Image source={item.image ? item.image : empty} style={styles.itemImage} />
            <Text style={styles.itemQuantity}>{item.quantity}</Text>
            <TouchableOpacity style={styles.itemButton} onPress={() => handleEat(item)} disabled={isButtonDisabled}>
              <Text style={styles.itemButtonText}>กิน</Text>
            </TouchableOpacity>
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
            <Image source={isEating ? eatingPetImages[currentPetImage] : defaultPetImages[currentPetImage]} style={styles.petImage} />
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gymBackgroundContainer: {
    flex: 1,
  },
  gymBackground: {
    flex: 1,
    resizeMode: "cover",
  },
  orangeBackground: {
    flex: 1,
    backgroundColor: "#FFAF32",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  petDisplay: {
    flex: 2,
    alignItems: "center",
  },
  petImage: {
    width: "100%",
    height: "100%",
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
  crossButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: -4,
    top: -4,
  },
  crossIcon: {
    width: 30,
    height: 30,
  },
  itemsBackground: {
    backgroundColor: "#9E640A",
    zIndex: 1,
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
    height: 105,
    backgroundColor: "#FFAF32",
    alignItems: "center",
    borderColor: "#F9E79F",
    borderWidth: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
  },
  itemQuantity: {
    fontSize: 16,
    bottom: 12,
    color: "#000",
    position: "absolute",
    fontFamily: "appfont_02",
  },
  itemButton: {
    backgroundColor: "#F9E79F",
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    bottom: -20,
    width: '80%',
    alignItems: "center",
  },
  itemButtonText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "appfont_02",
  },
});
