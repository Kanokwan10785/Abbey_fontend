import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../BottomBar';
import exercise from '../../../assets/image/exercise.png';
import previous from '../../../assets/image/previous.png';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { API_BASE_URL } from './apiConfig.js';

const Dayexercise = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { dayNumber, weekId, set , userId , isMissed,dayDate } = route.params || {}; // Extract dayNumber and weekId from route params

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockDate, setUnlockDate] = useState(null);

  useEffect(() => {
    if (dayNumber && weekId && set && userId) {
      fetchExercises(dayNumber, weekId, set, userId, isMissed);
      // console.log('Dayexercise:', { dayNumber, weekId, set, isMissed });
    } else if (!userId) {
      console.warn('User ID is not available yet.');
    } else {
      console.error('Missing dayNumber or weekId');
      setLoading(false);
    }
  }, [dayNumber, weekId, set, userId, isMissed,dayDate]);  
  

  // console.log('Dayexercise: Received params:', { dayNumber, weekId, set, isMissed ,dayDate});
  // console.log('Dayexercise: Received params:', { dayDate});

  const fetchStartDateFromHistory = async (week, day) => {
    try {

      const token = await AsyncStorage.getItem('jwt'); // ดึง token สำหรับการเชื่อมต่อ
      const response = await fetch(
        `${API_BASE_URL}/api/workout-records?filters[users_permissions_user][id][$eq]=${userId}&filters[week][id][$eq]=${week}&filters[day][dayNumber][$eq]=${day}&populate=day,week&pagination[limit]=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      // console.log('Fetched workout-records data:', data);
  
      // กรองเฉพาะประวัติที่ตรงกับ week และ day ที่ต้องการ
      const matchingRecords = data.data.filter(
        (record) =>
          record.attributes.week?.data?.id === week &&
          record.attributes.day?.data?.attributes?.dayNumber === day
      );
      // console.log('Matching records:', matchingRecords);
  
      if (matchingRecords.length > 0) {
        const record = matchingRecords[0].attributes;
        return record.resetTimestamp
          ? new Date(record.resetTimestamp)
          : new Date(record.timestamp);
      }
  
      console.warn(`No record found for Week ${week}, Day ${day}. Returning current date as fallback.`);
      return new Date();
       // ไม่มีข้อมูลในประวัติ
    } catch (error) {
      console.error('Error fetching workout history:', error);
      return new Date();
    }
  };
  
  const fetchExercises = async (day, week) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/days?filters[dayNumber][$eq]=${day}&filters[week][id][$eq]=${week}&populate=all_exercises,all_exercises.animation,all_exercises.muscle&pagination[limit]=100`
      );
      const data = await response.json();
  
      if (!data || !data.data || !data.data[0]?.attributes?.all_exercises?.data) {
        console.error("No data found for the specified day and week");
        setExercises([]);
        setLoading(false);
        return;
      }
  
      // ดึง startDate ของ Week 1 Day 1
      const week1StartDate = await fetchStartDateFromHistory(1, 1) || new Date(); // fallback เป็นวันนี้
      console.log('Week 1 Start Date:', week1StartDate);
  
      // กำหนดค่า baseStartDate
      const baseStartDate = new Date(week1StartDate);
      baseStartDate.setHours(0, 0, 0, 0);
      baseStartDate.setDate(baseStartDate.getDate() + (7 * (week - 1)) + (day - 1));
  
      // เปรียบเทียบกับวันที่ปัจจุบัน
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      if (today < baseStartDate) {
        setIsLocked(true);
        setUnlockDate(baseStartDate);
      } else {
        setIsLocked(false);
      }
  
      // ประมวลผลข้อมูล exercise
      let totalDuration = 0;
      const exerciseData = data.data[0].attributes.all_exercises.data.map((exercise) => {
        const animationUrl = exercise.attributes.animation?.data?.[0]?.attributes?.url || null;
        const imageData = exercise.attributes.muscle?.data?.[0]?.attributes?.formats?.thumbnail;
        const imageUrl = imageData ? imageData.url : null;
  
        let displayText = '';
        if (exercise.attributes.reps) {
          displayText = `${exercise.attributes.reps} ครั้ง`;
          totalDuration += 30;
        } else if (exercise.attributes.duration) {
          const durationInSeconds = Math.floor(exercise.attributes.duration * 60);
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = durationInSeconds % 60;
  
          displayText = minutes > 0
            ? seconds > 0
              ? `${minutes} นาที ${seconds} วินาที`
              : `${minutes} นาที`
            : `${seconds} วินาที`;
  
          totalDuration += durationInSeconds;
        }
  
        return {
          id: exercise.id.toString(),
          animation: animationUrl,
          image: imageUrl,
          name: exercise.attributes.name,
          duration: displayText,
          description: exercise.attributes.description?.[0]?.children?.[0]?.text || 'ไม่มีคำอธิบาย',
          dollar: exercise.attributes.dollar,
          trophy: data.data[0]?.attributes?.trophy || 0,
          exp: data.data[0]?.attributes?.exp || 0,
        };
      });
  
      setExercises(exerciseData);
      setTotalTime(totalDuration);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setLoading(false);
    }
  };
  

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#F6A444" />
      </View>
    );
  }

  const formattedUnlockDate = unlockDate
  ? unlockDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  : 'ไม่ทราบ';



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={previous} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
        <View style={styles.Title}>
          <Text style={styles.headerTitle}>{set} ออกกำลังกาย ครั้งที่ {dayNumber}</Text>
        </View>
      </View>
      <Image source={exercise} style={styles.mainImage} />
      <Text style={styles.dateText}>การออกกำลังกาย แบบ Full body</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="clock-outline" size={24} color="#F6A444" />
          <Text style={styles.statText}>
            {Math.floor(totalTime / 60)} นาที {totalTime % 60} วินาที
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="dumbbell" size={24} color="#F6A444" />
          <Text style={styles.statText}>{exercises.length} ท่า</Text>
        </View>
      </View>
      {isLocked ? (
        <View style={styles.lockButton}>
          <Text style={styles.startButtonText}>
          วันปลดล็อค: {formattedUnlockDate || 'ไม่ทราบ'}
        </Text>
        </View>
        
      ) : (
        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            navigation.navigate('Startex', { item: exercises[0], items: exercises, currentIndex: 0, isRest: false, dayNumber, weekId, set, isMissed,dayDate })
          }
        >
          <Text style={styles.startButtonText}>เริ่ม</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={exercises}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.exerciseItem}
            onPress={() => navigation.navigate('Description', { item, items: exercises })}
          >
            <Image source={{ uri: item.animation }} style={styles.exerciseImage} />
            <View style={styles.exerciseDetails}>
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.exerciseInfo}>{item.duration}</Text>
            </View>
            <Icon name="menu" size={24} color="#000" />
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        style={styles.exerciseList}
      />
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
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  Title: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'appfont_01',
  },
  mainImage: {
    width: '90%',
    height: 200,
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 20,
  },
  dateText: {
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'appfont_01',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    marginTop: 5,
    fontSize: 14,
    fontFamily: 'appfont_01',
  },
  startButton: {
    backgroundColor: '#F6A444',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'appfont_01',
  },
  lockButton: {
    backgroundColor: '#C0C0C0',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  exerciseList: {
    marginHorizontal: 10,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8F8F8',
    marginVertical: 5,
    borderRadius: 10,
  },
  exerciseImage: {
    width: 80,
    height: 50,
    borderRadius: 10,
  },
  exerciseDetails: {
    flex: 1,
    marginLeft: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'appfont_01',
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'appfont_01',
  },
  lockedText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#F00',
    fontFamily: 'appfont_01',
    marginBottom: 10,
  },
});

export default Dayexercise;
