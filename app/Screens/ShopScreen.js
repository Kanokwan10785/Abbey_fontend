import React, { useState, useEffect, useContext } from 'react';
import { Image, ImageBackground } from 'expo-image';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomBar from './BottomBar';
import ProfileButton from './BottomProfile.js';
import DollarIcon from './Dollar.js';
import { buyFoodItem, fetchPurchasedItems, fetchUserClothingData, fetchUserProfile, fetchItemsData, buyClothingItem, beginnerClothingItem } from './api'; // นำเข้า beginnerClothingItem
import { ClothingContext } from './ClothingContext';
import { BalanceContext } from './BalanceContext'; // Import BalanceContext
import gym from '../../assets/image/Background-Theme/gym-02.gif';
import shirtIcon from '../../assets/image/Clothing-Icon/Shirt/shirt-icon-02.png';
import pantsIcon from '../../assets/image/Clothing-Icon/Pant/pant-icon-02.png';
import skinIcon from '../../assets/image/Clothing-Icon/Skin/skin-icon-02.png';
import foodIcon from '../../assets/image/food-01.png';
import dollar from '../../assets/image/dollar-01.png';

export default function ShopScreen() {
  const { selectedItems, setSelectedItems } = useContext(ClothingContext);
  const { balance, setBalance } = useContext(BalanceContext); // ใช้ BalanceContext เพื่อจัดการยอดเงิน
  const [userLevel, setUserLevel] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('ShirtItem');
  const [userId, setUserId] = useState(null);
  const [itemsData, setItemsData] = useState({
    ShirtItem: [],
    PantItem: [],
    SkinItem: [],
    FoodItem: []
  });
  const [purchasedItems, setPurchasedItems] = useState({});
  const [sortedItems, setSortedItems] = useState([]);

  const getUserId = async () => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
            throw new Error('User ID not found in AsyncStorage');
        }
        return userId;
    } catch (error) {
        console.error('Error retrieving user ID:', error);
        return null;
    }
  };

  // ดึงรหัสผู้ใช้จาก AsyncStorage
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          // เรียกใช้ beginnerClothingItem สำหรับผู้ใช้ใหม่หรือผู้ใช้ที่มีอยู่แล้ว
          await handleBeginnerClothingItems(storedUserId); // เรียกฟังก์ชันนี้ทันทีเมื่อโหลด User ID
          const items = await fetchPurchasedItems(storedUserId);
          setPurchasedItems(items);
          // console.log('Loaded userId from AsyncStorage:', storedUserId);
          
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
    const loadUserLevel = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('jwt'); // ใช้ JWT สำหรับการเรียก API
        if (!userId || !token) {
          console.error("User ID or token not found");
          return;
        }
  
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const profileData = await fetchUserProfile(userId, config); // เรียก API ดึงข้อมูลโปรไฟล์
        setUserLevel(profileData.level); // อัปเดตเลเวลผู้ใช้ใน state
        // console.log("User Level:", profileData.level); // ตรวจสอบค่าที่ดึงมา
      } catch (error) {
        console.error("Error loading user level:", error);
      }
    };
  
    loadUserLevel();
  }, []);

  useEffect(() => {
    const loadUserClothingData = async () => {
      try {
        const userId = await getUserId();
        if (!userId) return;
  
        // ดึงข้อมูลไอเท็มจาก AsyncStorage หรือ API
        const savedOutfits = await AsyncStorage.getItem(`userOutfit-${userId}`);
        if (savedOutfits) {
          setSelectedItems(JSON.parse(savedOutfits));  // อัปเดต selectedItems ทันที
        } else {
          const data = await fetchUserClothingData(userId);
          if (data && data.length > 0) {
            setSelectedItems(data);
            await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(data));  // บันทึกลง AsyncStorage
          }
        }
      } catch (error) {
        console.error('Error loading user clothing data:', error.message);
      }
    };
  
    loadUserClothingData();
  }, []); 

  // ดึงข้อมูลรายการสินค้า
  useEffect(() => {
    const loadItemsDataFromStorage = async () => {
        try {
            const storedItemsData = await AsyncStorage.getItem('itemsData');
            if (storedItemsData) {
                const parsedItemsData = JSON.parse(storedItemsData);
                setItemsData(parsedItemsData);
                sortItems(parsedItemsData);  // เรียงลำดับทันทีหลังจากตั้งค่า itemsData
            }
        } catch (error) {
            console.error("Failed to load items data from storage", error);
        }
    };


    const fetchAndUpdateItemsData = async () => {
      // console.log("Fetching items data from API...");  
      try {
          const data = await fetchItemsData();
          // const categorizedItems = categorizeItems(data);
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
                  level: attributes.level || '', // เพิ่มข้อมูลเลเวลที่จำเป็น
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
                      console.warn("Unknown category:", attributes.category);
                      break;
              }
          });
          setItemsData(categorizedItems);
          sortItems(categorizedItems); // เรียงลำดับทันทีหลังจากตั้งค่า itemsData
  
          // บันทึกข้อมูลล่าสุดลงใน AsyncStorage
          await AsyncStorage.setItem('itemsData', JSON.stringify(categorizedItems));
      } catch (error) {
          console.error("Failed to fetch items data from API:", error);
      }
  };
  const loadPurchasedItems = async () => {
    try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
            const items = await fetchPurchasedItems(storedUserId);
            setPurchasedItems(items); // อัปเดตข้อมูลเสื้อผ้าที่ผู้ใช้มีแล้ว
        }
    } catch (error) {
        console.error("Failed to load purchased items", error);
    }
  };

  loadItemsDataFromStorage(); // โหลดข้อมูลจาก AsyncStorage ก่อน
  fetchAndUpdateItemsData();  // อัปเดตข้อมูลจาก API หลังจากนั้น
  loadPurchasedItems(); // โหลดข้อมูลเสื้อผ้าที่ผู้ใช้มีแล้วจาก API หลังจากดึง userId มาได้
}, []);

  // ฟังก์ชันสำหรับการเพิ่มไอเท็มเริ่มต้นให้ผู้ใช้
  const handleBeginnerClothingItems = async (userId) => {
    // console.log("Adding beginner clothing items...");
    try {
      // กำหนดรายการไอเท็มเริ่มต้นที่ต้องการเพิ่ม
      const beginnerItems = [
        { id: 5, label: 'K00' }  // ลายทางสีเทา
      ];

      for (const item of beginnerItems) {
        const result = await beginnerClothingItem(userId, item.id, item.label);
        // console.log(`Beginner Clothing Item Response for ${item.label}:`, result);

        if (result.success) {
            setSelectedItems(prevState => ({
                ...prevState,
                [selectedCategory]: item,
            }));
            // console.log(`${item.label} added successfully.`);
        } else {
            console.error(`Failed to add ${item.label}:`, result.message);
        }
      }
    } catch (error) {
        console.error("Error adding beginner items:", error.message);
    }
  };

  const handleBuyClothingItem = async (item) => {
    const itemPrice = parseFloat(item.price);

    console.log("Starting shop purchase process...");
    console.log("User ID:", userId);
    console.log("Shop Item ID:", item.id);
    console.log("Clothing Label:", item.label);
    console.log("Shop Item name:", item.name);

    if (!userId) {
        console.error("User ID is not available.");
        alert("ไม่สามารถทำการซื้อได้เนื่องจากไม่มี userId");
        return;
    }

    if (isNaN(itemPrice)) {
        console.error("Invalid item price:", item.price);
        alert("ราคาของสินค้าที่เลือกไม่ถูกต้อง");
        return;
    }

    console.log("User Balance:", balance);
    console.log("Item Price:", itemPrice);

    if (balance < itemPrice) {
        console.error("Insufficient balance. Required:", itemPrice, "Available:", balance);
        alert("ยอดเงินของคุณไม่เพียงพอสำหรับการซื้อสินค้า");
        return;
    }

    try {
        // ใช้ item.label โดยตรง
        const clothingLabel = item.label;
        if (!clothingLabel) {
            throw new Error(`Clothing label for item '${item.name}' is not available.`);
        }

        console.log("Using Clothing Label:", clothingLabel);

        const result = await buyClothingItem(userId, item.id, clothingLabel);

        console.log("Purchase API Response:", result);

        if (result.success) {
            const newBalance = balance - itemPrice;
            setBalance(newBalance); // อัปเดตยอดเงินใน BalanceContext

            setSelectedItems(prevState => ({
                ...prevState,
                [selectedCategory]: item,
            }));

            console.log("Purchase successful. New balance:", newBalance);
        } else {
            console.error("Purchase failed:", result.message);
            alert(`การซื้อสินค้าล้มเหลว: ${result.message}`);
        }
    } catch (error) {
        console.error("Error during purchase:", error.message);
        alert("เกิดข้อผิดพลาดระหว่างการซื้อสินค้า: " + error.message);
    }
  };

  // ฟังก์ชันสำหรับการซื้ออาหาร
  const handleBuyFoodItem = async (item) => {
    const itemPrice = parseFloat(item.price);

    if (!userId) {
      alert("ไม่สามารถทำการซื้อได้เนื่องจากไม่มี userId");
      return;
    }

    if (isNaN(itemPrice)) {
      alert("ราคาของสินค้าที่เลือกไม่ถูกต้อง");
      return;
    }

    if (balance < itemPrice) {
      alert("ยอดเงินของคุณไม่เพียงพอสำหรับการซื้อสินค้า");
      return;
    }

    try {
      const result = await buyFoodItem(userId, item.id, item.name);

      if (result.success) {
        const newBalance = balance - itemPrice;
        setBalance(newBalance); // อัปเดตยอดเงินใน BalanceContext

        // ตรวจสอบว่าหมวดหมู่เป็น FoodItem ก่อนอัปเดต
        if (selectedCategory === 'FoodItem') {
          setSelectedItems(prevState => ({
            ...prevState,
            [selectedCategory]: item,
          }));
        } else {
          alert("หมวดหมู่สินค้าที่เลือกไม่ถูกต้อง");
        }
      } else {
        alert(`การซื้อสินค้าล้มเหลว: ${result.message}`);
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดระหว่างการซื้อสินค้า");
    }
  };

  // ฟังก์ชันสำหรับการซื้อหรือเพิ่มไอเท็มเริ่มต้น
  const handleBuy = async (item) => {
    if (item.isBeginnerItem) {
      await handleBeginnerClothingItem(item);
    } else if (selectedCategory === 'FoodItem') {
      await handleBuyFoodItem(item);
    } else {
      await handleBuyClothingItem(item);
    }
  };

// ฟังก์ชันสำหรับเรียงลำดับสินค้า
const sortItems = () => {
  const sorted = itemsData[selectedCategory].sort((a, b) => {
    const specialLabels = ['Z00', 'S00', 'P00'];

    // ถ้า a.label หรือ b.label เป็นหนึ่งใน specialLabels ให้เรียงไว้ท้ายสุด
    const aIsSpecial = specialLabels.includes(a.label);
    const bIsSpecial = specialLabels.includes(b.label);

    // ถ้า a เป็น special แต่ b ไม่เป็น special ให้ b มาก่อน
    if (aIsSpecial && !bIsSpecial) return 1;
    // ถ้า b เป็น special แต่ a ไม่เป็น special ให้ a มาก่อน
    if (!aIsSpecial && bIsSpecial) return -1;

    // ถ้าไม่มีใครเป็น special label, ใช้การเรียงปกติ
    if (a.label < b.label) return -1;
    if (a.label > b.label) return 1;
    return 0;
  });

  setSortedItems(sorted);
};

// useEffect นี้จะทำให้แน่ใจว่า sortItems ถูกเรียกใช้ทุกครั้งที่ selectedCategory หรือ itemsData ถูกอัปเดต
useEffect(() => {
  if (itemsData[selectedCategory]) {
      sortItems(itemsData);
  }
}, [selectedCategory, itemsData]);

// การแสดงรายการสินค้า
const renderItems = () => {
  return sortedItems.map((item, index) => {
    const isHidden = item.label === 'Z00' || item.label === 'S00' || item.label === 'P00';
    const alreadyOwned = purchasedItems[item.label] === true;

    // ตรวจสอบเลเวลผู้ใช้
    const canPurchase = userLevel >= item.level;

    return (
      <View key={index} style={[ styles.item, !canPurchase && { backgroundColor: "#FAA828" }
      ]}
    >
        <View style={styles.insideitemImage}>
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        </View>
        {!isHidden && (
          <>
            <Text style={styles.itemText}>{item.name}</Text>
            <View style={styles.currencyPrice}>
              <Text style={styles.itemPrice}>{item.price}</Text>
              <Image source={dollar} style={styles.currencyIcon} />
            </View>
            {canPurchase ? (
            <TouchableOpacity
              style={[styles.itemButton,]}
              onPress={() => handleBuy(item)}
              disabled={alreadyOwned}
            >
              <Text style={styles.itemButtonText}>
                {alreadyOwned ? 'มีแล้ว' : 'ซื้อ'}
              </Text>
            </TouchableOpacity>
          ) : (
              <View style={styles.lockedButton}>
                <Text style={styles.lockedButtonText}>ปลดล็อก Lv. {item.level}</Text>
              </View>
            )}
          </>
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
  lockedButton: {
    backgroundColor: '#444', // สีปุ่มที่ถูกล็อก
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    top: '-25%',
  },
  lockedButtonText: {
    color: '#FFF', // สีข้อความสำหรับปุ่มที่ถูกล็อก
    fontSize: 14,
    fontFamily: 'appfont_01',
    textAlign: 'center',
  },
  
});
