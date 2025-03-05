import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { register } from './api';

const Question = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { username, email, password } = route.params;
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [selectedGender, setSelectedGender] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleSubmit = async () => {
    let missingFields = [];

    if (!username) missingFields.push("ชื่อผู้ใช้");
    if (!isValidEmail(email)) {
      setAlertMessage("กรุณากรอกอีเมลให้ถูกต้อง (เช่น example@email.com)");
      setAlertVisible(true);
      return;
    }
    if (password) missingFields.push("รหัสผ่าน");
    if (!height) missingFields.push("ส่วนสูง");
    if (!weight) missingFields.push("น้ำหนัก");
    if (!age) missingFields.push("อายุ");
    if (!selectedGender) missingFields.push("เพศ");

    if (missingFields.length > 0) {
        setAlertMessage(`กรุณากรอกข้อมูลให้ครบถ้วน: ${missingFields.join(", ")}`);
        setAlertVisible(true);
        return;
    }

    try {
      const response = await register(username, email, password, height, weight, age, selectedGender);
      console.log('ลงทะเบียนสำเร็จ:', response);
      navigation.navigate('Loginpage');
  } catch (error) {
      console.error('รายละเอียดข้อผิดพลาด:', error.response ? error.response.data : error.message);
  
      let errorMessage = "ลงทะเบียนไม่สำเร็จ: โปรดลองใหม่อีกครั้ง";
  
      if (error.response) {
          if (error.response.status === 400 && error.response.data.message.includes("Email already exists")) {
              errorMessage = "อีเมลนี้ถูกใช้งานไปแล้ว โปรดใช้บัญชีอื่น";
          } else if (error.response.data.message.includes("Passwords do not match")) {
              errorMessage = "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบ";
          } else if (error.response.status === 400) {
              errorMessage = "กรุณาตรวจสอบข้อมูลและลองใหม่";
          }
      }
  
      setAlertMessage(errorMessage);
      setAlertVisible(true);
  }  
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ข้อมูลส่วนตัว</Text>
      <Text style={styles.subtitle}>ทำให้เรารู้จักกับคุณมากขึ้น</Text>

      <TextInput
        style={styles.input}
        placeholder="ส่วนสูง (cm):"
        keyboardType="numeric"
        value={height}
        onChangeText={setHeight}
      />
      <TextInput
        style={styles.input}
        placeholder="น้ำหนัก (kg):"
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
      <TextInput
        style={styles.input}
        placeholder="อายุ:"
        keyboardType="numeric"
        value={age}
        onChangeText={setAge}
      />

      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[styles.genderButton, selectedGender === 'male' && styles.selectedGenderButton]}
          onPress={() => setSelectedGender('male')}
        >
          <Icon name="gender-male" size={40} color={selectedGender === 'male' ? '#FFF' : '#FFA500'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderButton, selectedGender === 'female' && styles.selectedGenderButton]}
          onPress={() => setSelectedGender('female')}
        >
          <Icon name="gender-female" size={40} color={selectedGender === 'female' ? '#FFF' : '#FFA500'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={handleSubmit}
      >
        <Text style={styles.startButtonText}>เริ่มต้น</Text>
      </TouchableOpacity>

      {/* Custom Alert Modal */}
      <CustomAlertModal visible={alertVisible} message={alertMessage} onClose={() => setAlertVisible(false)} />
    </View>
  );
};

// Custom Alert Modal Component
const CustomAlertModal = ({ visible, message, onClose }) => (
  <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.customAlertContainer}>
      <View style={styles.customAlertBox}>
        <Text style={styles.customAlertTitle}>ลงทะเบียนไม่สำเร็จ</Text>
        <Text style={styles.customAlertMessage}>{message}</Text>
        <TouchableOpacity style={styles.customAlertButton} onPress={onClose}>
          <Text style={styles.customAlertButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);


const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  backButton: { alignSelf: 'flex-start', padding: 8 },
  title: { fontFamily: 'appfont_01', fontSize: 35, textAlign: 'center', marginVertical: 8, marginTop: 40 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 16, fontFamily: 'appfont_01' },
  input: { height: 45, width: '85%', borderColor: '#DDD', borderWidth: 1, borderRadius: 8, marginBottom: 20, paddingHorizontal: 10, alignSelf: 'center', fontSize: 16, fontFamily: 'appfont_01' },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  genderButton: { borderWidth: 1, borderColor: '#FFA500', borderRadius: 8, padding: 16, width: 140, alignItems: 'center', height: 70 },
  selectedGenderButton: { backgroundColor: '#FFA500' },
  animalContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 30 },
  animalButton: { borderWidth: 1, borderColor: '#FFA500', borderRadius: 8, padding: 16, width: 140, alignItems: 'center', height: 140 },
  selectPetButton: { backgroundColor: '#FFA500' },
  animalIcon: { width: 100, height: 100 },
  startButton: { backgroundColor: '#FFA500', paddingVertical: 15, marginTop: 32, borderRadius: 50, width: 320, alignSelf: 'center' },
  startButtonText: { color: '#FFF', fontSize: 20, fontFamily: 'appfont_01', textAlign: 'center' },
  customAlertContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  customAlertBox: { width: 320, padding: 20, borderRadius: 10, alignItems: "center", backgroundColor: "#F9E79F", borderColor: "#E97424", borderWidth: 6 },
  customAlertTitle: { fontSize: 20, fontFamily: "appfont_02", marginBottom: 5 },
  customAlertMessage: { fontSize: 16, fontFamily: "appfont_01", marginBottom: 15, textAlign: "center" },
  customAlertButton: { backgroundColor: "#e59400", borderRadius: 10, padding: 10, alignItems: "center", width: "40%" },
  customAlertButtonText: { fontSize: 18, textAlign: "center", color: "white", fontFamily: "appfont_02" },
});

export default Question;