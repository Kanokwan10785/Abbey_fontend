import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity,Alert } from 'react-native'
import React, { useState } from 'react'
import Colors from '../Shared/Colors'
import loginImage from '../../assets/image/login.png'
import {login} from './api'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function Loginpage() {  
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleLogin = async () => {
        try {
          const response = await login(username, password);
          console.log('Login successful', response);
          await AsyncStorage.setItem('jwt', response.jwt);
          navigation.navigate('HomeScreen');

        } catch (error) {
          Alert.alert('Login failed', error.response ? error.response.data.message : error.message);
        }
      };
    return (
        <View style={{
            alignItems: 'center',
            backgroundColor: Colors.yellow,
            height: '100%',    
        }}>
            <View style={{
                backgroundColor: Colors.while,
                padding: 40,
                paddingTop: 60,
                alignItems: 'center',
                marginTop: 30,
                borderRadius: 40,
                width: 390,
                height: '94%',
            }}>

                <Image source={loginImage} style={{
                    width: 300,
                    height: 250,
                    // marginTop: 60,
                }} />
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

                    <Text style={{
                        fontSize: 20,
                        color: Colors.while,
                        padding: 2,
                        fontFamily: 'appfont_01', 
                    }}>เข้าสู่ระบบ</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row',marginTop: 20 }}>
                <Text style={{marginRight: 50, fontFamily: 'appfont_01',  }}>ยังไม่มีบัญชีใช่หรือไม่?</Text>
                <Text style={{color:Colors.yellow, fontFamily: 'appfont_01', }}  onPress={() => navigation.navigate('Register')}>สร้างบัญชี</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
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
        width: 320,
        marginTop: 20,
        alignItems: 'center',
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
  

})