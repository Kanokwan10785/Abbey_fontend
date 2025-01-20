import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Modal, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchWeightRecords, findRecordByDate, saveWeightRecord, getUserId, saveWeightUesr, updateWeightRecord } from './apiExercise';

const WeightRecords = () => {
  const [weightData, setWeightData] = useState([]);
  const [dateLabels, setDateLabels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');

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
      const sortedData = records.sort((a, b) => new Date(a.attributes.date) - new Date(b.attributes.date));
      setWeightData(sortedData.map(item => item.attributes.weight));
      setDateLabels(sortedData.map(item => formatDate(item.attributes.date)));
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
        alert('บันทึกข้อมูลสำเร็จ!');
        setNewWeight('');
        setIsModalVisible(false);
        fetchData(); // อัปเดตข้อมูลใหม่
      } catch (error) {
        console.error('Error saving weight data:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } else {
      alert('กรุณาใส่น้ำหนักที่ถูกต้อง (20-200 กิโลกรัม)');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: '#F6A444',
              backgroundGradientFrom: '#fb8c00', // สีเริ่มต้นของพื้นหลังแบบ Gradient
              backgroundGradientTo: '#414345', // สีสิ้นสุดของพื้นหลังแบบ Gradient
              decimalPlaces: 2, //จำนวนทศนิยมที่แสดง
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
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
            onDataPointClick={(data) => {
              // แสดงข้อมูลน้ำหนักในจุดที่แตะ
              alert(`วันที่: ${dateLabels[data.index]} \nน้ำหนัก: ${data.value} kg`);
            }}
          />
          </ScrollView>
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
