import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../BottomBar';
import exercise from '../../../assets/image/exercise.png';
import { useNavigation } from '@react-navigation/native';

const exercises = [
  { id: '1', name: 'ท่ากระโดดตบ', duration: '00:30 ว', reps: '' },
  { id: '2', name: 'ท่าปั่นขา', duration: '', reps: '12 ครั้ง' },
  { id: '3', name: 'ท่าแพลงก์', duration: '00:30 ว', reps: '' },
  { id: '4', name: 'ท่ายกขา', duration: '', reps: '12 ครั้ง' },
];

const ExerciseScreen = () => {
  const navigation = useNavigation();
  const renderItem = ({ item }) => (
    <View style={styles.exerciseItem}>
      <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.exerciseImage} />
      <View style={styles.exerciseDetails}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseInfo}>{item.duration || item.reps}</Text>
      </View>
      <TouchableOpacity 
      onPress={() => navigation.navigate('Description')}>
      <Icon name="menu" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ออกกำลังกาย</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton}><Text style={styles.tabButtonText}>ภารกิจรายวัน</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}><Text style={styles.tabButtonText}>ภารกิจเสริม</Text></TouchableOpacity>
      </View>
      <Image source={exercise} style={styles.mainImage} />
      <Text style={styles.dateText}>วันที่ 14 ม.ค - ร่างกายทุกส่วน</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="clock-outline" size={24} color="#000" />
          <Text style={styles.statText}>15 min</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="fire" size={24} color="#000" />
          <Text style={styles.statText}>160 cal</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="dumbbell" size={24} color="#000" />
          <Text style={styles.statText}>15 ท่า</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.startButton}><Text style={styles.startButtonText}>เริ่ม</Text></TouchableOpacity>
      <FlatList
        data={exercises}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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
    width: 120,
    backgroundColor: '#F6A444',
    borderRadius: 20,
  },
  tabButtonText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
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
    marginVertical: 10,
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
    width: 50,
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
});

export default ExerciseScreen;
