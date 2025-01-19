import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const WeightRecords = () => {
  const [weight, setWeight] = useState(58); // น้ำหนัก (กิโลกรัม)
  const [heightCm, setHeightCm] = useState(167); // ส่วนสูง (เซนติเมตร)

  const [weightData, setWeightData] = useState([55, 56, 57, 58, 59]); // ค่าน้ำหนักในกราฟ
  const [dateLabels, setDateLabels] = useState(['01/01/2025', '02/01/2025', '03/01/2025', '04/01/2025', '05/01/2025']); // วันที่ในกราฟ
  const [newWeight, setNewWeight] = useState(''); // น้ำหนักใหม่ที่จะใส่
  const [newDate, setNewDate] = useState(''); // วันที่ใหม่ที่จะใส่
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSaveData = () => {
    const weightValue = parseFloat(newWeight);
    const dateValue = newDate.trim();

    if (!isNaN(weightValue) && weightValue > 0 && dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      setWeightData([...weightData, weightValue]);
      setDateLabels([...dateLabels, dateValue]);
      setWeight(weightValue); // อัปเดตน้ำหนักล่าสุด
      setNewWeight(''); // รีเซ็ตค่าอินพุตหลังจากเพิ่มข้อมูลแล้ว
      setNewDate('');
      setIsModalVisible(false); // ปิดป๊อปอัปหลังจากบันทึกข้อมูล
    } else {
      alert('กรุณาใส่น้ำหนักที่ถูกต้องและวันที่ในรูปแบบ DD/MM/YYYY');
    }
  };

  const handleCancel = () => {
    setNewWeight(''); // รีเซ็ตน้ำหนักใหม่
    setNewDate(''); // รีเซ็ตวันที่ใหม่
    setIsModalVisible(false); // ปิด Modal
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
            yAxisLabel=""
            yAxisSuffix="kg"
            yAxisInterval={1} // optional, defaults to 1
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
              // marginVertical: 8,
              borderRadius: 6,
            }}
          />
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
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputWeigh}
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder="น้ำหนัก (kg)"
                keyboardType="numeric"
              />
            </View>
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
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  weightgraphHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: '#F6A444',
    marginTop: 20,
  },
  graphTitle: {
    color: "#FFF",
    fontSize: 20,
    top: "32%",
    // textAlign: "center",
    left: 30,
    fontFamily: "appfont_01",
  },
  graphContainer: {
    backgroundColor: '#FFECB3',
    padding: 10,
  },
  graphHeader: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 10,
    position: "absolute",
    top: "32%",
    right: 20,
    paddingHorizontal: 20,
  },
  graphsaveButtonText: {
    color: '#F6A444',
    fontSize: 16,
    fontFamily: 'appfont_02',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  inputWeigh: {
    height: 40,
    width: "100%",
    borderColor: '#dcdcdc',
    borderWidth: 1,
    marginRight: 10,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: '#FFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'appfont_01',
  },
  modalButton: {
    backgroundColor: '#F6A444',
    padding: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#FFF',
    fontFamily: 'appfont_02',
  },
  modalbackButton:{
    flexDirection: "row",
    justifyContent: 'space-evenly',
  },
  backButton: {
    backgroundColor: '#F6A444',
    padding: 10,
    paddingHorizontal: 25,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: '#FFF',
    fontFamily: 'appfont_02',
  },
});

export default WeightRecords;
