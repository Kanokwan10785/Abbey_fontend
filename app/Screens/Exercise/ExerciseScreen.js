// ExerciseScreen.js

import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../BottomBar';
import exercise from '../../../assets/image/exercise.png';
import ex1 from '../../../assets/image/ex1.gif';
import ex2 from '../../../assets/image/ex2.gif';
import ex3 from '../../../assets/image/ex3.gif';
import ex4 from '../../../assets/image/ex4.gif';
import { useNavigation } from '@react-navigation/native';

const exercises = [
  { id: '1', image: ex1 ,name: 'ท่ากระโดดตบ', duration: '00:30 น', description: 'เริ่มจากอยู่ในท่ายืนเท้าชิด แขนแนบลำตัว จากนั้นกระโดดแยกขา และมือทั้งสองข้างแตะกันเหนือศีรษะ กลับสู่ท่าเตรียม และทำซ้ำ' },
  { id: '2', image: ex2 ,name: 'ท่าปั่นขา', duration: '00:30 น', description: 'ท่าปั่นขาในลักษณะยกขาขึ้นในอากาศ คล้ายกับการปั่นจักรยาน ทำซ้ำหลาย ๆ ครั้ง' },
  { id: '3', image: ex3 ,name: 'ท่าแพลงก์', duration: '00:30 น', description: 'อยู่ในท่านอนคว่ำลง ใช้ข้อศอกและปลายเท้ารับน้ำหนักตัว ค้างไว้ในท่านี้' },
  { id: '4', image: ex4 ,name: 'ท่ายกขา', duration: '00:30 น', description: 'นอนหงายบนพื้น แล้วยกขาขึ้นลงตามจังหวะ เป็นการบริหารกล้ามเนื้อหน้าท้อง' },
];

const ExerciseScreen = () => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.exerciseItem} onPress={() => navigation.navigate('Description', { item, items: exercises })}>
      <Image source={item.image} style={styles.exerciseImage} />
      <View style={styles.exerciseDetails}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseInfo}>{item.duration}</Text>
      </View>
      <Icon name="menu" size={24} color="#000" />
    </TouchableOpacity>
  );

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
      <Image source={exercise} style={styles.mainImage} />
      <Text style={styles.dateText}>วันที่ 14 ม.ค - ร่างกายทุกส่วน</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="clock-outline" size={24} color="#F6A444" />
          <Text style={styles.statText}>2 min</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="fire" size={24} color="#F6A444" />
          <Text style={styles.statText}>100 cal</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="dumbbell" size={24} color="#F6A444" />
          <Text style={styles.statText}>4 ท่า</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.startButton} 
        onPress={() => navigation.navigate('Exercise1', { item: exercises[0], items: exercises, currentIndex: 0, isRest: false })}
      >
        <Text style={styles.startButtonText}>เริ่ม</Text>
      </TouchableOpacity>
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
    width: 90,
    height: 60,
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
