import { View, Text, StyleSheet, Image, Button, TouchableOpacity, SafeAreaView } from 'react-native'
import React from 'react'
import Colors from '../Shared/Colors'
import login from '../../assets/image/login.png'
import { useNavigation } from '@react-navigation/native';

export default function Login() {

    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={{
                alignItems: 'center',
                backgroundColor: Colors.yellow
            }}>
                <View style={{
                    width: 300,
                    height: 500,
                    objectFit: 'contain',
                }}>
                    <Image source={login} style={{
                        width: 330,
                        height: 330,
                        marginTop: 60,
                    }} />
                </View>
                <View style={{
                    backgroundColor: Colors.while,
                    padding: 40,
                    paddingTop: 60,
                    alignItems: 'center',
                    marginTop: -50,
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    width: '100%',
                    height: '100%',
                }}>
                    <Text style={styles.header}>ยินดีตอนรับสู่การออกกำลังกาย</Text>
                    <Text style={styles.header}>เพื่อสุขภาพของคุณ</Text>
                    <View style={{ marginTop: 30 }}>
                        <Text style={styles.description}>แอปพลิเคชั่นนี้ทำให้คุณได้ออกกำลังกาย</Text>
                        <Text style={styles.description}>และสนุกสนานเพลิดเพลินกับเกมส์สัตว์เลี้ยง</Text>
                    </View>
                    <TouchableOpacity style={styles.buttonlogin} onPress={() => navigation.navigate('Loginpage')}>
                        <Text style={{
                            fontSize: 20,
                            color: Colors.while,
                            fontFamily: 'appfont_02',
                        }}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
    header: {
        fontFamily: 'appfont_02',
        fontSize: 24,
    },
    description: {
        fontFamily: 'appfont_01',
        fontSize: 16,
        textAlign: 'center'
    },
    buttonlogin: {
        backgroundColor: Colors.yellow,
        padding: 10,
        borderRadius: 50,
        width: 300,
        marginTop: 20,
        alignItems: 'center',
        marginTop: 50,
    }

})