import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const WeightRecords = () => {
  const [weightData, setWeightData] = useState([]);
  const [dateLabels, setDateLabels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchWeightData = async () => {
    try {
      const response = await fetch('http://192.168.1.199:1337/api/weight-records?populate[user][fields][0]=username&fields=date&fields=weight');
      const result = await response.json();

      // กรองข้อมูลเฉพาะ user id = 63
      const filteredData = result.data.filter(item => item.attributes.user.data.id === 67);

      // อัปเดตข้อมูลใน state
      setWeightData(filteredData.map(item => item.attributes.weight));
      setDateLabels(filteredData.map(item => item.attributes.date));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // ดึงข้อมูลจาก API เมื่อ component ถูก mount
  useEffect(() => {
    fetchWeightData();
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มจาก 0 จึงต้อง +1
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // รูปแบบ YYYY-MM-DD
  };
  
  const handleSaveData = async () => {
    const weightValue = parseFloat(newWeight);
    const currentDate = getCurrentDate(); // วันที่ปัจจุบันในรูปแบบ YYYY-MM-DD
  
    if (!isNaN(weightValue) && weightValue > 0) {
      try {
        // POST ไปยัง API
        const response = await fetch('http://192.168.1.199:1337/api/weight-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              date: currentDate, // วันที่ปัจจุบัน
              weight: weightValue,
              user: 67, // user ID ที่กำหนด
            },
          }),
        });
  
        if (response.ok) {
          alert('บันทึกข้อมูลสำเร็จ!');
          setNewWeight(''); // รีเซ็ตฟิลด์น้ำหนัก
          setIsModalVisible(false); // ปิด Modal
          fetchWeightData(); // ดึงข้อมูลใหม่เพื่ออัปเดตกราฟ
        } else {
          alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
      } catch (error) {
        console.error('Error saving data:', error);
        alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
      }
    } else {
      alert('กรุณาใส่น้ำหนักที่ถูกต้อง');
    }
  };  

  // ฟังก์ชันยกเลิก
  const handleCancel = () => {
    setNewWeight('');
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.weightgraphHeader, { height: 75 }]}>
        <Text style={styles.graphTitle}>กราฟน้ำหนัก</Text>
        <View style={styles.graphHeader}>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Text style={styles.graphsaveButtonText}>บันทึก</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.graphContainer}>
        {weightData.length > 0 ? (
          <LineChart
            data={{
              labels: dateLabels,
              datasets: [
                {
                  data: weightData,
                },
              ],
            }}
            width={Dimensions.get('window').width - 20} // from react-native
            height={250}
            yAxisSuffix="kg"
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 1, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            style={{
              borderRadius: 6,
            }}
          />
        ) : (
          <Text style={styles.noDataText}>ไม่มีข้อมูลน้ำหนัก</Text>
        )}
      </View>

      {/* Modal สำหรับการเพิ่มน้ำหนักและวันที่ */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>บันทึกน้ำหนัก</Text>
            <TextInput
              style={styles.inputWeigh}
              value={newWeight}
              onChangeText={setNewWeight}
              placeholder="น้ำหนัก (kg)"
              keyboardType="numeric"
            />
            {/* <TextInput
              style={styles.inputWeigh}
              value={newDate}
              onChangeText={setNewDate}
              placeholder="วันที่ (DD/MM/YYYY)"
            /> */}
            <View style={styles.modalbackButton}>
              <TouchableOpacity onPress={handleSaveData} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                <Text style={styles.backButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  weightgraphHeader: { flexDirection: "column", justifyContent: "space-between", backgroundColor: "#F6A444", marginTop: 20 },
  graphTitle: { color: "#FFF", fontSize: 20, top: "32%", left: 30, fontFamily: "appfont_01" },
  graphContainer: { backgroundColor: '#FFECB3', padding: 10 },
  graphHeader: { backgroundColor: '#fff', padding: 5, borderRadius: 10, position: "absolute", top: "32%", right: 20, paddingHorizontal: 20 },
  graphsaveButtonText: { color: '#F6A444', fontSize: 16, fontFamily: 'appfont_02' },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "80%", padding: 20, backgroundColor: "#FFF", borderRadius: 10 },
  modalTitle: { fontSize: 18, marginBottom: 15, textAlign: "center", fontFamily: 'appfont_01' },
  inputWeigh: { borderColor: "#dcdcdc", borderWidth: 1, borderRadius: 5, marginBottom: 10, paddingHorizontal: 10 },
  modalbackButton: { flexDirection: "row", justifyContent: "space-evenly" },
  modalButton: { backgroundColor: '#F6A444', padding: 10, paddingHorizontal: 25, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  backButton: { backgroundColor: '#F6A444', padding: 10, paddingHorizontal: 25, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  modalButtonText: { color: '#FFF', fontFamily: 'appfont_02' },
  backButtonText: { color: '#FFF', fontFamily: 'appfont_02' },
  noDataText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#888" },
});

export default WeightRecords;
