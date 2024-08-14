import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions, ScrollView, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import BottomBar from './BottomBar';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-chart-kit';
import exerciseImg from '../../assets/image/exercise.png';

const weeklySummary = [
  {
    id: '1',
    date: '2024-01-30',
    title: 'ร่างกายทุกส่วน',
    duration: '15 min',
    calories: '160 cal',
    exercises: '15 ท่า',
    image: exerciseImg,
  },
  {
    id: '2',
    date: '2024-01-31',
    title: 'ร่างกายทุกส่วน',
    duration: '15 min',
    calories: '160 cal',
    exercises: '15 ท่า',
    image: exerciseImg,
  },
  {
    id: '3',
    date: '2024-01-31',
    title: 'ร่างกายทุกส่วน',
    duration: '15 min',
    calories: '160 cal',
    exercises: '15 ท่า',
    image: exerciseImg,
  },
  {
    id: '4',
    date: '2024-01-31',
    title: 'ร่างกายทุกส่วน',
    duration: '15 min',
    calories: '160 cal',
    exercises: '15 ท่า',
    image: exerciseImg,
  },
];

const AnalysisScreen = () => {
  const navigation = useNavigation();

  const [weight, setWeight] = useState(58); // น้ำหนัก (กิโลกรัม)
  const [heightCm, setHeightCm] = useState(167); // ส่วนสูง (เซนติเมตร)
  const [bmi, setBmi] = useState(0);
  const [bmiStatus, setBmiStatus] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [weightData, setWeightData] = useState([55, 56, 57, 58, 59]); // ค่าน้ำหนักในกราฟ
  const [dateLabels, setDateLabels] = useState(['3', '5', '7', '9', '11']); // ค่าวันที่ในกราฟ
  const [newWeight, setNewWeight] = useState(''); // น้ำหนักใหม่ที่จะใส่
  const [newDate, setNewDate] = useState(''); // วันที่ใหม่ที่จะใส่
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSaveData = () => {
    const weightValue = parseFloat(newWeight);
    const dateValue = newDate;

    if (!isNaN(weightValue) && weightValue > 0 && dateValue !== '') {
      setWeightData([...weightData, weightValue]);
      setDateLabels([...dateLabels, dateValue]);
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

  const handleSave = () => {
    const weightValue = parseFloat(weight);
    const heightCmValue = parseFloat(heightCm);

    if (!isNaN(weightValue) && !isNaN(heightCmValue)) {
      setWeight(weightValue);
      setHeightCm(heightCmValue);
      setIsEditing(false);
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

  const renderItem = ({ item }) => (
    <View style={styles.summaryItem}>
      <Image source={item.image} style={styles.summaryImage} />
      <View style={styles.summaryDetails}>
        <Text style={styles.summaryTitle}>{`วันที่ ${item.date} - ${item.title}`}</Text>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Icon name="clock-outline" size={16} color="#888" />
            <Text style={styles.statText}>{item.duration}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="fire" size={16} color="#888" />
            <Text style={styles.statText}>{item.calories}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="dumbbell" size={16} color="#888" />
            <Text style={styles.statText}>{item.exercises}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>รายงานผล</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.sectionTitle}>ประวัติการออกกำลังกาย</Text>
        <Calendar
          current={'2024-01-30'}
          markedDates={{
            '2024-01-30': { selected: true, marked: true, selectedColor: '#F6A444' },
            '2024-01-31': { selected: true, marked: true, selectedColor: '#F6A444' },
          }}
          onDayPress={(day) => {
            console.log('selected day', day);
          }}
          theme={{
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#F6A444',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#F6A444',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            arrowColor: '#F6A444',
            monthTextColor: '#F6A444',
          }}
        />
        <Text style={styles.sectionTitle}>สรุปรายสัปดาห์</Text>
        <FlatList
          data={weeklySummary}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.summaryList}
        />
        <View style={styles.graphContainer}>
          <View style={styles.graphHeader}>
            <Text style={styles.graphTitle}>กราฟน้ำหนัก</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Text style={styles.graphsaveButtonText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
          <LineChart
            data={{
              labels: dateLabels,
              datasets: [
                {
                  data: weightData,
                },
              ],
            }}
            width={Dimensions.get('window').width - 60} // from react-native
            height={220}
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
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        <View style={styles.bmiContainer}>
          <Text style={styles.bmiLabel}>ค่าดัชนีมวลกาย</Text>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.input}
                value={weight.toString()}
                onChangeText={text => setWeight(text)}
                placeholder="น้ำหนัก (kg)"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                value={heightCm.toString()}
                onChangeText={text => setHeightCm(text)}
                placeholder="ส่วนสูง (cm)"
                keyboardType="numeric"
              />
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.bmiValueContainer}>
              <Text style={styles.bmiValue}>{bmi}</Text>
              <Text style={styles.bmiStatus}>{bmiStatus}</Text>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Text style={styles.editButtonText}>แก้ไข</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal สำหรับการเพิ่มน้ำหนักและวันที่ */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>บันทึกน้ำหนักและวันที่</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder="น้ำหนัก (kg)"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                value={newDate}
                onChangeText={setNewDate}
                placeholder="วันที่ (dd-mm-yyyy)"
                keyboardType="default"
              />
            </View>
            <TouchableOpacity onPress={handleSaveData} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>บันทึก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#F6A444',
    padding: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'appfont_01',
  },
  scrollViewContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'appfont_01',
    marginBottom: 10,
  },
  summaryListContainer: {
    maxHeight: 150, // Adjust this height as needed
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8F8F8',
    marginVertical: 5,
    borderRadius: 10,
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  summaryDetails: {
    flex: 1,
    marginLeft: 10,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'appfont_01',
    marginBottom: 5,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryList: {
    marginHorizontal: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#888',
    fontFamily: 'appfont_01',
  },
  graphContainer: {
    backgroundColor: '#FFECB3',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    marginTop: 20,
  },
  graphHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  graphTitle: {
    fontSize: 16,
    fontFamily: 'appfont_01',
  },
  graphFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  graph: {
    fontSize: 14,
  },
  graphsaveButtonText: {
    color: '#fff',
    backgroundColor: '#F6A444',
    padding: 5,
    borderRadius: 5,
    fontFamily: 'appfont_01',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  input: {
    height: 40,
    borderColor: '#dcdcdc',
    borderWidth: 1,
    marginRight: 10,
    paddingLeft: 8,
    borderRadius: 5,
    flex: 1,
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
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: '#FFF',
    fontFamily: 'appfont_01',
  },
  bmiContainer: {
    backgroundColor: '#FFECB3',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    marginTop: 20,
  },
  bmiLabel: {
    fontSize: 16,
    fontFamily: 'appfont_01',
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
  editButton: {
    marginLeft: 10,
    backgroundColor: '#F6A444',
    padding: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#FFF',
    fontFamily: 'appfont_01',
  },
  editContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  saveButton: {
    backgroundColor: '#F6A444',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    fontFamily: 'appfont_01',
  },
  saveButtonText: {
    color: '#FFF',
    fontFamily: 'appfont_01',
  },
});

export default AnalysisScreen;
