import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Image } from 'expo-image';
import { fetchPetImageByLabel, getUserId, saveHeightUesr } from './apiExercise';
import { fetchUserProfile } from './api';
import empty from '../../assets/image/Clothing-Icon/empty-icon-01.png';

const BmiRecords = () => {
  const [weight, setWeight] = useState(0); 
  const [heightCm, setHeightCm] = useState(0); 
  const [bmi, setBmi] = useState(0);
  const [bmiStatus, setBmiStatus] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [petImageUrl, setPetImageUrl] = useState(null);

  // ฟังก์ชันกำหนด BMI prefix ตามค่า BMI
  const getBmiPrefix = (bmi) => {
    if (!bmi || isNaN(bmi)) return 'BMI02'; 
    if (bmi < 18.5) return 'BMI01';
    if (bmi >= 18.5 && bmi < 24.9) return 'BMI02';
    if (bmi >= 25 && bmi < 29.9) return 'BMI03';
    return 'BMI04';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getUserId();
        const userData = await fetchUserProfile(userId);
        
        const userWeight = userData.weight || 0;
        const userHeight = userData.height || 0;
  
        setWeight(userWeight);
        setHeightCm(userHeight);
        calculateBmi(userWeight, userHeight);

        // อัปเดต State
        setWeight(userWeight);
        setHeightCm(userHeight);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPetImage = async () => {
      try {
        const userId = await getUserId();
        const userData = await fetchUserProfile(userId);
  
        // ตัด 5 ตัวหน้า และสร้าง Label ใหม่
        const label = userData.clothing_pet?.label || 'BMI00S00P00K00';
        const modifiedLabel = label.slice(5); // ตัด 5 ตัวหน้าออก
        const bmiPrefix = getBmiPrefix(bmi);
        const newLabel = `${bmiPrefix}${modifiedLabel}`;
        console.log('Updated Label:', newLabel);
  
        // ดึง URL รูปภาพใหม่
        const petUrl = await fetchPetImageByLabel(newLabel);
        setPetImageUrl(petUrl);
        console.log('Updated petUrl:', petUrl);
      } catch (error) {
        console.error('Error fetching updated pet image:', error);
      }
    };
  
    if (bmi) {
      fetchPetImage();
    }
  }, [bmi]); // เพิ่ม bmi เป็น Dependency  

  const calculateBmi = (weight, heightCm) => {
    const height = heightCm / 100;
    const bmiValue = (weight / (height * height)).toFixed(2);
    setBmi(bmiValue);

    if (bmiValue < 18.5) {
      setBmiStatus('น้ำหนักน้อย');
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      setBmiStatus('น้ำหนักปกติ');
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      setBmiStatus('น้ำหนักเกิน');
    } else {
      setBmiStatus('โรคอ้วน');
    }
  };

  const handleSave = async () => {
    const weightValue = parseFloat(weight);
    const heightCmValue = parseFloat(heightCm);
  
    if (!isNaN(weightValue) && !isNaN(heightCmValue) && heightCmValue > 0) {
      // คำนวณ BMI ใหม่
      const height = heightCmValue / 100; // แปลงส่วนสูงจากเซนติเมตรเป็นเมตร
      const newBmi = (weightValue / (height * height)).toFixed(2); // คำนวณ BMI ใหม่
      setBmi(newBmi); // อัปเดตค่า BMI ใน state
  
      // อัปเดตสถานะ BMI
      if (newBmi < 18.6) {
        setBmiStatus('น้ำหนักน้อย');
      } else if (newBmi >= 18.6 && newBmi < 24.9) {
        setBmiStatus('น้ำหนักปกติ');
      } else if (newBmi >= 25 && newBmi < 29.9) {
        setBmiStatus('น้ำหนักเกิน');
      } else {
        setBmiStatus('โรคอ้วน');
      }
  
      // เรียกใช้ฟังก์ชัน saveHeightUesr เพื่ออัปเดตข้อมูลในเซิร์ฟเวอร์
      try {
        const userId = await getUserId(); // ดึง userId
        await saveHeightUesr(heightCmValue, newBmi, userId); // ส่งส่วนสูงและ BMI ใหม่
        alert('บันทึกข้อมูลสำเร็จ');
        setIsModalVisible(false); // ปิด Modal หลังบันทึกสำเร็จ
      } catch (error) {
        console.error('Error updating height and BMI:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } else {
      alert('กรุณากรอกข้อมูลที่ถูกต้อง');
    }
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.bmiHeader}>
        <Text style={styles.bmiLabel}>ค่าดัชนีมวลกาย</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.editButtonText}>แก้ไข</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bmiContainer}>
        {/* Section สำหรับรูปสัตว์เลี้ยง */}
        <View style={styles.petImages}>
          <Image source={petImageUrl ? { uri: petImageUrl } : empty} style={styles.petImage} />
        </View>

        {/* Section สำหรับค่าดัชนีมวลกาย */}
        <View style={styles.bmiInfo}>
          <Text style={styles.bmiValue}>{bmi}</Text>
          <Text style={styles.bmiStatus}>{bmiStatus}</Text>
        </View>

      </View>
      {/* Modal สำหรับการแก้ไขข้อมูล */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {}} // ไม่ทำอะไรเมื่อปิด Modal ด้วยปุ่ม Back (Android)
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>แก้ไขส่วนสูง</Text>
            <TextInput
              style={styles.input}
              value={heightCm}
              onChangeText={(text) => setHeightCm(parseFloat(text))}
              placeholder="ส่วนสูง (cm)"
              keyboardType="numeric"
            />
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.buttonText}>บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.buttonText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  bmiHeader: { height: 75, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F6A444' },
  bmiLabel: { fontSize: 20, color: '#FFF', fontFamily: "appfont_01", left: 30 },
  editButton: { backgroundColor: '#fff', padding: 5, borderRadius: 10, position: "absolute", top: "32%", right: 20, paddingHorizontal: 25 },
  editButtonText: { color: '#F6A444', fontSize: 16, fontFamily: 'appfont_02' },
  bmiContainer: { flexDirection: 'row', backgroundColor: '#FFECB3', height: 280 },
  petSection: {top: "15%", left: 20},
  petImages: { width: 198, height: 180 },
  petImage: { width: '100%', height: '100%',top: '25%' },
  bmiInfo: { flexDirection: 'row', alignItems: 'center', left: 15  },
  bmiValue: { fontSize: 48, color: '#4CAF50', fontFamily: 'appfont_02' },
  bmiStatus: { fontSize: 18, marginTop: 18, color: '#757575', left: 10, fontFamily: 'appfont_02' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: '#FFF', borderRadius: 10, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, marginBottom: 15, fontFamily: 'appfont_01' },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 10, padding: 10, width: '100%', marginBottom: 15 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  saveButton: { backgroundColor: '#F6A444', padding: 10, paddingHorizontal: 25, borderRadius: 5 },
  cancelButton: { backgroundColor: '#F6A444', padding: 10, paddingHorizontal: 25, borderRadius: 5 },
  buttonText: { color: '#FFF', fontFamily: 'appfont_02' },
});

export default BmiRecords;
