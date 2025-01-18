import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../BottomBar';
import exercise from '../../../assets/image/exercise.png';
import ex1 from '../../../assets/image/ex1.gif';
import ex2 from '../../../assets/image/ex2.gif';
import ex3 from '../../../assets/image/ex3.gif';
import ex4 from '../../../assets/image/ex4.gif';
import { useNavigation } from '@react-navigation/native';

// const exercises = [
//   { id: '1', image: ex1 ,name: 'ท่ากระโดดตบ', duration: '00:30 น', description: 'เริ่มจากอยู่ในท่ายืนเท้าชิด แขนแนบลำตัว จากนั้นกระโดดแยกขา และมือทั้งสองข้างแตะกันเหนือศีรษะ กลับสู่ท่าเตรียม และทำซ้ำ' },
//   { id: '2', image: ex2 ,name: 'ท่าปั่นขา', duration: '00:30 น', description: 'ท่าปั่นขาในลักษณะยกขาขึ้นในอากาศ คล้ายกับการปั่นจักรยาน ทำซ้ำหลาย ๆ ครั้ง' },
//   { id: '3', image: ex3 ,name: 'ท่าแพลงก์', duration: '00:30 น', description: 'อยู่ในท่านอนคว่ำลง ใช้ข้อศอกและปลายเท้ารับน้ำหนักตัว ค้างไว้ในท่านี้' },
//   { id: '4', image: ex4 ,name: 'ท่ายกขา', duration: '00:30 น', description: 'นอนหงายบนพื้น แล้วยกขาขึ้นลงตามจังหวะ เป็นการบริหารกล้ามเนื้อหน้าท้อง' },
// ];


const ExerciseScreen = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);
  const navigation = useNavigation();

  const today = new Date();
  const dayOfMonth = today.getDate();
  const formattedDate = today.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    fetchExercises(dayOfMonth);
  }, [dayOfMonth]);

  const fetchExercises = async (day) => {
    try {
      const response = await fetch(`http://192.168.1.200:1337/api/daily-exercise-routines?filters[Day_name][$eq]=Day1&populate=exercises.animation,exercises.muscle`);
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        console.error("ไม่มีข้อมูลที่ต้องการจาก API");
        setLoading(false);
        return;
      }

      let totalDuration = 0;
      const exerciseData = data.data[0]?.attributes?.exercises?.data.map(exercise => {
        const imageData = exercise.attributes.muscle?.data?.[0]?.attributes?.formats?.thumbnail;
        const imageUrl = imageData ? imageData.url : null;
        const animationData = exercise.attributes.animation?.data?.[0]?.attributes;
        const animationUrl = animationData ? animationData.url : null;

        let displayText = '';
        if (exercise.attributes.reps) {
          displayText = `${exercise.attributes.reps} ครั้ง`;
          totalDuration += 30;  // กำหนดให้ทุกท่าที่เป็นจำนวนครั้งมีค่าเท่ากับ 30 วินาที
        } else if (exercise.attributes.duration) {
          const durationInSeconds = Math.floor(exercise.attributes.duration * 60);
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = durationInSeconds % 60;

          // หากเวลามีส่วนของวินาที
          if (minutes > 0) {
            displayText = seconds > 0 ? `${minutes} นาที ${seconds} วินาที` : `${minutes} นาที`;
          } else {
            displayText = `${seconds} วินาที`;
          }

          totalDuration += durationInSeconds;
        }

        return {
          id: exercise.id.toString(),
          animation: animationUrl,
          name: exercise.attributes.name,
          duration: displayText,
          description: exercise.attributes.description?.[0]?.children?.[0]?.text || 'ไม่มีคำอธิบาย',
          image: imageUrl,
          dollar: exercise.attributes.dollar,
          trophy: data.data[0]?.attributes?.trophy || 0,
        };
      }) || [];

      // console.log('exerciseData:', exerciseData);

      setExercises(exerciseData);
      setTotalTime(totalDuration);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.exerciseItem} onPress={() => navigation.navigate('Description', { item, items: exercises })}>
      <Image
        source={item.animation ? { uri: item.animation } : exercise}
        style={styles.exerciseImage}
      />
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
        <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('Homeexercise')}>
          <Text style={styles.tabButtonText}>ภารกิจหลัก</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton1} onPress={() => navigation.navigate('Addexercises')}>
          <Text style={styles.tabButtonText1}>ภารกิจเสริม</Text>
        </TouchableOpacity>
      </View>
      <Image source={exercise} style={styles.mainImage} />
      <Text style={styles.dateText}>วันที่ {formattedDate} - ร่างกายทุกส่วน</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="clock-outline" size={24} color="#F6A444" />
          {/* ตรวจสอบว่า totalTime ถูกต้องและนำไปใช้ใน Text */}
          <Text style={styles.statText}>{Math.floor(totalTime / 60)} นาที {totalTime % 60} วินาที</Text>  
        </View>
        <View style={styles.statItem}>
          <Icon name="dumbbell" size={24} color="#F6A444" />
          <Text style={styles.statText}>{exercises.length} ท่า</Text>  
        </View>
      </View>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate('Startex', { item: exercises[0], items: exercises, currentIndex: 0 , isRest: false })}
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
    fontFamily: 'appfont_01',
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'appfont_01',
  },
});

export default ExerciseScreen;
