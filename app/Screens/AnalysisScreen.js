import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, ScrollView } from 'react-native';
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
          <Text style={styles.graphTitle}>กราฟน้ำหนัก</Text>
          <LineChart
            data={{
              labels: ['3', '5', '7', '9', '11'],
              datasets: [
                {
                  data: [55, 56, 57, 58, 59],
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
          <View style={styles.graphFooter}>
            <Text>ปัจจุบันน้ำหนัก 58</Text>
            <View>
              <Text>หนักที่สุด : 59</Text>
              <Text>เบาที่สุด : 55</Text>
            </View>
          </View>
        </View>
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
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    marginTop: 20,
  },
  graphTitle: {
    fontSize: 16,
    fontFamily: 'appfont_01',
    marginBottom: 10,
  },
  graphFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default AnalysisScreen;
