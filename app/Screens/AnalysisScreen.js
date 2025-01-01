import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from './BottomBar';

const AnalysisScreen = () => {
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkoutRecords = async () => {
      try {
        const response = await axios.get(
          'http://192.168.1.145:1337/api/users/63?populate=workout_records,workout_records.exercise_level,workout_records.exercise_level.image,workout_records.add_course,workout_records.week,workout_records.day,workout_records.add_course.image,workout_records.add_course.all_exercises,workout_records.day.all_exercises,workout_records.exercise_level.all_exercises,workout_records.day.image'
        );

        const workoutRecords = response.data?.workout_records || [];
        const updatedDates = {};

        // Group records by week
        const groupByWeek = (records) => {
          const weeks = {};
          records.forEach((record) => {
            const date = new Date(record.timestamp);
            const dayOfWeek = date.getDay(); // Sunday = 0
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - dayOfWeek); // Move to Sunday
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            const weekKey = `${startOfWeek.toLocaleDateString('th-TH')} - ${endOfWeek.toLocaleDateString('th-TH')}`;

            if (!weeks[weekKey]) {
              weeks[weekKey] = { weekRange: weekKey, records: [] };
            }
            weeks[weekKey].records.push(record);

            // Mark dates on calendar
            const formattedDate = date.toISOString().split('T')[0];
            updatedDates[formattedDate] = {
              selected: true,
              marked: true,
              selectedColor: '#F6A444',
            };
          });

          return Object.values(weeks);
        };

        const groupedData = groupByWeek(workoutRecords);

        // Format data for summary
        const formatSummary = (groupedData) =>
          groupedData.map((group) => ({
            weekRange: group.weekRange,
            totalItems: group.records.length,
            records: group.records.map((record) => {
              const date = new Date(record.timestamp).toLocaleDateString('th-TH');
              const courseName =
                record.add_course?.name ||
                record.exercise_level?.name ||
                `ออกกำลังกายประจำวันที่ ${date}`;

              let totalDuration = 0;

              const allExercises = [
                ...(record.add_course?.all_exercises || []),
                ...(record.exercise_level?.all_exercises || []),
                ...(record.day?.all_exercises || []),
              ];

              allExercises.forEach((exercise) => {
                if (exercise.reps) {
                  totalDuration += exercise.reps * 2; // สมมติ 30 วินาทีต่อครั้ง
                } else if (exercise.duration) {
                  totalDuration += Math.floor(exercise.duration * 60); // แปลงนาทีเป็นวินาที
                }
              });

              const exercises = allExercises.length;
              const imageUrl =
                record.add_course?.image?.[0]?.url ||
                record.exercise_level?.image?.[0]?.url ||
                record.day?.image?.[0]?.url ||
                null;

              return {
                id: record.id,
                date,
                title: courseName,
                duration: `${Math.floor(totalDuration / 60)} นาที`,
                exercises: `${exercises} ท่า`,
                imageUrl,
              };
            }),
          }));

        setWeeklySummary(formatSummary(groupedData));
        setMarkedDates(updatedDates);
      } catch (error) {
        console.error('Error fetching workout records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutRecords();
  }, []);

  const renderRecord = ({ item }) => (
    <View style={styles.summaryItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.summaryImage} />
      <View style={styles.summaryDetails}>
        <Text style={styles.summaryTitle}>{`${item.date} - ${item.title}`}</Text>
        <View style={styles.summaryStats}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <Icon name="clock" size={20} color="#F6A444" style={{ marginRight: 10 }} />
            <Text style={styles.statText}>{item.duration}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon name="dumbbell" size={20} color="#F6A444" style={{ marginRight: 10 }} />
            <Text style={styles.statText}>{item.exercises}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderWeek = ({ item }) => (
    <View>
      <Text style={styles.weekTitle}>{`วันที่ ${item.weekRange} - ${item.totalItems} รายการ`}</Text>
      <FlatList
        data={item.records}
        renderItem={renderRecord}
        keyExtractor={(record) => record.id}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F6A444" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ปฏิทินการออกกำลังกาย</Text>
      </View>
      <View>
        <Calendar
          current={new Date().toISOString().split('T')[0]}
          markedDates={markedDates}
          onDayPress={(day) => console.log('Selected day:', day.dateString)}
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
            indicatorColor: '#F6A444',
          }}
        />
      </View>

      <Text style={styles.sectionTitle}>สรุปรายสัปดาห์</Text>
      <FlatList
        data={weeklySummary}
        renderItem={renderWeek}
        keyExtractor={(item) => item.weekRange}
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
    backgroundColor: '#F6A444',
    padding: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'appfont_01',
  },
  scrollContainer: {
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'appfont_01',
    marginBottom: 10,
    marginLeft: 15
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
    width: 100,
    height: 70,
    borderRadius: 8,
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
  statText: {
    fontSize: 14,
    fontFamily: 'appfont_01',
    color: '#000',
    marginTop: 5,
    marginEnd: 30,
    marginRight: 30,
  }
});

export default AnalysisScreen;
