import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import Colors from '../Shared/Colors';
import loginImage from '../../assets/image/login.png';
import { login } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function Loginpage() {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('ลงชื่อเข้าใช้ไม่สำเร็จ', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
            return;
        }
    
        try {
            const response = await login(username, password);
            console.log('Login successful', response);
            await AsyncStorage.setItem('jwt', response.jwt);
            navigation.navigate('HomeScreen');
        } catch (error) {
            console.error('Login error details:', error.response ? error.response.data : error.message);
            Alert.alert('Login failed', error.response ? error.response.data.message : error.message);
            // if (error.response) {    
            //     const errorMessage = error.response.data.message;
    
            //     if (errorMessage === "Invalid identifier or password") {
            //         if (username && password) {
            //             // กรณีที่ 2: ชื่อถูก แต่รหัสผ่านผิด
            //             Alert.alert('ลงชื่อเข้าใช้ไม่สำเร็จ', 'กรุณากรอกรหัสผ่านให้ถูกต้อง');
            //         } else {
            //             // กรณีที่ 3: ชื่อไม่ถูกต้อง
            //             Alert.alert('ลงชื่อเข้าใช้ไม่สำเร็จ', 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
            //         }
            //     } else {
            //         Alert.alert('ลงชื่อเข้าใช้ไม่สำเร็จ', errorMessage);
            //     }
            // } else if (error.request) {
            //     Alert.alert('Login failed', 'No response from server');
            // } else {
            //     Alert.alert('Login failed', error.message);
            // }
        }
    };
    

    return (
        <View style={styles.container}>
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
                    <TextInput
                        style={styles.input}
                        placeholder="รหัสผ่าน"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
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
        </View>
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
    input: {
        width: '100%',
        padding: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        marginBottom: 30,
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
