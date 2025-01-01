import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import BottomBar from '../BottomBar';
import exercise from '../../../assets/image/exercise.png';

const Homeexercise = () => {
  const navigation = useNavigation();
  const [weeks, setWeeks] = useState([]);
  const [workoutRecords, setWorkoutRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchWeeks();
        await fetchWorkoutRecords();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchData(); // Fetch data when screen is focused
    }
  }, [isFocused]);

  const fetchWeeks = async () => {
    try {
      const response = await axios.get('http://192.168.1.145:1337/api/weeks?populate=*');
      const sortedWeeks = response.data.data.sort((a, b) => a.id - b.id);

      setWeeks(sortedWeeks);
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
  };

  const fetchWorkoutRecords = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        return;
      }

      const token = await AsyncStorage.getItem('jwt');
      const response = await axios.get(
        `http://192.168.1.145:1337/api/workout-records?filters[users_permissions_user]=${userId}&populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWorkoutRecords(response.data.data);
    } catch (error) {
      console.error('Error fetching workout records:', error);
    }
  };

  const isDayCompleted = (weekId, dayNumber) => {
    const record = workoutRecords.find((record) => {
      const recordWeekId = record.attributes.week?.data?.id;
      const recordDayNumber = record.attributes.day?.data?.attributes?.dayNumber;

      return recordWeekId === weekId && recordDayNumber === dayNumber;
    });

    return record?.attributes.status === true;
  };

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#F6A444" />
  //       <Text>Loading...</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ออกกำลังกาย</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('Homeexercise')}>
          <Text style={styles.tabButtonText}>ภารกิจหลัก</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton1} onPress={() => navigation.navigate('Addexercises')}>
          <Text style={styles.tabButtonText1}>ภารกิจเสริม</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.weekContainer}>
        <Image source={exercise} style={styles.mainImage} />
        <Text style={styles.headertop}>ร่างกายทุกส่วน - Full body</Text>
        <Text style={styles.headertext}>
          เริ่มการออกกำลังกายในการทำรูปร่าง เพื่อเน้นกล้ามเนื้อ และสร้างร่างกายเป็นเวลา 4 สัปดาห์
        </Text>
        {weeks.length > 0 ? (
          weeks.map((week) => (
            <View key={week.id} style={styles.weekBox}>
              <View style={styles.weekHeader}>
                <View style={styles.weekIcon}>
                  <Icon
                    name={
                      week.attributes.days.data.some((day) => isDayCompleted(week.id, day.attributes.dayNumber))
                        ? 'check-circle'
                        : 'lightning-bolt'
                    }
                    size={25}
                    color="#F6A444"
                  />
                </View>

                <Text style={styles.weekText}>{week.attributes.name || 'N/A'}</Text>
                <Text style={styles.weekProgress}>
                  {`${week.attributes.days.data.filter((day) =>
                    isDayCompleted(week.id, day.attributes.dayNumber)
                  ).length}/7`}
                </Text>
              </View>

              <View style={styles.daysRow}>
                {week.attributes.days.data.map((day, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.dayButton}
                    onPress={() =>
                      navigation.navigate('Dayexercise', {
                        dayNumber: day.attributes.dayNumber,
                        weekId: week.id,
                        set: week.attributes.name,
                      })
                    }
                  >
                    <View
                      style={
                        isDayCompleted(week.id, day.attributes.dayNumber)
                          ? { ...styles.dayBoxCompleted, backgroundColor: '#F6A444' }
                          : styles.dayBoxPending
                      }
                    >
                      <Text
                        style={
                          isDayCompleted(week.id, day.attributes.dayNumber)
                            ? styles.dayTextCompleted
                            : styles.dayTextPending
                        }
                      >
                        {day.attributes.dayNumber}
                      </Text>
                    </View>
                    {day.attributes.dayNumber == 7 && (
                      <Icon name="chevron-right" size={30} color="#F6A444" style={styles.arrowIcon} />
                    )}
                  </TouchableOpacity>
                ))}
                <Icon
                  name="trophy"
                  size={30}
                  color={
                    week.attributes.days.data.filter((day) =>
                      isDayCompleted(week.id, day.attributes.dayNumber)
                    ).length === 7
                      ? '#FFD700'
                      : '#C0C0C0'
                  }
                  style={styles.trophyIcon}
                />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.loadingContainer}>
          </View>
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
  },
  dayBoxPending: {
    width: 35,
    height: 35,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 10,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Homeexercise;
