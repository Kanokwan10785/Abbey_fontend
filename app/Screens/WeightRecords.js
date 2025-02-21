import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, DeviceEventEmitter, Modal, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeightRecords, findRecordByDate, saveWeightRecord, getUserId, saveWeightUesr, updateWeightRecord } from './apiExercise';
import { fetchUserProfile } from './api';

const WeightRecords = () => {
  const [weightData, setWeightData] = useState([]);
  const [dateLabels, setDateLabels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isSaveAlertVisible, setSaveAlertVisible] = useState(false);
  const [isDataPointModalVisible, setDataPointModalVisible] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear() + 543).slice(-2); // แปลงเป็นปี พ.ศ. และเอาเฉพาะ 2 หลักสุดท้าย
    return `${day} ${month} ${year}`;
  };

  const fetchData = async () => {
    try {
      const userId = await getUserId();
      const records = await fetchWeightRecords(userId);
  
      if (records.length === 0) {
        // ไม่มีข้อมูลน้ำหนัก สร้างข้อมูลเริ่มต้น
        const userData = await fetchUserProfile(userId);
        const userWeight = userData.weight || 0;
        const currentDate = new Date().toISOString().split('T')[0];
  
        if (userWeight > 0) {
          // บันทึกน้ำหนักเริ่มต้นในระบบ
          await saveWeightRecord(userWeight, currentDate, userId);
          setWeightData([userWeight]);
          setDateLabels([formatDate(currentDate)]);
        }
      } else {
        // จัดการข้อมูลน้ำหนักและวันที่ตามปกติ
        const sortedData = records.sort((a, b) => new Date(a.attributes.date) - new Date(b.attributes.date));
        setWeightData(sortedData.map(item => item.attributes.weight));
        setDateLabels(sortedData.map(item => formatDate(item.attributes.date)));
      }
    } catch (error) {
      alert('ไม่สามารถโหลดข้อมูลได้');
    }
  }; 

  const handleSaveData = async () => {
    const weightValue = parseFloat(newWeight);
    const currentDate = new Date().toISOString().split('T')[0];
    if (!isNaN(weightValue) && weightValue > 20 && weightValue <= 200) {
      try {
        const userId = await getUserId();
        // console.log('Saving weight to API:', weightValue); // บันทึกการส่งข้อมูล
        // console.log('UserId to API:', userId);

        // ตรวจสอบว่ามี record ในวันเดียวกันหรือไม่
        const existingRecord = await findRecordByDate(userId, currentDate);
        if (existingRecord) {
          // หากมี record ในวันเดียวกัน ใช้ PUT เพื่ออัปเดต
          const recordId = existingRecord.id; // ID ของ record
          await updateWeightRecord(recordId, weightValue); // เรียกฟังก์ชันที่แยกไว้
        } else {
          // หากไม่มี record ใช้ POST เพื่อสร้าง record ใหม่
          await saveWeightRecord(weightValue, currentDate, userId);
        }
  
        // อัปเดตน้ำหนักใน users table
        await saveWeightUesr(weightValue, userId);

        // เรียกข้อมูลใหม่จากเซิร์ฟเวอร์เพื่อคำนวณ BMI
        const userData = await fetchUserProfile(userId);
        const height = userData.height;
        const newBmi = (weightValue / ((height / 100) ** 2)).toFixed(2);
        
        await AsyncStorage.setItem(`bmi-${userId}`, newBmi); // บันทึก BMI ใน AsyncStorage

        // แจ้งเตือนการอัปเดต
        DeviceEventEmitter.emit('weightUpdated'); // ส่งเหตุการณ์ว่าข้อมูลเปลี่ยนแปลง WeightRecords
        DeviceEventEmitter.emit('WeightRecordsUpdated', { bmi: newBmi }); // แจ้งเตือนให้ BottomProfile โหลดข้อมูลใหม่
        DeviceEventEmitter.emit('bmiUpdatedClothingScreen'); // ส่ง Event แจ้งเตือนให้หน้า ClothingScreen.js โหลดข้อมูลใหม่
        setTimeout(() => {                        
            DeviceEventEmitter.emit('bmiUpdated');
        }, 1000); // รอ 1 วินาที

        setNewWeight('');
        setIsModalVisible(false);
        setSaveAlertVisible(true); // แสดง alert เมื่อบันทึกสำเร็จ
        fetchData(); // อัปเดตข้อมูลใหม่
      } catch (error) {
        console.error('Error saving weight data:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } else {
      alert('กรุณาใส่น้ำหนักที่ถูกต้อง (20-200 กิโลกรัม)');
    }
  };

  const handleDataPointClick = ({ value, index }) => {
    setSelectedWeight(value);
    setSelectedDate(dateLabels[index]);
    setDataPointModalVisible(true);
  };  

  const CustomAlertSaveWeight = ({ visible, onClose }) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.customAlertContainer}>
        <View style={styles.customAlertBox}>
          <Text style={styles.customAlertTitle}>บันทึกข้อมูลสำเร็จ!</Text>
          <Text style={styles.customAlertMessage}>ข้อมูลน้ำหนักของคุณถูกบันทึกแล้ว</Text>
          <TouchableOpacity style={styles.customAlertButton} onPress={onClose}>
            <Text style={styles.customAlertButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  useEffect(() => {
    fetchData();
  }, []);

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
          {/* 🔹 น้ำหนักปัจจุบัน / สูงสุด / ต่ำสุด */}
      {weightData.length > 0 && (
          <View style={styles.weightSummaryContainer}>
            {/* น้ำหนักปัจจุบัน */}
            <View style={styles.currentWeightContainer}>
              <Text style={styles.weightLabel}>ปัจจุบัน</Text>
              <View style={styles.weightValueContainer}>
                <Text style={styles.currentWeight}>{weightData[weightData.length - 1]}</Text>
                <Text style={styles.weightUnit}>kg</Text>
              </View>
            </View>

            {/* น้ำหนักสูงสุด & ต่ำสุด */}
            <View style={styles.weightStatsContainer}>
              <Text style={styles.weightStatLabel}>หนักที่สุด: <Text style={styles.weightStatValue}>{Math.max(...weightData)}</Text></Text>
              <Text style={styles.weightStatLabel}>เบาที่สุด: <Text style={styles.weightStatValue}>{Math.min(...weightData)}</Text></Text>
            </View>
          </View>
        )}
        {weightData.length > 0 ? (
          <ScrollView horizontal>
          <LineChart
            data={{
              labels: dateLabels,
              datasets: [
                {
                 data: weightData,
                  // color: (opacity = 1) => `rgba(34, 202, 236, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={Math.max(Dimensions.get('window').width, weightData.length * 80)} // ความกว้างของกราฟขึ้นกับจำนวนจุด
            height={250}
            yAxisSuffix="kg"
            // fromZero={true} // เริ่มต้นที่ 0
            yAxisInterval={10} // แสดงตัวเลขเพิ่มทีละ 10
            verticalLabelRotation={0} //ปรับมุมของป้ายกำกับแกน x
            segments={7} // จำนวนเส้นสเกลแนวนอน
            chartConfig={{
              backgroundGradientFrom: "rgb(215, 143, 61)",
              backgroundGradientTo: "rgb(228, 134, 26)",
              decimalPlaces: 2, //จำนวนทศนิยมที่แสดง
              withInnerLines: false, // ปิดเส้นภายในเพื่อลดการรบกวนการแตะ
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              propsForDots: {
                r: '8',
                strokeWidth: '3',
                stroke: '#ffa726',
              },
              propsForBackgroundLines: {
                stroke: '#FFD580', // สีของเส้นแนวนอนในพื้นหลัง
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 10, // มุมโค้ง
              // borderWidth: 2,
              // borderColor: '#F6A444', // ขอบรอบกราฟ
            }}
            onDataPointClick={handleDataPointClick}
              renderDotContent={({ x, y, index }) => (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    left: x + 12,
                    top: y - 260,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    paddingHorizontal: 5,
                    paddingVertical: 2,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>
                    {weightData[index]} kg
                  </Text>
                </View>
              )}
            />
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>ไม่มีข้อมูลน้ำหนัก</Text>
        )}
      </View>

      {/* Modal สำหรับแสดงข้อมูลน้ำหนักที่แตะ */}
      <Modal
        visible={isDataPointModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDataPointModalVisible(false)}
      >
        <View style={styles.customAlertContainer}>
          <View style={styles.customAlertBoxGraph}>
            <Text style={styles.customAlertTitle}>วันที่ {selectedDate} </Text>
            <View style={styles.weightDisplay}>
              <Text style={styles.customAlertMessageGraph}>
                {selectedWeight}
              </Text>
              <Text style={styles.customAlertMessageText}>
                kg
              </Text>
            </View>
            <TouchableOpacity
              style={styles.customAlertButton}
              onPress={() => setDataPointModalVisible(false)}
            >
              <Text style={styles.customAlertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

      <CustomAlertSaveWeight visible={isSaveAlertVisible} onClose={() => setSaveAlertVisible(false)} />
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
  customAlertContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  customAlertBox: { width: 320, padding: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#F9E79F", borderColor: "#E97424", borderWidth: 6 },
  customAlertBoxGraph: { width: 280, padding: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#F9E79F", borderColor: "#E97424", borderWidth: 6 },
  weightDisplay: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  customAlertTitle: { fontSize: 20, fontFamily: "appfont_02", marginBottom: 3 },
  customAlertMessage: { fontSize: 16, fontFamily: "appfont_01", marginBottom: 10 },
  customAlertMessageText: { fontSize: 16, fontFamily: "appfont_01" },
  customAlertMessageGraph: { fontSize: 32, fontFamily: "appfont_01", marginRight: 8 },
  customAlertButtonText: { fontSize: 18, textAlign: "center", color: "white", fontFamily: "appfont_02" },
  customAlertButton: { backgroundColor: "#e59400", color: "white", borderRadius: 10, padding: 2, alignItems: "center", width: "25%" },
  weightSummaryContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 },
  currentWeightContainer: { alignItems: "flex-start" },
  weightLabel: { fontSize: 16, color: "#444", fontFamily: "appfont_02" },
  weightValueContainer: { flexDirection: "row", alignItems: "baseline" },
  currentWeight: { fontSize: 32, fontWeight: "bold", color: "#222" },
  weightUnit: { fontSize: 18, fontWeight: "bold", color: "#444", marginLeft: 5, fontFamily: "appfont_02" },
  weightStatsContainer: { alignItems: "flex-end" },
  weightStatLabel: { fontSize: 14, color: "#666", fontFamily: "appfont_02" },
  weightStatValue: { fontSize: 16, fontWeight: "bold", color: "#222", fontFamily: "appfont_02" },
});

export default WeightRecords;
