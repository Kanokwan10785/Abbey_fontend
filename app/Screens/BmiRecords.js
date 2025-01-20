import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Image } from 'expo-image';
import { getUserId } from './apiExercise';
import pet from '../../assets/image/Clothing-Pet/S00P01K00.png'

const BmiRecords = () => {
  const [weight, setWeight] = useState(58); // น้ำหนัก (กิโลกรัม)
  const [heightCm, setHeightCm] = useState(167); // ส่วนสูง (เซนติเมตร)
  const [bmi, setBmi] = useState(0);
  const [bmiStatus, setBmiStatus] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const calculateBmi = () => {
      const height = heightCm / 100; // แปลงส่วนสูงจากเซนติเมตรเป็นเมตร
      const bmiValue = (weight / (height * height)).toFixed(1);
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

    calculateBmi();
  }, [weight, heightCm]);

  const handleSave = () => {
    const weightValue = parseFloat(weight);
    const heightCmValue = parseFloat(heightCm);

    if (!isNaN(weightValue) && !isNaN(heightCmValue)) {
      setWeight(weightValue);
      setHeightCm(heightCmValue);
      setIsModalVisible(false);
      const height = heightCmValue / 100; // แปลงส่วนสูงจากเซนติเมตรเป็นเมตร
      const bmiValue = (weightValue / (height * height)).toFixed(1);
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
    } else {
      alert('กรุณาใส่ข้อมูลที่ถูกต้อง');
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
        <View style={styles.petSection}>
          <Image source={pet} style={styles.petImages} />
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
              value={heightCm.toString()}
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
  petImages: { width: 180, height: 180, },
  bmiInfo: { flexDirection: 'row', alignItems: 'center', left: 20  },
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
