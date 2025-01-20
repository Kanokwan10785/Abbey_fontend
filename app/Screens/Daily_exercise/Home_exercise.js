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
  const [userId, setUserId] = useState(null);
  const [isUserIdLoaded, setIsUserIdLoaded] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!storedUserId) {
          console.error('User ID not found in AsyncStorage.');
          setIsUserIdLoaded(true); // แม้ไม่มี userId ก็ถือว่าโหลดเสร็จ
          return;
        }
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error fetching userId:', error);
      } finally {
        setIsUserIdLoaded(true); // ตั้งค่าเป็นโหลดเสร็จเมื่อเสร็จสิ้น
      }
    };
  
    fetchUserId();
  }, []);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        console.error('User ID is not available yet.');
        return;
      }
  
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
  
    if (isFocused && isUserIdLoaded && userId) {
      fetchData();
    }
  }, [isFocused, isUserIdLoaded, userId]);
  

  const fetchWeeks = async () => {
    try {
      console.log('Fetching weeks...');
      const response = await axios.get('http://192.168.1.200:1337/api/weeks?populate=*');

      // ดึง startDate ของ Week 1, Day 1
      const week1StartDate = await fetchStartDateFromHistory(1, 1);

      if (!week1StartDate) {
        console.warn('Unable to fetch startDate for Week 1, Day 1. Setting startDate as today.');
        week1StartDate = new Date(); // กำหนด fallback startDate เป็นวันนี้
      }

      const sortedWeeks = await Promise.all(
        response.data.data.map(async (week, index) => {
          const startDate = await fetchStartDateFromHistory(week.id, 1) ||
            new Date(week1StartDate.getTime() + index * 7 * 24 * 60 * 60 * 1000); // fallback

          const daysWithDates = week.attributes.days.data.map((day) => {
            const dayDate = new Date(startDate);
            dayDate.setDate(dayDate.getDate() + (day.attributes.dayNumber - 1)); // คำนวณวันที่
            return {
              ...day,
              attributes: {
                ...day.attributes,
                date: dayDate,
              },
            };
          });

          return {
            ...week,
            attributes: {
              ...week.attributes,
              startDate,
              days: { data: daysWithDates },
            },
          };
        })
      );

      setWeeks(sortedWeeks.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
  };



  const fetchStartDateFromHistory = async (week, day) => {
    try {
      if (!userId) {
        console.error('User ID is not set. Cannot fetch history.');
        return new Date(); // กรณีไม่มี userId ให้ถือว่าวันนี้เป็นวันเริ่มต้น
      }

      const token = await AsyncStorage.getItem('jwt');
      const response = await axios.get(
        `http://192.168.1.200:1337/api/workout-records?filters[users_permissions_user][id][$eq]=${userId}&filters[week][id][$eq]=${week}&filters[day][dayNumber][$eq]=${day}&populate=day,week`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const matchingRecords = response.data.data.filter(
        (record) =>
          record.attributes.week?.data?.id === week &&
          record.attributes.day?.data?.attributes?.dayNumber === day
      );

      if (matchingRecords.length > 0 && matchingRecords[0].attributes.timestamp) {
        console.log('Fetched start date:', matchingRecords[0].attributes.timestamp);
        return new Date(matchingRecords[0].attributes.timestamp);
      } else {
        console.warn(`No valid record found for Week ${week}, Day ${day}. Setting startDate as today.`);
        return new Date(); // กำหนดวันที่เริ่มต้นเป็นวันนี้
      }
    } catch (error) {
      console.error(`Error fetching start date for Week ${week}, Day ${day}:`, error);
      return new Date(); // หากเกิดข้อผิดพลาด กำหนดวันที่เริ่มต้นเป็นวันนี้
    }
  };

  const fetchWorkoutRecords = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const response = await axios.get(
        `http://192.168.1.200:1337/api/workout-records?filters[users_permissions_user]=${userId}&populate=*`,
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

  const isDayCompleted = (weekId, dayNumber, startDate) => {
    // ตรวจสอบสถานะจาก workoutRecords
    const record = workoutRecords.find((record) => {
      const recordWeekId = record.attributes.week?.data?.id;
      const recordDayNumber = record.attributes.day?.data?.attributes?.dayNumber;

      return recordWeekId === weekId && recordDayNumber === dayNumber;
    });

    return record?.attributes.status === true; // ถ้าสำเร็จ จะ return true ทันที
  };



  const isDayMissed = (weekId, dayNumber, startDate) => {
    // ถ้าวันนั้นสำเร็จแล้ว ไม่ถือว่าพลาด
    if (isDayCompleted(weekId, dayNumber, startDate)) {
      return false;
    }

    if (!startDate || isNaN(new Date(startDate))) {
      // หากไม่มี startDate ให้ถือว่าไม่พลาด
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // รีเซ็ตเวลาเพื่อเปรียบเทียบเฉพาะวันที่
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + (dayNumber - 1));
    dayDate.setHours(0, 0, 0, 0); // รีเซ็ตเวลาเพื่อเปรียบเทียบเฉพาะวันที่

    if (dayDate >= today) {
      // หากวันนั้นยังไม่ถึง หรือเป็นวันนี้ ไม่ถือว่าพลาด
      return false;
    }

    // หากวันนั้นผ่านไปแล้ว ตรวจสอบว่ามีการทำกิจกรรมในวันนั้นหรือไม่
    const record = workoutRecords.find((record) => {
      const recordWeekId = record.attributes.week?.data?.id;
      const recordDayNumber = record.attributes.day?.data?.attributes?.dayNumber;

      return recordWeekId === weekId && recordDayNumber === dayNumber;
    });

    return !record?.attributes.status; // พลาดหากยังไม่มีการทำสำเร็จ
  };


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
                {week.attributes.days.data.map((day, idx) => {
                  if (!day.attributes.dayNumber) {
                    console.error(`Invalid dayNumber for Week ${week.id}, Day ${idx + 1}`);
                    return null; // ข้ามวันนั้นไป
                  }

                  const missed = isDayMissed(week.id, day.attributes.dayNumber, week.attributes.startDate);
                  const completed = isDayCompleted(week.id, day.attributes.dayNumber, week.attributes.startDate);


                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.dayButton}
                      onPress={() => {
                        const isMissed = missed;
                        console.log(`Navigating to Dayexercise: Week ${week.id}, Day ${day.attributes.dayNumber}, Missed: ${isMissed}`);
                        navigation.navigate('Dayexercise', {
                          dayNumber: day.attributes.dayNumber,
                          weekId: week.id,
                          set: week.attributes.name,
                          userId: userId,
                          isMissed,
                        });
                      }}
                    >
                      <View
                        style={
                          completed
                            ? { ...styles.dayBoxCompleted, backgroundColor: '#F6A444' }
                            : missed
                              ? { ...styles.dayBoxMissed, backgroundColor: 'red' }
                              : styles.dayBoxPending
                        }
                      >
                        <Text
                          style={
                            completed
                              ? styles.dayTextCompleted
                              : missed
                                ? styles.dayTextMissed
                                : styles.dayTextPending
                          }
                        >
                          {day.attributes.dayNumber}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );

                })}
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
  dayBoxMissed: {
    width: 35,
    height: 35,
    backgroundColor: 'red',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayTextMissed: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'appfont_01',
  },

});

export default Homeexercise;
