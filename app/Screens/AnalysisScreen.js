import React, { useState, useEffect } from "react";
import { Image } from "expo-image";
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, ScrollView, } from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import BottomBar from "./BottomBar";
import WeightRecords from "./WeightRecords.js";
import BmiRecords from "./BmiRecords.js";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnalysisScreen = () => {
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  });

  useEffect(() => {
    setCurrentPage(1);
    const fetchWorkoutRecords = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        console.log("userId", userId);
        const response = await axios.get(
          `http://172.30.81.227:1337/api/users/${userId}?populate=workout_records,workout_records.exercise_level,workout_records.exercise_level.image,workout_records.add_course,workout_records.week,workout_records.day,workout_records.add_course.image,workout_records.add_course.all_exercises,workout_records.day.all_exercises,workout_records.exercise_level.all_exercises,workout_records.day.image`
        );

        const workoutRecords = response.data?.workout_records || [];
        const updatedDates = {};

        const groupByWeek = (records) => {
          const weeks = {};
          records.forEach((record) => {
            const date = new Date(record.timestamp);
            const dayOfWeek = date.getDay();
            const startOfWeek = new Date(date);
            startOfWeek.setDate(date.getDate() - dayOfWeek);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            const weekKey = `${startOfWeek.toLocaleDateString(
              "th-TH"
            )} - ${endOfWeek.toLocaleDateString("th-TH")}`;

            if (!weeks[weekKey]) {
              weeks[weekKey] = { weekRange: weekKey, records: [] };
            }
            weeks[weekKey].records.push(record);

            const formattedDate = date.toISOString().split("T")[0];
            updatedDates[formattedDate] = {
              selected: true,
              marked: true,
              selectedColor: "#F6A444",
            };
          });

          return Object.values(weeks);
        };

        const groupedData = groupByWeek(workoutRecords);

        const formatSummary = (groupedData) => {
          const parseThaiDate = (dateString) => {
            const [day, month, year] = dateString.split("/");
            return new Date(`${year}-${month}-${day}`);
          };

          const selectedEndOfWeek = new Date(selectedWeek);
          selectedEndOfWeek.setDate(selectedWeek.getDate() + 6);

          const selectedWeekRange = `${selectedWeek.toLocaleDateString(
            "th-TH"
          )} - ${selectedEndOfWeek.toLocaleDateString("th-TH")}`;

          const currentWeekData = groupedData.filter((group) => {
            const weekStartDate = parseThaiDate(
              group.weekRange.split(" - ")[0]
            );
            return (
              weekStartDate >= selectedWeek &&
              weekStartDate <= selectedEndOfWeek
            );
          });

          if (currentWeekData.length === 0) {
            return [
              {
                weekRange: selectedWeekRange,
                totalItems: 0,
                records: [],
              },
            ];
          }

          return currentWeekData.map((group) => ({
            weekRange: group.weekRange,
            totalItems: group.records.length,
            records: group.records
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              .map((record) => {
                const date = new Date(record.timestamp).toLocaleDateString(
                  "th-TH"
                );
                const weekday = record.week?.name;
                const day = record.day?.dayNumber;
                const courseName =
                  record.add_course?.name ||
                  record.exercise_level?.name ||
                  `ออกกำลังกาย${weekday} ครั้งที่ ${day}`;

                let totalDurationInSeconds = 0;

                const allExercises = [
                  ...(record.add_course?.all_exercises || []),
                  ...(record.exercise_level?.all_exercises || []),
                  ...(record.day?.all_exercises || []),
                ];

                allExercises.forEach((exercise) => {
                  if (exercise.reps) {
                    totalDurationInSeconds += exercise.reps * 2;
                  } else if (exercise.duration) {
                    totalDurationInSeconds += Math.floor(
                      exercise.duration * 60
                    );
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
                  duration: totalDurationInSeconds,
                  exercises: `${exercises} ท่า`,
                  imageUrl,
                };
              }),
          }));
        };

        setWeeklySummary(formatSummary(groupedData));
        setMarkedDates(updatedDates);
      } catch (error) {
        console.error("Error fetching workout records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutRecords();
  }, [selectedWeek]);

  const handlePrevWeek = () => {
    setSelectedWeek((prevWeek) => {
      const newWeek = new Date(prevWeek);
      newWeek.setDate(prevWeek.getDate() - 7);
      return newWeek;
    });
  };

  const handleNextWeek = () => {
    setSelectedWeek((prevWeek) => {
      const newWeek = new Date(prevWeek);
      newWeek.setDate(prevWeek.getDate() + 7);
      return newWeek;
    });
  };

  const handleDayPress = (day) => {
    const selectedDate = new Date(day.dateString);
    const dayOfWeek = selectedDate.getDay();
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    setSelectedWeek(startOfWeek);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const getPaginatedRecords = () => {
    const records = weeklySummary[0]?.records || [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return records.slice(startIndex, endIndex);
  };

  const handleNextPage = () => {
    if (
      currentPage <
      Math.ceil((weeklySummary[0]?.records?.length || 0) / itemsPerPage)
    ) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const renderRecord = ({ item }) => {
    const totalDurationInSeconds = item.duration || 0;
    const minutes = Math.floor(totalDurationInSeconds / 60);
    const seconds = totalDurationInSeconds % 60;
    return (
      <View style={styles.summaryItem}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.summaryImage} />
        )}
        <View style={styles.summaryDetails}>
          <Text
            style={styles.summaryTitle}
          >{`${item.date} - ${item.title}`}</Text>
          <View style={styles.summaryStats}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 5,
              }}
            >
              <Icon
                name="clock"
                size={20}
                color="#F6A444"
                style={{ marginRight: 10 }}
              />
              <Text
                style={styles.statText}
              >{`${minutes} นาที ${seconds} วินาที`}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon
                name="dumbbell"
                size={20}
                color="#F6A444"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.statText}>{item.exercises}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            {/* Scrollable Content */}
            {/* <ScrollView style={styles.scrollContent}> */}
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>ปฏิทินการออกกำลังกาย</Text>
            </View>

            {/* Calendar */}
            <Calendar
              current={new Date().toISOString().split("T")[0]}
              markedDates={markedDates}
              onDayPress={handleDayPress}
              theme={{
                calendarBackground: "#ffffff",
                textSectionTitleColor: "#b6c1cd",
                selectedDayBackgroundColor: "#F6A444",
                selectedDayTextColor: "#ffffff",
                todayTextColor: "#F6A444",
                dayTextColor: "#2d4150",
                textDisabledColor: "#d9e1e8",
                arrowColor: "#F6A444",
                monthTextColor: "#F6A444",
                indicatorColor: "#F6A444",
              }}
            />

            {/* Weekly Summary Header */}
            <View style={styles.weekHeader}>
              <TouchableOpacity
                onPress={handlePrevWeek}
                style={styles.weekButton}
              >
                <Icon name="chevron-left" size={30} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.weekInfo}>
                <Text style={styles.data}>
                  {`วันที่ ${weeklySummary[0]?.weekRange || ""}`}
                </Text>
                <Text style={styles.list}>
                  {`${weeklySummary[0]?.totalItems || 0} รายการ`}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleNextWeek}
                style={styles.weekButton}
              >
                <Icon name="chevron-right" size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        }
        data={getPaginatedRecords()}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        ListFooterComponent={
          <View>
            <View style={styles.paginationContainer}>
              {/* Pagination */}
              <TouchableOpacity
                onPress={handlePrevPage}
                disabled={currentPage === 1}
                style={[
                  styles.pageButton,
                  currentPage === 1 && styles.disabledButton,
                ]}
              >
                <Icon name="chevron-left" size={20} color="#FFF" />
              </TouchableOpacity>

              <Text style={styles.pageInfo}>
                หน้าที่{" "}
                {weeklySummary[0]?.records?.length > 0 ? currentPage : 0} /{" "}
                {weeklySummary[0]?.records?.length > 0
                  ? Math.ceil(weeklySummary[0]?.records?.length / itemsPerPage)
                  : 0}
              </Text>

              <TouchableOpacity
                onPress={handleNextPage}
                disabled={
                  currentPage >=
                  (weeklySummary[0]?.records?.length > 0
                    ? Math.ceil(
                        weeklySummary[0]?.records?.length / itemsPerPage
                      )
                    : 0)
                }
                style={[
                  styles.pageButton,
                  currentPage >=
                    (weeklySummary[0]?.records?.length > 0
                      ? Math.ceil(
                          weeklySummary[0]?.records?.length / itemsPerPage
                        )
                      : 0) && styles.disabledButton,
                ]}
              >
                <Icon name="chevron-right" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View>
              <WeightRecords />
              <BmiRecords />
            </View>
          </View>
        }
      />
      <BottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    backgroundColor: "#F6A444",
    padding: 20,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    textAlign: "center",
    fontFamily: "appfont_01",
  },
  weekHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F6A444",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginTop: 10,
  },
  weekButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  weekInfo: {
    flex: 1,
    alignItems: "center",
  },
  data: {
    fontSize: 16,
    fontFamily: "appfont_01",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  list: {
    fontSize: 14,
    fontFamily: "appfont_01",
    color: "#FFFFFF",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  pageButton: {
    padding: 10,
    backgroundColor: "#F6A444",
    borderRadius: 5,
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: "#C0C0C0",
  },
  pageInfo: {
    fontSize: 16,
    color: "#000",
    fontFamily: "appfont_01",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F8F8F8",
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
    fontSize: 15,
    fontFamily: "appfont_01",
    marginBottom: 5,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statText: {
    fontSize: 14,
    fontFamily: "appfont_01",
    color: "#000",
    marginRight: 30,
  },
});

export default AnalysisScreen;
