import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView,SafeAreaView } from 'react-native'; // เพิ่ม ActivityIndicator
import { Image, ImageBackground } from 'expo-image';
import React, { useState, useEffect } from 'react';
import Colors from '../Shared/Colors';
import loginImage from '../../assets/image/login.png';
import grass from '../../assets/image/Background-Theme/gym-03.gif';
import { login } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { fetchUserProfile, beginnerClothingItem, fetchUserOutfit, fetchItemsData, fetchUserFoodQuantity, buyFoodItemBeginner } from './api';
import { saveHeightUesr } from './apiExercise';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Loginpage() {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [loading, setLoading] = useState(false);  // สถานะสำหรับ Loading Screen

    const togglePasswordVisibility = () => {
        setSecureTextEntry(!secureTextEntry);
    };

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('ลงชื่อเข้าใช้ไม่สำเร็จ', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
            return;
        }
    
        try {
            setLoading(true);  // เริ่มการโหลดข้อมูล
            const response = await login(username, password);
            const userId = response.user.id; 
            const jwt = response.jwt;
            const bmi = response.user.BMI;
            console.log('✅ Login successful:', response);
            await AsyncStorage.setItem('jwt', jwt); // เก็บข้อมูล
            await AsyncStorage.setItem(`bmi-${userId}`, bmi ? bmi.toString() : "N/A");
            await AsyncStorage.setItem('userId', userId.toString()); // เก็บ userId ใน AsyncStorage

                // ตรวจสอบว่าดึงข้อมูลโปรไฟล์สำเร็จหรือไม่
            try {
                const userData = await fetchUserProfile(userId);
                // console.log('User data loaded:', userData);
            } catch (profileError) {
                console.warn('Failed to fetch user profile, but continuing login:', profileError);
            }

            // ตรวจสอบค่า BMI
            const userData = await fetchUserProfile(userId);
            let userBmi = userData.BMI || null;
            const userWeight = userData.weight || 0;
            const userHeight = userData.height || 0;

            if (userBmi === null && userHeight > 0 && userWeight > 0) {
                // คำนวณ BMI ใหม่
                const heightInMeters = userHeight / 100;
                const calculatedBmi = (userWeight / (heightInMeters * heightInMeters)).toFixed(2);

                // บันทึกค่า BMI บนเซิร์ฟเวอร์
                await saveHeightUesr(userHeight, calculatedBmi, userId);
                console.log('Updated BMI on login:', calculatedBmi);
            }

            // ดึงข้อมูลเสื้อผ้าของผู้ใช้จากเซิร์ฟเวอร์
            const savedOutfit = await fetchUserOutfit(userId, jwt);
            if (savedOutfit) {
                await AsyncStorage.setItem(`userOutfit-${userId}`, JSON.stringify(savedOutfit));
                console.log('✅ Loaded outfit from server:', savedOutfit);
            }

            // เพิ่มไอเท็มเริ่มต้นให้กับผู้ใช้
            // console.log("Adding beginner clothing items...");
            const beginnerItems = [
                { id: 5, label: 'K00' } // ไอเท็มเริ่มต้นที่ต้องให้ผู้ใช้
            ];

            for (const item of beginnerItems) {
                await beginnerClothingItem(userId, item.id, item.label);
                // console.log(`Beginner Clothing Item Response for ${item.label}:`, result);
            }

            const mapFoodNameToEnglish = (thaiName) => {
                const foodMapping = {
                    "แอปเปิ้ล": "apple",
                    "แตงโม": "watermelon",
                    "ปลาทอด": "fried fish",
                    "เนื้อย่าง": "roast beef",
                    "เบอร์เกอร์": "hamburger",
                    "น่องไก่ทอด": "fried chicken"
                };
                return foodMapping[thaiName] || thaiName; // ถ้าไม่พบ ให้ใช้ชื่อเดิม
            };
            
            // ✅ ดึงข้อมูลอาหารที่ผู้ใช้มี
            const userFoodData = await fetchUserFoodQuantity(userId);
            const userFoodNames = userFoodData.map(f => f.buy_food); // เป็นชื่อภาษาอังกฤษ
            
            console.log("📌 รายการอาหารที่ผู้ใช้มีอยู่แล้ว (EN):", userFoodNames);
            
            // ✅ ดึงข้อมูลสินค้าหมวดหมู่อาหารทั้งหมด
            const foodItems = await fetchItemsData();
            const foodCategoryItems = foodItems.filter(item => item.attributes.category === 'Food-item');
            
            // ✅ ค้นหาสินค้าที่ผู้ใช้ไม่มี โดยแปลงชื่อเป็นภาษาอังกฤษก่อนเปรียบเทียบ
            const missingFoodItems = foodCategoryItems.filter(item => {
                const englishFoodName = mapFoodNameToEnglish(item.attributes.name);
                return !userFoodNames.includes(englishFoodName);
            });
            
            console.log("🚨 รายการอาหารที่ผู้ใช้ยังไม่มี (ต้องเพิ่ม):", missingFoodItems.map(item => item.attributes.name));
            
            // ✅ POST เพิ่มสินค้าหมวดอาหารที่ขาด
            for (const foodItem of missingFoodItems) {
                const englishFoodName = mapFoodNameToEnglish(foodItem.attributes.name);

                console.log(`📤 กำลังเพิ่มอาหาร: ${foodItem.attributes.name} (${englishFoodName})`);

                const result = await buyFoodItemBeginner(userId, foodItem.id, englishFoodName, 0);

                if (result.success === false) { // ✅ ตรวจสอบว่ามี success = false เท่านั้น
                    console.error(`❌ เพิ่มสินค้าอาหารไม่สำเร็จ: ${englishFoodName}`);
                }
            }

            // แสดงหน้ารอดาวน์โหลดข้อมูล
            setTimeout(() => {
                setLoading(false);  // หยุดการโหลดหลังจากเสร็จสิ้น
                navigation.navigate('HomeScreen');  // เปลี่ยนไปยังหน้า HomeScreen
            }, 100);  // จำลองการโหลด 8 วินาที
        } catch (error) {
            // แสดงข้อความที่ละเอียดมากขึ้น
            if (error.response && error.response.data && error.response.data.error) {
                const errorMessage = error.response.data.error.message;
                Alert.alert('ลงชื่อเข้าใช้ไม่สำเร็จ', errorMessage);
            } else {
                Alert.alert('ลงชื่อเข้าใช้ไม่สำเร็จ', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
            }
    
            // หยุดการแสดง Loading เมื่อเกิดข้อผิดพลาด
            setLoading(false);
            console.error('Login error details:', error.response ? error.response.data : error.message);
        }
    };
    
    if (loading) {
        return (
            <ImageBackground source={grass} style={styles.loadingContainer}>
                {/* <ActivityIndicator size="large" color="#00ff00" />
                <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text> */}
            </ImageBackground>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.innerContainer}>
                    <Image source={loginImage} style={styles.image} />
                    <Text style={styles.header}>ลงชื่อเข้าใช้</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ชื่อผู้ใช้"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="รหัสผ่าน"
                            secureTextEntry={secureTextEntry}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                            <Icon name={secureTextEntry ? "eye-off" : "eye"} size={24} color="gray" />
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity style={styles.buttonlogin} onPress={handleLogin}>
                        <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
                    </TouchableOpacity>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>ยังไม่มีบัญชีใช่หรือไม่?</Text>
                        <Text style={styles.registerText} onPress={() => navigation.navigate('Register')}>
                            สร้างบัญชี
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.yellow,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        backgroundColor: Colors.while,
        padding: 40,
        paddingTop: 60,
        alignItems: 'center',
        borderRadius: 40,
        width: '90%',
    },
    image: {
        width: 300,
        height: 250,
    },
    header: {
        fontSize: 30,
        marginTop: 20,
        marginBottom: 40,
        color: Colors.yellow,
        fontFamily: 'appfont_02',
    },
    input: {
        width: '100%',
        padding: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 20,
        fontFamily: 'appfont_01',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingRight: 15,
        marginBottom: 30,
    },
    passwordInput: {
        flex: 1,
        padding: 20,
        fontFamily: 'appfont_01',
    },
    eyeIcon: {
        padding: 10,
    },
    buttonlogin: {
        backgroundColor: Colors.yellow,
        padding: 10,
        borderRadius: 50,
        width: '100%',
        marginTop: 20,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 20,
        color: Colors.while,
        fontFamily: 'appfont_01',
    },
    footer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    footerText: {
        marginRight: 10,
        fontFamily: 'appfont_01',
    },
    registerText: {
        color: Colors.yellow,
        fontFamily: 'appfont_01',
    },
});
