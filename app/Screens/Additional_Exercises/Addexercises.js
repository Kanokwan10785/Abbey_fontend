import React , { useEffect, useState }from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../BottomBar';
import { useNavigation } from '@react-navigation/native';
import leg from '../../../assets/image/image-exercise/leg.png';
import back from '../../../assets/image/image-exercise/back.png';
import chest from '../../../assets/image/image-exercise/chest.png';
import muscle from '../../../assets/image/image-exercise/muscle.png';
import backache from '../../../assets/image/image-ex/backache.jpeg';
import neck from '../../../assets/image/image-ex/neck.webp';
import knee from '../../../assets/image/image-ex/knee.png';
import Shoulder from '../../../assets/image/image-ex/Shoulder.webp';


  const Addexercises = () => {
    const navigation = useNavigation();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
   
    useEffect(() => {
      fetchCourses();
    }, []);
  
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `http://192.168.1.196:1337/api/add-courses?populate=image,all_exercises.animation,all_exercises.muscle`
        );
        const data = await response.json();
  
        console.log("API Response:", data);
  
        if (!data || !data.data || data.data.length === 0) {
          console.error("ไม่มีข้อมูลที่ต้องการจาก API");
          setCourses([]);
          setLoading(false);
          return;
        }
  
        const courseData = data.data.map((course) => {
          const courseAttributes = course.attributes;
          const courseImageUrl = courseAttributes?.image?.data?.[0]?.attributes?.url || null;
  
          let totalDuration = 0;
  
          const exerciseData = courseAttributes?.all_exercises?.data.map((exercise) => {
            let displayText = '';
    
                // If exercise has reps, assume 30 seconds per rep
                if (exercise.attributes.reps) {
                    displayText = `${exercise.attributes.reps} ครั้ง`;
                    totalDuration += 30;
                } 
                // If exercise has duration, convert it to seconds and display
                else if (exercise.attributes.duration) {
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
              id: exercise.id,
              name: exercise.attributes.name,
              duration: displayText,
            };
          }) || [];
  
          return {
            id: course.id,
            name: courseAttributes.name,
            trophy: courseAttributes.trophy || 0,
            imageUrl: courseImageUrl,
            totalExercises: exerciseData.length,
            totalTime: totalDuration,
          };
        });
  
        setCourses(courseData);
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        setLoading(false);
      }
    };
  
    const formatTotalTime = (seconds) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} นาที ${remainingSeconds} วินาที`;
    };
  
    const renderItem = ({ item }) => (
      <View>
        <TouchableOpacity style={styles.course} onPress={() => navigation.navigate('Couseexercies', { courseId: item.id })}>
          <Image source={{ uri: item.imageUrl }} style={styles.courseImage} />
          <View style={styles.courseInfo}>
            <Text style={styles.courseText}>{item.name}</Text>
            <View style={{ flexDirection: 'row' }}>
              <Icon name="clock" size={20} color="#F6A444" style={{ marginTop: 5,marginRight:10 }} />
              <Text style={styles.courseSubText}>{formatTotalTime(item.totalTime)}</Text>
              <Icon name="dumbbell" size={20} color="#F6A444" style={{ marginTop: 5,marginRight:10 }} />
              <Text style={styles.courseSubText}>{item.totalExercises}  ท่า</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );

    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#F6A444" />
        </View>
      );
    }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ออกกำลังกาย</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabButton}
        onPress={() => navigation.navigate('ExerciseScreen')}>
          <Text style={styles.tabButtonText}>ภารกิจรายวัน</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton1}
        onPress={() => navigation.navigate('Addexercises')}>
          <Text style={styles.tabButtonText1}>ภารกิจเสริม</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.containerexercise}>
       <Text style={styles.tabText}>ออกกำลังกายเฉพาะส่วน</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} 
          onPress={() => navigation.navigate('Armexercies')}>
          <Text style={styles.buttonText}>กล้ามแขน</Text>
          <Image source={muscle} style={{width: 50,height: 50,}} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}
          onPress={() => navigation.navigate('Legexercies')}>
          <Text style={styles.buttonText}>กล้ามขา</Text>
          <Image source={leg} style={{width: 50,height: 50}} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}
          onPress={() => navigation.navigate('Chestexercises')}>
          <Text style={styles.buttonText}>กล้ามหน้าอก</Text>
          <Image source={chest} style={{width: 60,height: 50}}/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}
          onPress={() => navigation.navigate('Backexercises')}>
          <Text style={styles.buttonText}>กล้ามหลัง</Text>
          <Image source={back} style={{width: 60,height: 50}}/>
        </TouchableOpacity>
      </View>
      <View style={styles.courseContainer}>
        <Text style={styles.tabText}>คอร์สออกกำลังกายเสริม</Text>
      </View>
    </View>
    <FlatList
        data={courses}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        style={styles.courseList}
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
  tabText: {
    fontSize: 18,
    fontFamily: 'appfont_01',
  },
  tabButton: {
    padding: 7,
    height: 40,
    width: 150,
    backgroundColor: '#F6A444',
    borderRadius: 20,
  },
  tabButtonText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'appfont_01',
  },
  tabButton1: {
    padding: 7,
    height: 40,
    width: 150,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#F6A444',
    borderRadius: 20,
  },
  tabButtonText1: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'appfont_01',
  },
  containerexercise: {
    padding: 16,
    },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  button: {
    width: '48%',
    padding: 16,
    backgroundColor: '#F9E79F',
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'appfont_01',
    paddingRight: 15,
  },
  courseContainer: {
    flexDirection: 'column',
  },
  course: {
    flexDirection: 'row',
    backgroundColor: '#F9E79F',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  courseList: {
    marginHorizontal: 10,
  },
  courseImage: {
    width: 130,
    height: 80,
    borderRadius: 8,
},
  courseInfo: {
    flex: 1,
    padding: 16,
  },
  courseText: {
    fontSize: 16,
    fontFamily: 'appfont_01',
  },
  courseSubText: {
    fontSize: 14,
    fontFamily: 'appfont_01',
    color: '#000',
    marginTop: 5,
    marginEnd: 30,
    marginRight: 30,
  },
  exerciseList: {
    marginHorizontal: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
});

export default Addexercises;