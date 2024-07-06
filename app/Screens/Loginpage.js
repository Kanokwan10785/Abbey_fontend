import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import Colors from '../Shared/Colors'
import login from '../../assets/image/login.png'

export default function Loginpage() {  
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

                <Image source={login} style={{
                    width: 300,
                    height: 250,
                    // marginTop: 60,
                }} />
                <Text style={styles.header}>ลงชื่อเข้าใช้</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ชื่อผู้ใช้"
                />

                <TextInput
                    style={styles.input}
                    placeholder="รหัสผ่าน"
                    secureTextEntry
                />
                <TouchableOpacity style={styles.buttonlogin}>

                    <Text style={{
                        fontSize: 20,
                        color: Colors.while,
                        padding: 2,
                        fontFamily: 'appfont_01', 
                    }}>เข้าสู่ระบบ</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row',marginTop: 20 }}>
                <Text style={{marginRight: 50, fontFamily: 'appfont_01',  }}>ยังไม่มีบัญชีใช่หรือไม่?</Text>
                <Text style={{color:Colors.yellow, fontFamily: 'appfont_01', }}>สร้างบัญชี</Text>
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