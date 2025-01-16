import { View, Text, StyleSheet, Image, TextInput,Alert, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import Colors from '../Shared/Colors'
import login from '../../assets/image/login.png'
import { useNavigation } from '@react-navigation/native';
import { register } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Register() {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        if (password !== confirmPassword) {
          console.error('Passwords do not match');
          return;
        }
      
        try {
          navigation.navigate('Question', { username, email, password });
        } catch (error) {
          Alert.alert('Registration failed//', error.response ? error.response.data.message : error.message);
        }
      };

    return (
        <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={{
                backgroundColor: Colors.while,
                padding: 40,
                paddingTop: 50,
                alignItems: 'center',
                marginTop: 30,
                borderRadius: 40,
                width: 390,
                height: '94%',
            }}>

                <Image source={login} style={{
                    width: 200,
                    height: 180,

                }} />
                <Text style={styles.header}>ลงทะเบียน</Text>
                <Text style={styles.description}>สร้างบัญชีของคุณ</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ชื่อผู้ใช้"
                    value={username}
                    onChangeText={setUsername}
                />

                <TextInput
                    style={styles.input}
                    placeholder="อีเมล"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="รหัสผ่าน"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TextInput
                    style={styles.input}
                    placeholder="ยืนยันรหัสผ่าน"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <TouchableOpacity style={styles.buttonlogin} onPress={handleRegister}>
                    <Text style={{
                        fontSize: 20,
                        color: Colors.while,
                        padding: 2,
                        fontFamily: 'appfont_01',
                    }}>หน้าถัดไป</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row',marginTop: 20 }}>
                <Text style={{marginRight: 50 ,fontFamily:'appfont_01'}}>มีบัญชีอยู่แล้ว?</Text>
                <Text style={{color:Colors.yellow ,fontFamily:'appfont_01'}}
                onPress={() => navigation.navigate('Loginpage')}>เข้าสู่ระบบ</Text>
                </View>
            </View>
            </ScrollView>
        </View>
    )
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
    header: {
        fontSize: 30,
        marginTop: 20,
        marginBottom: 10,
        color: Colors.yellow,
        fontFamily: 'appfont_02',
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 40,
        fontFamily: 'appfont_01',
    },
    buttonlogin: {
        backgroundColor: Colors.yellow,
        padding: 10,
        borderRadius: 50,
        width: 320,
        marginTop: 10,
        alignItems: 'center',
        fontFamily: 'appfont_02',
    },
    input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 30,
    fontFamily: 'appfont_01',
  },
  

})