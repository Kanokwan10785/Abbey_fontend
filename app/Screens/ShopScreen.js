import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // เพิ่มการนำเข้า AsyncStorage
import BottomBar from './BottomBar';
import ProfileButton from './BottomProfile.js';
import DollarIcon from './Dollar.js';
import { buyFoodItem, fetchItemsData } from './api'; // เพิ่มการนำเข้า fetchItemsData จาก api.js
import { ClothingContext } from './ClothingContext';
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import shirtIcon from '../../assets/image/Clothing-Icon/Shirt/shirt-icon-02.png';
import pantsIcon from '../../assets/image/Clothing-Icon/Pant/pant-icon-02.png';
import skinIcon from '../../assets/image/Clothing-Icon/Skin/skin-icon-02.png';
import foodIcon from '../../assets/image/food-01.png';
import dollar from '../../assets/image/dollar-01.png';

export default function ShopScreen() {
  const { selectedItems, setSelectedItems } = useContext(ClothingContext);
  const [balance, setBalance] = useState();
  const [selectedCategory, setSelectedCategory] = useState('ShirtItem');
  const [userId, setUserId] = useState(null); // State to hold userId
  const [itemsData, setItemsData] = useState({
    ShirtItem: [],
    PantItem: [],
    SkinItem: [],
    FoodItem: []
  });

    // ดึงรหัสผู้ใช้จาก AsyncStorage
    useEffect(() => {
      const loadUserId = async () => {
        try {
          const storedUserId = await AsyncStorage.getItem('userId');
          if (storedUserId) {
            setUserId(storedUserId);
            console.log("Loaded User ID:", storedUserId);
          } else {
            console.error("No userId found in AsyncStorage");
          }
        } catch (error) {
          console.error("Failed to load userId from AsyncStorage", error);
        }
      };
  
      loadUserId();
    }, []);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchItemsData();

      const categorizedItems = {
        ShirtItem: [],
        PantItem: [],
        SkinItem: [],
        FoodItem: []
      };

      data.forEach(item => {
        const attributes = item.attributes;
        const itemDetails = {
          id: item.id,
          label: attributes.label,
          name: attributes.name,
          price: attributes.price,
          isSinglePurchase: attributes.isSinglePurchase,
          imageUrl: attributes.image?.data?.attributes?.url || '',
          petFoodItemsId: attributes.pet_food_items?.data.map(petItem => petItem.id) || [],
          clothingItemsId: attributes.clothing_items?.data.map(clothingItem => clothingItem.id) || []
        };

        switch (attributes.category) {
          case 'Shirt-item':
            categorizedItems.ShirtItem.push(itemDetails);
            break;
          case 'Pant-item':
            categorizedItems.PantItem.push(itemDetails);
            break;
          case 'Skin-item':
            categorizedItems.SkinItem.push(itemDetails);
            break;
          case 'Food-item':
            categorizedItems.FoodItem.push(itemDetails);
            break;
          default:
            break;
        }
      });

      setItemsData(categorizedItems);
    };

    loadData();
  }, []);

  const handleBuy = async (item) => {
    // แปลงราคาเป็นตัวเลขแบบทศนิยม
    const itemPrice = parseFloat(item.price);
    
    // ตรวจสอบว่า userId มีค่าหรือไม่
    if (!userId) {
      console.error("Cannot proceed with purchase, userId is null");
      alert("ไม่สามารถทำการซื้อได้เนื่องจากไม่มี userId");
      return;
    }
  
    // ตรวจสอบว่า item.id มีค่าหรือไม่
    if (!item.id) {
      console.error("Cannot proceed with purchase, item.id is undefined");
      alert("ไม่สามารถทำการซื้อได้เนื่องจากไม่มี item.id");
      return;
    }
    
    // ตรวจสอบว่าราคาของสินค้าเป็นตัวเลขที่ถูกต้องหรือไม่
    if (isNaN(itemPrice)) {
      console.error("Item price is not a valid number:", item.price);
      alert("ราคาของสินค้าที่เลือกไม่ถูกต้อง");
      return;
    }
    
    // ตรวจสอบว่ายอดเงินคงเหลือเพียงพอหรือไม่
    if (balance < itemPrice) {
      console.error("Insufficient balance to purchase the item");
      alert("ยอดเงินของคุณไม่เพียงพอสำหรับการซื้อสินค้า");
      return;
    }
    
    try {
      console.log("Item Selected:", item);
      console.log("Item Name:", item.name);
      console.log("Selected Category:", selectedCategory);
      console.log("User ID:", userId);
      
      // เรียกใช้ฟังก์ชัน buyFoodItem เพื่อดำเนินการซื้อสินค้า
      const result = await buyFoodItem(userId, item.id, item.name);
  
      console.log("API Call Result:", result);
  
      if (result.success) {
        // คำนวณยอดเงินคงเหลือใหม่
        const newBalance = balance - itemPrice;
        setBalance(newBalance);
        console.log("Updated Balance:", newBalance);
  
        // อัปเดตรายการสินค้าที่เลือก
        setSelectedItems(prevState => ({
          ...prevState,
          [selectedCategory]: item,
        }));
  
        console.log("Updated Selected Items:", selectedItems);
      } else {
        console.error("Purchase Failed:", result.message);
        alert(`การซื้อสินค้าล้มเหลว: ${result.message}`);
      }
    } catch (error) {
      console.error('Error while buying item', error);
      alert("เกิดข้อผิดพลาดระหว่างการซื้อสินค้า");
    }
  };
  
  const renderItems = () => {
    // เรียงลำดับรายการตาม label จาก A ถึง Z และจาก 1 ถึง 0
    const sortedItems = itemsData[selectedCategory].sort((a, b) => {
      if (a.label < b.label) return -1;
      if (a.label > b.label) return 1;
      return 0;
    });

    return sortedItems.map((item, index) => {
      const isHidden = item.label === 'Z00'; // ตรวจสอบว่า label คือ Z00 หรือไม่

      return (
        <View key={index} style={styles.item}>
          <View style={styles.insideitemImage}>
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
          </View>
          <Text style={styles.itemText}>{item.name}</Text>
          {!isHidden && (
            <View style={styles.currencyPrice}>
              <Text style={styles.itemPrice}>{item.price}</Text>
              <Image source={dollar} style={styles.currencyIcon} />
            </View>
          )}
          {!isHidden && (
            <TouchableOpacity style={styles.itemButton} onPress={() => handleBuy(item)}>
              <Text style={styles.itemButtonText}>ซื้อ</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    });
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
        <TouchableOpacity style={styles.categoryButton} onPress={() => setSelectedCategory("ShirtItem")}>
          <View style={selectedCategory === "ShirtItem" ? styles.afterinsidecategory : styles.beforeinsidecategory}>
            <Image source={shirtIcon} style={styles.categoryIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton} onPress={() => setSelectedCategory("PantItem")}>
          <View style={selectedCategory === "PantItem" ? styles.afterinsidecategory : styles.beforeinsidecategory}>
            <Image source={pantsIcon} style={styles.categoryIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton} onPress={() => setSelectedCategory("SkinItem")}>
          <View style={selectedCategory === "SkinItem" ? styles.afterinsidecategory : styles.beforeinsidecategory}>
            <Image source={skinIcon} style={styles.categoryIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton} onPress={() => setSelectedCategory("FoodItem")}>
          <View style={selectedCategory === "FoodItem" ? styles.afterinsidecategory : styles.beforeinsidecategory}>
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
    borderRadius: 10,//มีปัญหา
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9E79F",
  },
  afterinsidecategory: {
    width: 85,
    height: 85,
    borderRadius: 15,
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
    marginTop: 8,
    // marginBottom: -8,
    // backgroundColor: "#FFAF32",
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
    height: 156,
    // backgroundColor: '#FFAF32', //สีเก่า
    backgroundColor: '#FAA828',
    borderRadius: 10,
    alignItems: 'center',
    borderColor: "#F9E79F",
    borderWidth: 6,
    marginBottom: 18,
    // marginTop: 5,
  },
  insideitemImage: {
    width: 90,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
    borderRadius: 15,
    backgroundColor: '#F9E79F',
    marginTop: 8,
  },
  currencyPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyIcon: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: -15,
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
    marginRight: 5,
    right: 5,
  },
  itemText: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
    fontFamily: "appfont_02",
    top: 3,
  },
  itemButton: {
    backgroundColor: "#F9E79F",
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 25,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    top: 2,
  },
  itemButtonText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "appfont_02",
  },
});
