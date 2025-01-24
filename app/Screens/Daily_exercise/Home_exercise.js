import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import BottomBar from '../BottomBar';
import exercise from '../../../assets/image/exercise.png';
import { useMemo } from 'react'
import { Image } from 'expo-image';
import { API_BASE_URL } from './apiConfig.js';


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
          setIsUserIdLoaded(true);
          return;
        }
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error fetching userId:', error);
      } finally {
        setIsUserIdLoaded(true);
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
      const response = await axios.get(`${API_BASE_URL}/api/weeks?populate=*`);

      const week1StartDate = await fetchStartDateFromHistory(1, 1);
      if (!week1StartDate) {
        throw new Error('Start date for Week 1 is missing. Cannot calculate further weeks.');
      }

      const weeksData = response.data.data.sort((a, b) => a.id - b.id);
      const sortedWeeks = [];

      for (let index = 0; index < weeksData.length; index++) {
        const week = weeksData[index];
        let startDate;

        if (index === 0) {
          startDate = week1StartDate;
        } else {
          const previousWeek = sortedWeeks[index - 1];
          startDate = new Date(previousWeek.attributes.startDate);
          startDate.setDate(startDate.getDate() + 7);
        }

        const daysWithDates = week.attributes.days.data.map((day) => {
          const dayDate = new Date(startDate);
          dayDate.setDate(dayDate.getDate() + (day.attributes.dayNumber - 1));
          return {
            ...day,
            attributes: {
              ...day.attributes,
              date: dayDate,
            },
          };
        });

        sortedWeeks.push({
          ...week,
          attributes: {
            ...week.attributes,
            startDate,
            days: { data: daysWithDates },
          },
        });
      }

      setWeeks(sortedWeeks);
    } catch (error) {
      console.error('Error fetching weeks:', error);
    }
  };

  const fetchStartDateFromHistory = async (week, day) => {
    try {
      if (!userId) {
        console.error('User ID is not set. Cannot fetch history.');
        return null;
      }

      const token = await AsyncStorage.getItem('jwt');
      const response = await axios.get(
        `${API_BASE_URL}/api/workout-records?filters[users_permissions_user][id][$eq]=${userId}&filters[week][id][$eq]=${week}&filters[day][dayNumber][$eq]=${day}&populate=day,week`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const matchingRecords = response.data.data.filter(
        (record) =>
          record.attributes.week?.data?.id === week &&
          record.attributes.day?.data?.attributes?.dayNumber === day
      );

      if (matchingRecords.length > 0) {
        const record = matchingRecords[0].attributes;

        // ใช้ resetTimestamp ถ้ามี, ถ้าไม่มีใช้ timestamp เดิม
        const startDate = record.resetTimestamp
          ? new Date(record.resetTimestamp)
          : new Date(record.timestamp);

        console.log('Fetched start date:', startDate);
        return startDate;
      } else {
        console.warn(`No valid record found for Week ${week}, Day ${day}.`);
        return new Date(); // fallback เป็นวันที่ปัจจุบัน
      }
    } catch (error) {
      console.error(`Error fetching start date for Week ${week}, Day ${day}:`, error);
      return new Date(); // fallback เป็นวันที่ปัจจุบัน
    }
  };

  const fetchWorkoutRecords = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const response = await axios.get(
        `${API_BASE_URL}/api/workout-records?filters[users_permissions_user]=${userId}&populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWorkoutRecords(response.data.data);
      // console.log('Fetched workout records:', response.data.data);
    } catch (error) {
      console.error('Error fetching workout records:', error);
    }
  };

  const dayStatuses = useMemo(() => {
    if (!workoutRecords || workoutRecords.length === 0) {
      console.warn('Workout records not loaded yet.');
      return {};
    }

    const statuses = {};

    weeks.forEach((week) => {
      week.attributes.days.data.forEach((day) => {
        const dayKey = `${week.id}-${day.attributes.dayNumber}`;

        // หา record ที่ status !== null
        const record = workoutRecords.find((record) => {
          const recordWeekId = record.attributes.week?.data?.id;
          const recordDayNumber = record.attributes.day?.data?.attributes?.dayNumber;
          return (
            recordWeekId === week.id &&
            recordDayNumber === day.attributes.dayNumber &&
            record.attributes.status !== null // ข้าม record ที่ status === null
          );
        });

        // ตรวจสอบ completed และ missed
        const completed = record?.attributes.status === true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayDate = new Date(day.attributes.date);
        const missed = !completed && dayDate < today;

        statuses[dayKey] = { completed, missed };

        // console.log(
        //   `Week: ${week.id}, Day: ${day.attributes.dayNumber}, dayDate: ${dayDate}, completed: ${completed}, missed: ${missed}`
        // );
      });
    });

    return statuses;
  }, [weeks, workoutRecords]);


  const resetToWeek1Day1 = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt');
      const response = await axios.get(
        `${API_BASE_URL}/api/workout-records?filters[users_permissions_user][id][$eq]=${userId}&populate=*`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const records = response.data.data;

      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);

      // อัปเดต resetTimestamp ใน Week 1 Day 1
      const week1Day1Record = records.find(
        (record) =>
          record.attributes.week?.data?.id === 1 &&
          record.attributes.day?.data?.attributes?.dayNumber === 1
      );

      if (week1Day1Record) {
        await axios.put(
          `${API_BASE_URL}/api/workout-records/${week1Day1Record.id}`,
          { data: { resetTimestamp: nextDate.toISOString() } },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log('Reset timestamp updated for Week 1 Day 1');
      }

      // รีเซ็ตสถานะทั้งหมด (อัปเดต status = false)
      for (const record of records) {
        await axios.put(
          `${API_BASE_URL}/api/workout-records/${record.id}`,
          { data: { status: null } },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      console.log('Workout records have been reset to Week 1 Day 1.');
    } catch (error) {
      console.error('Error resetting workout records:', error);
    }
  };

  useEffect(() => {
    const checkWeek4Day7Status = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        const response = await axios.get(
          `${API_BASE_URL}/api/workout-records?filters[users_permissions_user][id][$eq]=${userId}&populate=*`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const records = response.data.data;

        // ตรวจสอบสถานะของ Week 4 Day 7
        const week4Day7 = records.find(
          (record) =>
            record.attributes.week?.data?.id === 4 &&
            record.attributes.day?.data?.attributes?.dayNumber === 7 &&
            record.attributes.status === true // วันนั้นต้องทำสำเร็จ
        );

        if (week4Day7) {
          console.log('Week 4 Day 7 completed. Resetting to Week 1 Day 1...');
          await resetToWeek1Day1(); // เรียกฟังก์ชันรีเซ็ต
        }
      } catch (error) {
        console.error('Error checking Week 4 Day 7 status:', error);
      }
    };

    if (userId) {
      checkWeek4Day7Status();
    }
  }, [userId, isFocused]);


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
          weeks.map((week) => {
            // คำนวณ completedDaysCount สำหรับแต่ละ week
            const completedDaysCount = week.attributes.days.data.reduce((count, day) => {
              const dayKey = `${week.id}-${day.attributes.dayNumber}`;
              return dayStatuses[dayKey]?.completed ? count + 1 : count;
            }, 0);

            return (
              <View key={week.id} style={styles.weekBox}>
                <View style={styles.weekHeader}>
                  <View style={styles.weekIcon}>
                    <Icon
                      name={
                        week.attributes.days.data.some((day) => {
                          const dayKey = `${week.id}-${day.attributes.dayNumber}`;
                          return dayStatuses[dayKey]?.completed;
                        })
                          ? 'check-circle'
                          : 'lightning-bolt'
                      }
                      size={25}
                      color="#F6A444"
                    />
                  </View>
                  <Text style={styles.weekText}>{week.attributes.name || 'N/A'}</Text>
                  <Text style={styles.weekProgress}>{`${completedDaysCount}/7`}</Text>
                </View>

                <View style={styles.daysRow}>
                  {week.attributes.days.data.map((day, idx) => {
                    const dayKey = `${week.id}-${day.attributes.dayNumber}`;
                    const { completed, missed } = dayStatuses[dayKey] || { completed: false, missed: false };
                    {/* console.log('dayKey completed: missed',dayKey,completed,missed) */ }
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.dayButton}
                        onPress={() => {
                          const isMissed = missed;
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
                    color={completedDaysCount === week.attributes.days.data.length ? '#FFD700' : '#C0C0C0'}
                    style={styles.trophyIcon}
                  />
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.loadingContainer}>
            {/* <ActivityIndicator size="large" color="#F6A444" /> */}
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
