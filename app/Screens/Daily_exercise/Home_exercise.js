import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../BottomBar';
import { useNavigation } from '@react-navigation/native';
import exercise from '../../../assets/image/exercise.png';
import axios from 'axios';

const Homeexercise = () => {
  const navigation = useNavigation();
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    const fetchWeeks = async () => {
      try {
        const response = await axios.get('http://192.168.1.182:1337/api/weeks?populate=*');
        console.log('API Response:', response.data);  // Add this to check the response structure
        setWeeks(response.data.data); // Assuming data is an array of weeks
      } catch (error) {
        console.error('Error fetching weeks:', error);
      }
    };

    fetchWeeks();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ออกกำลังกาย</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('ExerciseScreen')}>
          <Text style={styles.tabButtonText}>ภารกิจรายวัน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton1} onPress={() => navigation.navigate('Addexercises')}>
          <Text style={styles.tabButtonText1}>ภารกิจเสริม</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.weekContainer}>
        <Image source={exercise} style={styles.mainImage} />
        <Text style={styles.headertop}>ร่างกายทุกส่วน - Full body</Text>
        <Text style={styles.headertext}>เริ่มการออกกำลังกายในการทำรูปร่าง เพื่อเน้นกล้ามเนื้อ และสร้างร่างกายเป็นเวลา 4 สัปดาห์</Text>
        {weeks && weeks.length > 0 ? (
          weeks.map((week) => (
            <View key={week.id} style={styles.weekBox}>
              <View style={styles.weekHeader}>
                <View style={styles.weekIcon}>
                  <Icon
                    name={week.attributes.days.data.some(day => day.attributes.completed === true) ? 'check-circle' : 'lightning-bolt'}
                    size={25}
                    color="#F6A444"
                  />
                </View>

                <Text style={styles.weekText}>Set {week.attributes ? week.attributes.name : 'N/A'}</Text>
                <Text style={styles.weekProgress}>
                  {week.attributes && week.attributes.days.data ?
                    `${week.attributes.days.data.filter(day => day.attributes.completed === true).length}/7` : '0/7'}
                </Text>
              </View>

              {/* Days Row */}
              <View style={styles.daysRow}>
                {week.attributes.days && week.attributes.days.data.length > 0 ? (
                  week.attributes.days.data.map((day, idx) => (  // Corrected: using `data` to access the array
                    <TouchableOpacity key={idx} style={styles.dayButton}
                    onPress={() => navigation.navigate('Dayexercise', { dayNumber: day.attributes.dayNumber, weekId: week.id ,set:week.attributes.name})} >
                      <View style={day.attributes.completed ? styles.dayBoxCompleted : styles.dayBoxPending}>
                        <Text style={day.attributes.completed ? styles.dayTextCompleted : styles.dayTextPending}>
                          {day.attributes.dayNumber}  {/* Corrected to access `dayNumber` */}
                        </Text>
                      </View>
                      {day.attributes.dayNumber == 7 && (
                        <Icon name="chevron-right" size={30} color="#F6A444" style={styles.arrowIcon} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text>No days available</Text>
                )}
                <Icon
            name="trophy"
            size={30}
            color={
              week.attributes.days.data.every(day => day.attributes.completed === true)
                ? "#FFD700" // สีเหลืองทองสำหรับถ้วยรางวัล
                : "#C0C0C0" // สีเทาสำหรับถ้วยรางวัลปกติ
            }
            style={styles.trophyIcon}
          />
              </View>
            </View>
          ))
        ) : (
          <Text>Loading weeks data...</Text>
        )}
      </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tabButton: {
    padding: 7,
    height: 40,
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F6A444',
  },
  tabButtonText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'appfont_01',
  },
  tabButtonText1: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'appfont_01',
  },
  tabButton1: {
    padding: 7,
    height: 40,
    width: 150,
    backgroundColor: '#F6A444',
    borderRadius: 20,
  },
  headertop: {
    color: '#000',
    fontSize: 16,
    textAlign: 'left',
    fontFamily: 'appfont_01',
  },
  headertext: {
    color: '#000',
    fontSize: 14,
    textAlign: 'left',
    fontFamily: 'appfont_01',
    marginVertical: 8,
    marginLeft: 5,
    marginRight: 5,
  },
  mainImage: {
    width: '100%',
    height: 170,
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 20,
  },
  weekContainer: {
    paddingHorizontal: 20,
  },
  weekBox: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekIcon: {
    marginRight: 10,
  },
  weekText: {
    fontSize: 16,
    fontFamily: 'appfont_02',
    flex: 1,
  },
  weekProgress: {
    fontSize: 17,
    color: '#F6A444',
    fontFamily: 'appfont_01',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'center',
  },
  dayBoxCompleted: {
    width: 35,
    height: 35,
    backgroundColor: '#F6A444',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5
  },
  dayBoxPending: {
    width: 35,
    height: 35,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5
  },
  dayTextCompleted: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'appfont_01',
  },
  dayTextPending: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'appfont_01',
  },
  arrowIcon: {
    alignSelf: 'center',
  },
  trophyIcon: {
    alignSelf: 'center',
    marginTop: 5,
  },
});

export default Homeexercise;
