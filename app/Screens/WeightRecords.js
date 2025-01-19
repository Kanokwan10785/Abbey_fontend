import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';

const WeightRecords = () => {
  const navigation = useNavigation();

  const [weight, setWeight] = useState(58); // น้ำหนัก (กิโลกรัม)
  const [heightCm, setHeightCm] = useState(167); // ส่วนสูง (เซนติเมตร)
  const [bmi, setBmi] = useState(0);
  const [bmiStatus, setBmiStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [weightData, setWeightData] = useState([55, 56, 57, 58, 59]); // ค่าน้ำหนักในกราฟ
  const [dateLabels, setDateLabels] = useState(['3/01/68', '5', '7', '9', '11','12']); // ค่าวันที่ในกราฟ
  const [newWeight, setNewWeight] = useState(''); // น้ำหนักใหม่ที่จะใส่
  const [newDate, setNewDate] = useState(''); // วันที่ใหม่ที่จะใส่
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSaveData = () => {
    const weightValue = parseFloat(newWeight);
    const dateValue = newDate;

    if (!isNaN(weightValue) && weightValue > 0 ) {
      setWeightData([...weightData, weightValue]);
      setWeight(weightValue); // อัปเดตน้ำหนักล่าสุด
      setNewWeight(''); // รีเซ็ตค่าอินพุตหลังจากเพิ่มข้อมูลแล้ว
      setNewDate('');
      setIsModalVisible(false); // ปิดป๊อปอัปหลังจากบันทึกข้อมูล
    } else {
      alert('กรุณาใส่น้ำหนักและวันที่ที่ถูกต้อง');
    }
  };

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

  const handleCancel = () => {
    setNewWeight(""); // รีเซ็ตน้ำหนักใหม่
    setNewDate(""); // รีเซ็ตวันที่ใหม่
    setIsModalVisible(false); // ปิด Modal
  };
  const handlebmiCancel = () => {
    setWeight("56"); // คืนค่าน้ำหนักเดิม (คุณสามารถปรับเป็นค่าดั้งเดิมที่เหมาะสม)
    setHeightCm("176"); // คืนค่าส่วนสูงเดิม (ปรับค่าตามความเหมาะสม)
    setIsEditing(false); // ปิดโหมดการแก้ไข
  };
 
  const handleSave = () => {
    const weightValue = parseFloat(weight);
    const heightCmValue = parseFloat(heightCm);

    if (!isNaN(weightValue) && !isNaN(heightCmValue)) {
      setWeight(weightValue);
      setHeightCm(heightCmValue);
      setIsEditing(false);
      const height = heightCmValue / 100; // แปลงส่วนสูงจากเซนติเมตรเป็นเมตร
      const bmiValue = (weightValue / (height * height)).toFixed(2);
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

        <View style={styles.bmiHeader}>
          <Text style={styles.bmiLabel}>ค่าดัชนีมวลกาย</Text>
          <View style={styles.buttonHeader}>
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>แก้ไข</Text>
          </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bmiContainer}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.inputHeightCm}
                value={heightCm.toString()}
                onChangeText={text => setHeightCm(text)}
                placeholder="ส่วนสูง (cm)"
                keyboardType="numeric"
              />
              <View style={styles.buttonGroup}>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>บันทึก</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlebmiCancel} style={styles.editButton}>
                <Text style={styles.saveButtonText}>ยกเลิก</Text>
              </TouchableOpacity>            
            </View>
            </View>
          ) : (
            <View style={styles.bmiValueContainer}>
              <Text style={styles.bmiValue}>{bmi}</Text>
              <Text style={styles.bmiStatus}>{bmiStatus}</Text>
            </View>
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
  inputHeightCm: {
    height: 40,
    width: "50%",
    borderColor: '#dcdcdc',
    borderWidth: 1,
    marginRight: 10,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: '#FFF',
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
  bmiContainer: {
    backgroundColor: '#FFECB3',
    padding: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
  },
  bmiHeader:{
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: '#F6A444',
    height: 75 
  },
  bmiLabel: {
    color: "#FFF",
    fontSize: 20,
    top: "32%",
    // textAlign: "center",
    left: 30,
    fontFamily: "appfont_01",
  },
  buttonHeader: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 10,
    position: "absolute",
    top: "32%",
    right: 20,
    paddingHorizontal: 20,
  },
  bmiValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 18,
    fontFamily: 'appfont_01',
    backgroundColor: '#FFF',
    padding: 5,
    borderRadius: 5,
  },
  bmiStatus: {
    fontSize: 16,
    fontFamily: 'appfont_01',
    marginLeft: 10,
  },
  editButtonText: {
    color: '#F6A444',
    fontSize: 16,
    fontFamily: 'appfont_02',
  },
  editContainer: {
    flexDirection: "row",
    justifyContent: 'space-evenly'
  },
  buttonGroup: {
    flexDirection: "row",
    // justifyContent: 'space-evenly',
  },
  saveButton: {
    backgroundColor: '#F6A444',
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#F6A444',
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    right: -10,
  },
  saveButtonText: {
    color: '#FFF',
    fontFamily: 'appfont_01',
  },
});

export default WeightRecords;
