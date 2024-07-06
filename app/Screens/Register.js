import { View, Text, StyleSheet, Image, TextInput } from 'react-native'
import React from 'react'
import Colors from '../Shared/Colors'
import login from '../../assets/image/login.png'

export default function Register({ navigation }) {
    return (
        <View style={{
            alignItems: 'center',
            backgroundColor: Colors.yellow,
            height: '100%'
        }}>
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
                    // marginTop: 60,
                }} />
                <Text style={styles.header}>ลงทะเบียน</Text>
                <Text style={styles.description}>สร้างบัญชีของคุณ</Text>
                <TextInput
                    style={styles.input}
                    placeholder="ชื่อผู้ใช้"
                />

                <TextInput
                    style={styles.input}
                    placeholder="อีเมล"
                />

                <TextInput
                    style={styles.input}
                    placeholder="รหัสผ่าน"
                    secureTextEntry
                />

                <TextInput
                    style={styles.input}
                    placeholder="ยืนยันรหัสผ่าน"
                    secureTextEntry
                />

                <View style={styles.buttonlogin}>
                    <Text style={{
                        fontSize: 20,
                        color: Colors.while,
                        padding: 2,
                    }}>เข้าสู่ระบบ</Text>
                </View>
                <View style={{ flexDirection: 'row',marginTop: 20 }}>
                <Text style={{marginRight: 50 }}>มีบัญชีอยู่แล้ว?</Text>
                <Text style={{color:Colors.yellow}}
                onPress={() => navigation.navigate('Loginpage')}>เข้าสู่ระบบ</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        fontSize: 30,
        marginTop: 20,
        marginBottom: 10,
        color: Colors.yellow,
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 40,
    },
    buttonlogin: {
        backgroundColor: Colors.yellow,
        padding: 10,
        borderRadius: 50,
        width: 320,
        marginTop: 10,
        alignItems: 'center'
    },
    input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 30,
  },
  

})