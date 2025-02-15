import axios from 'axios';

const API_URL = 'http://192.168.1.175:1337'; 

const api = axios.create({
  baseURL: API_URL,
});

// ฟังก์ชันการล็อกอิน รับ JWT token และข้อมูลผู้ใช้
export const login = async (identifier, password) => {
  try {
    const response = await api.post('/api/auth/local', {
      identifier,
      password,
    });
    return response.data; // response.data จะมีทั้ง jwt และข้อมูล user
  } catch (error) {
    console.error('Login error', error);
    throw error;
  }
};

// ฟังก์ชันการลงทะเบียน
export const register = async (username, email, password, height, weight, age, selectedGender, selectPet) => {
  try {
    const response = await api.post('/api/auth/local/register', {
      username,
      email,
      password,
      height, 
      weight,
      age,
      selectedGender,
      selectPet
    });
    return response.data;
  } catch (error) {
    console.error('Register error details:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// ฟังก์ชันการดึงข้อมูลการออกกำลังกาย
export const getDailyExercise = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/daily-exercises?populate=exercise`);
    return response.data;
  } catch (error) {
    console.error('Error fetching daily exercise', error);
    throw error;
  }
};

//ฟังก์ตรวจสอบ labay ของผู้ใช้ ที่มีสินค้าอยู่ในตู้เสื้อ
export const fetchPurchasedItems = async (userId) => {
  try {
    if (!userId) {
      throw new Error('Invalid userId');  // เพิ่มการตรวจสอบ userId ว่าเป็นค่าว่างหรือไม่
    }

    const response = await api.get(`/api/users/${userId}?populate=clothing_items`);
    const purchasedClothingItems = {};

    if (response.data && response.data.clothing_items) {
      response.data.clothing_items.forEach(item => {
        purchasedClothingItems[item.label] = true; // จัดเก็บข้อมูลของสินค้าที่ซื้อในรูปแบบที่ง่ายต่อการตรวจสอบ
      });
    }

    return purchasedClothingItems; // ส่งคืนรายการสินค้าในรูปแบบของ object ที่ตรวจสอบได้ง่าย
  } catch (error) {
    // console.error("Failed to load purchased items from API", error);
    throw error; // ขว้างข้อผิดพลาดเพื่อให้ฟังก์ชันที่เรียกใช้สามารถจัดการได้
  }
};

// ฟังก์ชันการดึงข้อมูลอาหารที่ผู้ใช้มี
export const fetchUserFoodData = async (userId) => {
  try {
    // เรียกข้อมูลจาก shop-items เพื่อดึงชื่อ, label, และ URL ของ image
    const shopResponse = await api.get(`/api/shop-items?populate[image][fields][0]=url&[fields][0]=name&[fields][1]=label&[fields][2]=level`);

    // เรียกข้อมูลจาก pet-food-items เพื่อดึงชื่ออาหารและข้อมูลอื่นๆ ของผู้ใช้
    const petFoodResponse = await api.get(`/api/pet-food-items?filters[user][id][$eq]=${userId}&populate[choose_food][fields][0]=name`);

    // สร้างแผนที่เพื่อให้เข้าถึง URL ได้ง่าย
    const shopItemsMap = shopResponse.data.data.reduce((map, item) => {
      map[item.attributes.name] = {
        label: item.attributes.label,
        imageUrl: item.attributes.image?.data?.attributes?.url || null,
      };
      return map;
    }, {});

    // รวมข้อมูลจากทั้งสอง API
    const foodItems = petFoodResponse.data.data?.map(item => {
      const chooseFoodName = item.attributes.choose_food?.data?.attributes?.name;
      const shopItemData = shopItemsMap[chooseFoodName] || {};

      return {
        id: item.id,
        name: chooseFoodName, // ใช้ชื่อจาก choose_food
        label: shopItemData.label || 'Unknown', // ดึง label จาก shop-items ถ้ามี
        level: shopItemData.level || '',
        quantity: item.attributes.quantity,
        image: shopItemData.imageUrl || null, // ดึง URL ของ image จาก shop-items ถ้ามี
      };
    }) || [];

    return foodItems;
  } catch (error) {
    console.error('Error fetching user food data', error);
    throw error;
  }
};

// ฟังก์ชันการอัปเดตจำนวนอาหาร
export const updateFoodQuantity = async (itemId, newQuantity) => {
  try {
    const response = await axios.put(`${API_URL}/api/pet-food-items/${itemId}`, {
      data: { quantity: newQuantity },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating pet food item quantity', error);
    throw error;
  }
};

// ฟังก์ชันการดึงข้อมูลเสื้อผ้าที่ผู้ใช้มี
export const fetchUserClothingData = async (userId) => {
  try {
    if (!userId) {
      throw new Error('Invalid userId');
    }

    // เรียก API เพื่อนำข้อมูลสินค้าและเสื้อผ้าของผู้ใช้
    const shopResponse = await api.get(`/api/shop-items?populate[image][fields][0]=url&[fields][0]=name&[fields][1]=label&[fields][2]=category`);
    const petClothingResponse = await api.get(`/api/clothing-items?populate=*&filters[users][id][$eq]=${userId}`);

    if (!shopResponse.data || !petClothingResponse.data) {
      throw new Error('Failed to fetch data from API');
    }

    // จัดเก็บข้อมูลสินค้าเป็นแผนที่ (map)
    const shopItemsMap = shopResponse.data.data.reduce((map, item) => {
      if (item.attributes?.name) {
        map[item.attributes.name] = {
          label: item.attributes.label || 'Unknown',
          imageUrl: item.attributes.image?.data?.attributes?.url || null,
          category: item.attributes.category || 'Unknown',
        };
      }
      return map;
    }, {});

    // จัดเรียงข้อมูลเสื้อผ้าที่ผู้ใช้เลือก
    const clothingItems = petClothingResponse.data.data?.map(item => {
      const chooseClothesData = item.attributes.choose_clothe?.data;

      if (!chooseClothesData) {
        console.error('No choose_clothe found for item:', item);
        return {
          id: item.id,
          name: 'Unknown',
          label: 'Unknown',
          category: 'Unknown',
          quantity: item.attributes.quantity || 1,
          image: null,
        };
      }

      const chooseClothesName = chooseClothesData.attributes.name;
      const shopItemData = shopItemsMap[chooseClothesName] || {};

      return {
        id: item.id,
        name: chooseClothesName || 'Unknown',
        label: shopItemData.label || 'Unknown',
        category: shopItemData.category || 'Unknown',
        quantity: item.attributes.quantity || 1,
        image: shopItemData.imageUrl || null,
      };
    }) || [];

    return clothingItems;
  } catch (error) {
    console.error('Error fetching user clothes data:', error.response ? error.response.data : error.message);
    throw new Error(`Failed to fetch user clothes data: ${error.message}`);
  }
};

// ฟังก์ชันการดึงข้อมูลเสื้อผ้าและอัปเดตผู้ใช้
export const fetchAndUpdateClothingPets = async (combinedLabel, userId) => {
  try {
    const clothingPetsData = await fetchClothingPets();

    // หา item ที่มี label ตรงกับชุดเสื้อผ้าที่ผู้ใช้เลือก
    const matchedItem = clothingPetsData.find(item => item.label === combinedLabel);

    if (!matchedItem) {
      throw new Error(`No matching clothing pet found for label: ${combinedLabel}`);
    }

    const clothingPetId = matchedItem.id;

    // ตรวจสอบว่าผู้ใช้ถูกเชื่อมโยงกับ clothing pet นี้แล้วหรือยัง
    const response = await api.get(`/api/clothing-pets/${clothingPetId}?filters[users][id][$eq]=${userId}`);
    if (response.data?.data?.length > 0) {
      console.log(`GET User ${userId} is already linked to clothing pet ${clothingPetId}`);
      return matchedItem.url; // ถ้าเชื่อมโยงแล้ว ให้คืนค่า URL ของสัตว์เลี้ยง
    }

    // ถ้ายังไม่ถูกเชื่อมโยงมาก่อน ให้เชื่อมโยง userId กับ clothingPetId
    await api.put(`/api/clothing-pets/${clothingPetId}`, {
      data: {
        users: {
          connect: [{ id: userId }]
        }
      }
    });

    console.log(`PUT Successfully linked user ${userId} to clothing pet ${clothingPetId}`);
    // console.log(`Returning URL after PUT: ${matchedItem.url}`); // Log URL after linking
    return matchedItem.url;
  } catch (error) {
    console.error('Error processing clothing pets:', error.response ? error.response.data : error.message);
    throw new Error(`Failed to update clothing pet for user: ${error.message}`);
  }
};

// ฟังก์ชันการดึงข้อมูลเสื้อผ้าของสัตว์เลี้ยง
export const fetchClothingPets = async () => {
  try {
    // เรียก API เพื่อนำข้อมูลเสื้อผ้าของสัตว์เลี้ยง
    const response = await api.get('/api/clothing-pets?populate[clothing_pet][fields][0]=url&[fields][1]=label&pagination[limit]=100');
    
    if (!response.data || !response.data.data) {
      throw new Error('Failed to fetch clothing pets data');
    }

    // แปลงข้อมูลเสื้อผ้าของสัตว์เลี้ยงให้อยู่ในรูปแบบที่สามารถใช้งานได้ง่าย
    const clothingPetsData = response.data.data.map(item => ({
      id: item.id,
      label: item.attributes.label,
      url: item.attributes.clothing_pet?.data?.[0]?.attributes?.url || null
    }));
    
    return clothingPetsData;
  } catch (error) {
    console.error('Error fetching clothing pets:', error.response ? error.response.data : error.message);
    throw new Error(`Failed to fetch clothing pets: ${error.message}`);
  }
};

// ฟังก์ชันการดึงข้อมูลเสื้อผ้าของสัตว์เลี้ยง หน้า home
export const fetchUserProfileWithClothing = async (userId, token) => {
  try {
    const response = await api.get(`/api/users/${userId}?populate=*&populate[clothing_pet][fields][0]=id&populate[clothing_pet][fields][1]=label`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // ดึงข้อมูลจาก response
    return response.data;  // ส่งข้อมูล user กลับมาพร้อมกับ clothing_pet
  } catch (error) {
    console.error("Error fetching user profile with clothing", error);
    throw error;
  }
};

export const fetchHomePetUrlByLabel = async (label, userId, bmiLabel) => {
  try {
    console.log("Fetching home pet URL for label:", label, "and userId:", userId);

    // เรียก API เพื่อดึงข้อมูลผู้ใช้
    const userResponse = await api.get(`/api/users/${userId}?populate[user_exercise_muscles][fields][1]=exercise_levels`);
    const userData = userResponse.data;
    console.log("User exercise levels:", userData.user_exercise_muscles);

    // ตรวจสอบว่าข้อมูลถูกต้อง
    let conditions = ['EX00']; // ค่าเริ่มต้น
    if (userData.user_exercise_muscles && Array.isArray(userData.user_exercise_muscles)) {
      userData.user_exercise_muscles.forEach((muscle) => {
        const exerciseLevel = muscle.exercise_levels; // ดึงค่า exercise_levels

        if (typeof exerciseLevel === 'string') { // ตรวจสอบว่าเป็น string
          if (exerciseLevel.includes('chest') && !conditions.includes('EX01')) {
            conditions.push('EX01');
          }
          if (exerciseLevel.includes('arms') && !conditions.includes('EX02')) {
            conditions.push('EX02');
          }
          if (exerciseLevel.includes('legs') && !conditions.includes('EX03')) {
            conditions.push('EX03');
          }
        } else {
          console.warn("Invalid exercise level format:", exerciseLevel);
        }
      });
    }
    console.log("Search conditions:", conditions);

    // ดึงข้อมูล home_pet ที่ตรงกับ label
    const response = await api.get(`/api/clothing-pets?populate[home_pet][fields][0]=url&populate[home_pet][fields][1]=name&fields[0]=label&filters[bmi_type][$eq]=${bmiLabel}&pagination[limit]=100`);
    const data = response.data;

    const matchingPet = data.data.find(pet => pet.attributes.label === label);
    if (!matchingPet) {
      console.warn("No matching pet found for label:", label);
      return null;
    }

    // หา URL ที่ตรงกับเงื่อนไข
    const urls = conditions.map(condition => {
      const nameToMatch = `${label}${condition}`;
      const homePet = matchingPet.attributes.home_pet.data.find(homePet => homePet.attributes.name === nameToMatch);

      if (homePet?.attributes?.url) {
        console.log(`Matching URL for condition: ${condition} -> ${homePet.attributes.url}`);
        return { condition, url: homePet.attributes.url };
      }
      return null;
    }).filter(Boolean);

    console.log("All matching URLs:", urls);
    return urls;
  } catch (error) {
    console.error("Error fetching home pet URL by label", error);
    throw error;
  }
};

export const fetchFoodPetUrlByLabel = async (label, foodLabel = 'F00') => {
  try {
    // แสดง log เริ่มต้นเมื่อมีการดึงข้อมูล
    console.log(`--- Fetching food pet URL ---`);
    console.log(`Label: ${label}, Food Label: ${foodLabel}`);

    // เรียก API เพื่อดึงข้อมูล
    const response = await api.get('/api/clothing-pets?populate[food_pet][fields][0]=url&populate[food_pet][fields][1]=name&[fields][1]=label&pagination[limit]=100');
    const data = response.data;

    // ค้นหา pet ที่ตรงกับ label
    const matchingPet = data.data.find(pet => pet.attributes.label === label);
    if (!matchingPet) {
      console.log(`No matching pet found for label: ${label}`);
      return null;
    }

    // console.log('Matching pet found:', matchingPet);

    // ตรวจสอบว่ามี food_pet หรือไม่
    if (matchingPet.attributes.food_pet && matchingPet.attributes.food_pet.data.length > 0) {
      console.log(`Food data found for pet with label: ${label}`);

      // ค้นหาอาหารที่ตรงกับ foodLabel
      const matchingFood = matchingPet.attributes.food_pet.data.find(food => 
        food.attributes.name === `${label}${foodLabel}` // รวม label และ foodLabel
      );

      // ถ้าเจออาหารที่ตรงกัน
      if (matchingFood) {
        console.log('Found matching food:', matchingFood.attributes);
        return {
          url: matchingFood.attributes.url,
          name: matchingFood.attributes.name
        };
      } else {
        // ถ้าไม่เจออาหารที่ตรงกัน
        console.log(`No matching food found for label: ${label} and foodLabel: ${foodLabel}`);
      }
    } else {
      console.log(`No food_pet data available for pet with label: ${label}`);
    }

    // ถ้าไม่เจออาหารที่ตรง ให้คืนค่าเริ่มต้นเป็น F00
    if (matchingPet.attributes.food_pet && matchingPet.attributes.food_pet.data.length > 0) {
      const defaultFood = matchingPet.attributes.food_pet.data[0];
      console.log('Returning default food (F00):', defaultFood.attributes);
      return {
        url: defaultFood.attributes.url,
        name: `${label}F00`
      };
    }

    // กรณีที่ไม่เจออะไรเลย
    console.log('No default food found, returning null.');
    return null;

  } catch (error) {
    console.error("Error fetching food pet URL by label", error);
    throw error;
  }
};

// ฟังก์ชันการดึงข้อมูลโปรไฟล์ผู้ใช้ โดยรับ token ใน headers
export const fetchUserProfile = async (userId, config = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is missing, cannot fetch profile.');
    }

    const response = await api.get(`/api/users/${userId}?populate=*`, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);

    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized access, but not logging out automatically.');
    }

    throw error;
  }
};

// ฟังก์ชันการอัปเดตข้อมูลโปรไฟล์ผู้ใช้ 
export const updateUserProfile = async (userId, data, config) => {
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers, // รวม header จาก config
    },
    body: JSON.stringify(data),
  });

  return response; // ตรวจสอบให้แน่ใจว่าส่งคืนค่า response โดยตรง
};

// ฟังก์ชันการอัปโหลดไฟล์
export const uploadFile = async (formData, token) => {
  try {
    const uploadResponse = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image');
    }

    const uploadData = await uploadResponse.json();
    return uploadData; // ส่งคืนข้อมูลที่ได้จากการอัปโหลด
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// ฟังก์ชันใหม่สำหรับดึงข้อมูลรายการสินค้าจาก API
export const fetchItemsData = async () => {
  try {
    const response = await api.get('/api/shop-items?populate=image,pet_food_items,clothing_items');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching items data', error);
    return [];
  }
};

export const buyFoodItem = async (userId, shopItemId, foodName) => {
  try {
    // console.log("Starting purchase process...");
    // console.log("User ID:", userId);
    // console.log("Shop Item ID:", shopItemId);
    // console.log("Food Name:", foodName);

    // ดึงข้อมูลผู้ใช้และสินค้าที่จะซื้อ
    const userResponse = await axios.get(`${API_URL}/api/users/${userId}`);
    // console.log("User Response:", userResponse.data);

    const shopItemResponse = await axios.get(`${API_URL}/api/shop-items/${shopItemId}?populate=*`);
    // console.log("Shop Item Response:", shopItemResponse.data);

    const user = userResponse.data;
    const shopItem = shopItemResponse.data;
    const itemPrice = shopItem.data.attributes.price;

    if (isNaN(itemPrice)) {
      throw new Error(`ราคาสินค้าไม่ถูกต้อง: ${itemPrice}`);
    }

    // ตรวจสอบยอดเงิน
    if (user.balance >= itemPrice) {
      // console.log("User has enough balance.");

      // คำนวณยอดเงินคงเหลือใหม่
      const newBalance = user.balance - itemPrice;

      if (isNaN(newBalance)) {
        throw new Error(`เกิดข้อผิดพลาดในการคำนวณยอดเงินคงเหลือ: ${newBalance}`);
      }

      // หักยอดเงินของผู้ใช้
      // console.log("Deducting balance from user.");
      await axios.put(`${API_URL}/api/users/${userId}`, {
        balance: newBalance,
      });

      // ตรวจสอบและอัปเดต Pet Food Item ที่มีอยู่
      const petFoodItemsResponse = await axios.get(`${API_URL}/api/pet-food-items?populate=*`, {
        params: {
          'filters[user]': userId,
          'filters[choose_food][name]': foodName,
        },
      });
      // console.log("Pet Food Items Response:", petFoodItemsResponse.data);

      const petFoodItems = petFoodItemsResponse.data.data;

      if (petFoodItems.length > 0) {
        const petFoodItem = petFoodItems[0];
        // console.log("Updating quantity for existing item:", petFoodItem.id);

        await axios.put(`${API_URL}/api/pet-food-items/${petFoodItem.id}`, {
          data: {
            quantity: petFoodItem.attributes.quantity + 1,
          },
        });
      } else {
        // เพิ่มรายการใหม่หากไม่พบรายการที่มีอยู่
        // console.log("Creating a new pet food item.");

        const foodNameMap = {
          "แอปเปิล": "apple",
          "แตงโม": "watermelon",
          "น่องไก่ทอด": "fried chicken",
          "เบอร์เกอร์": "hamburger",
          "ปลาทอด": "fried fish",
          "เนื้อย่าง": "roast beef",
        };

        const mappedFoodName = foodNameMap[foodName];
        if (!mappedFoodName) {
          throw new Error(`Food name '${foodName}' is not mapped.`);
        }

        await axios.post(`${API_URL}/api/pet-food-items`, {
          data: {
            user: userId,
            buy_food: mappedFoodName,
            choose_food: shopItemId,
            quantity: 1,
          },
        });
      }

      return { success: true };
    } else {
      // console.log("User does not have enough balance.");
      return { success: false, message: 'ยอดเงินไม่พอ' };
    }
  } catch (error) {
    console.error('Error during purchase:', error.response ? error.response.data : error.message);
    throw error;
  }
};


// ฟังก์ชันซื้อสินค้าเสื้อผ้า
export const buyClothingItem = async (userId, shopItemId, clothingLabel, isSinglePurchase = false) => {
  try {
    const userResponse = await axios.get(`${API_URL}/api/users/${userId}`);
    const shopItemResponse = await axios.get(`${API_URL}/api/shop-items/${shopItemId}?populate=clothing_items`);

    const user = userResponse.data;
    const shopItem = shopItemResponse.data.data;
    const itemPrice = shopItem.attributes.price;

    if (isNaN(itemPrice)) {
      throw new Error(`ราคาสินค้าไม่ถูกต้อง: ${itemPrice}`);
    }

    // ตรวจสอบยอดเงิน
    if (user.balance >= itemPrice) {

      const newBalance = user.balance - itemPrice;

      if (isNaN(newBalance)) {
        throw new Error(`เกิดข้อผิดพลาดในการคำนวณยอดเงินคงเหลือ: ${newBalance}`);
      }

      // ตรวจสอบว่าผู้ใช้มีเสื้อผ้าชิ้นนี้อยู่แล้วหรือไม่ในข้อมูลของ shopItem
      const userOwnsItem = shopItem.attributes.clothing_items.data.some(item => 
        item.attributes.buy_clothes === clothingLabel
      );

      // เพิ่มการตรวจสอบ isSinglePurchase
      if (isSinglePurchase && userOwnsItem) {
        return { success: false, message: 'สินค้านี้สามารถซื้อได้เพียงครั้งเดียว และผู้ใช้มีสินค้านี้แล้ว' };
      }

      // หักยอดเงินของผู้ใช้
      await axios.put(`${API_URL}/api/users/${userId}`, {
        balance: newBalance,
      });

      if (userOwnsItem) {
        return { success: false, message: 'ผู้ใช้มีสินค้านี้แล้ว' };
      } else {
        let clothingItemId = shopItem.attributes.clothing_items.data[0].id;

        // เพิ่มเสื้อผ้าชิ้นใหม่ให้ผู้ใช้
        await axios.put(`${API_URL}/api/clothing-items/${clothingItemId}`, {
          data: {
            users: {
              connect: [
                {
                  id: userId,
                }
              ]
            }
          },
        });

        return { success: true, message: 'ซื้อสำเร็จ', hasItem: true };
      }
    } else {
      return { success: false, message: 'ยอดเงินไม่พอ' };
    }
  } catch (error) {
    console.error('Error during purchase:', error.response ? error.response.data : error.message);
    throw error;
  }
};

//ฟังก์ชันการเพิ่มเสื้อผ้าเริ่มต้น
export const beginnerClothingItem = async (userId, shopItemId, clothingLabel) => {
  try {
    // console.log("Starting process to add beginner clothing item...");
    // console.log("User ID:", userId);
    // console.log("Shop Item ID:", shopItemId);
    // console.log("Clothing Label:", clothingLabel);

    // ดึงข้อมูลผู้ใช้และสินค้าที่จะเพิ่ม
    const userResponse = await axios.get(`${API_URL}/api/users/${userId}`);
    // console.log("User Response:", userResponse.data);

    const shopItemResponse = await axios.get(`${API_URL}/api/shop-items/${shopItemId}?populate=clothing_items`);
    // console.log("Shop Item Response:", shopItemResponse.data);

    const user = userResponse.data;
    const shopItem = shopItemResponse.data.data;

    // ตรวจสอบว่าผู้ใช้มีเสื้อผ้าชิ้นนี้อยู่แล้วหรือไม่ในข้อมูลของ shopItem
    const userOwnsItem = shopItem.attributes.clothing_items.data.some(item => 
      item.attributes.buy_clothes === clothingLabel
    );
    // console.log("User owns item:", userOwnsItem);

    if (userOwnsItem) {
      // console.log("User already owns this clothing item.");
      return { success: false, message: 'ผู้ใช้มีสินค้านี้แล้ว' };
    } else {
      let clothingItemId = shopItem.attributes.clothing_items.data[0].id;

      // ตรวจสอบว่าผู้ใช้มีสกิลตัวละคร K00 อยู่แล้วหรือไม่
      const hasK00Skill = shopItem.attributes.clothing_items.data.some(item =>
        item.attributes.buy_clothes === 'K00'
      );

      if (hasK00Skill) {
        // console.log("User already has K00 skill.");
      } else {
        // console.log("User does not have K00 skill. Setting id to 5 for grey skin.");
        clothingItemId = 5; // Grey skin id
      }

      // เพิ่มไอเท็มเริ่มต้นให้ผู้ใช้
      // console.log("Adding clothing item to user.");
      // console.log("Adding Shop item:", shopItem.id);
      // console.log("Adding Clothing item:", clothingItemId);

      await axios.put(`${API_URL}/api/clothing-items/${clothingItemId}`, {
        data: {
          users: {
            connect: [
              {
                id: userId,
              }
            ]
          }
        },
      });

      return { success: true, message: 'เพิ่มไอเท็มเริ่มต้นสำเร็จ', hasItem: true };
    }
  } catch (error) {
    console.error('Error during process:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// ฟังก์ชันอัปเดต EXP และ Level ของผู้ใช้
export const updateUserExpLevel = async (userId, newExp, newLevel) => {
  try {
    // console.log(`🟢 อัปเดตข้อมูล: User ID: ${userId}, EXP สะสม: ${newExp}, Level ใหม่: ${newLevel}`);

    const response = await api.put(`/api/users/${userId}`, {
      EXP: newExp, // คงค่า EXP ไว้เป็นสะสม
      level: newLevel,
    });

    // console.log(response.data);
    return response.data; 
  } catch (error) {
    console.error("❌ Error updating EXP and Level:", error);
    throw error;
  }
};

// ฟังก์ชันดึงข้อมูล EXP และ Level ของผู้ใช้
export const fetchUserExpLevel = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    const userData = response.data;

    // console.log(`📥 โหลดข้อมูล: User ID: ${userId}, EXP สะสม: ${userData.EXP}, Level ปัจจุบัน: ${userData.level}`);

    return {
      exp: userData.EXP || 0,
      level: userData.level || 1,
    };
  } catch (error) {
    console.error("❌ Error fetching EXP and Level:", error);
    return { exp: 0, level: 1 };
  }
};

export const saveUserOutfitToServer = async (userId, outfit, jwt) => {
  try {
    const response = await api.put(`/api/users/${userId}`, 
      { outfit }, 
      { headers: { Authorization: `Bearer ${jwt}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving user outfit:", error);
    throw error;
  }
};

export const fetchUserOutfit = async (userId, jwt) => {
  try {
    const response = await api.get(`/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    return response.data.outfit || null; // คืนค่า outfit หรือ null ถ้าไม่มี
  } catch (error) {
    console.error("Error fetching user outfit:", error);
    return null;
  }
};

