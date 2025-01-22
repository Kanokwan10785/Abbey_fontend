import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../BottomBar';
import exercise from '../../../assets/image/exercise.png';
import previous from '../../../assets/image/previous.png';
import { useNavigation } from '@react-navigation/native';

const Couseexercies = ({ route }) => {
  const { item, items, currentIndex, courseId } = route.params;  // Get courseId from navigation
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalTime, setTotalTime] = useState(0);
    const navigation = useNavigation();
    const [courseImage, setCourseImage] = useState(null);

    useEffect(() => {      
      fetchexercises();
    }, [item, items, currentIndex, courseId]);

    // console.log('courseId',courseId)
  
    const fetchexercises = async () => {
      try {
        const response = await fetch(
          `http://192.168.1.200:1337/api/add-courses/${courseId}?populate=image,all_exercises.animation,all_exercises.muscle`
        );
        const data = await response.json();
        // console.log("API Response:", data);
  
        if (!data || !data.data) {
          console.error("ไม่มีข้อมูลที่ต้องการจาก API");
          setExercises([]);
          setLoading(false);
          return;
        }
  
        // Set course image
        const courseImageUrl = data.data?.attributes?.image?.data?.[0]?.attributes?.url || null;
        setCourseImage(courseImageUrl);
  
        let totalDuration = 0;
  
        // Map through exercises and extract data
        const exerciseData = data.data?.attributes?.all_exercises?.data.map((exercise) => {
          const imageUrl = exercise.attributes.muscle?.data?.[0]?.attributes?.formats?.thumbnail.url || null;
          const animationUrl = exercise.attributes.animation?.data?.[0]?.attributes?.url || null;
  
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
                    id: exercise.id.toString(),
                    animation: animationUrl,
                    name: exercise.attributes.name,
                    duration: displayText,
                    description: exercise.attributes.description?.[0]?.children?.[0]?.text || 'ไม่มีคำอธิบาย',
                    image: imageUrl,
                    dollar: exercise.attributes.dollar,
                    trophy: data.data.attributes.trophy || 0,
                    exname: data.data.attributes.name,
          };
        });

        // console.log("Exercise Data:", exerciseData);
  
        setExercises(exerciseData);
        setTotalTime(totalDuration);
        setLoading(false);
      } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
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
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Addexercises')}>
            <Image source={previous} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
          <View style={styles.Title}>
            <Text style={styles.headerTitle}>
              {exercises.length > 0 ? exercises[0].exname : 'ไม่มีชื่อ'}
            </Text>
          </View>
        </View>
        <Image source={courseImage ? { uri: courseImage } : exercise} style={styles.mainImage} />
        <Text style={styles.dateText}>ท่ายืดกล้ามเนื้อง่ายๆ บริเวณกล้ามแขน</Text>
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
        <TouchableOpacity
          style={styles.startButton}
          onPress={() =>
            navigation.navigate('Couse_startc', { item: exercises[0], items: exercises, currentIndex: 0, isRest: false ,courseId})
          }
        >
          <Text style={styles.startButtonText}>เริ่ม</Text>
        </TouchableOpacity>
        <FlatList
          data={exercises}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.exerciseItem} onPress={() => navigation.navigate('Couse_des', { item, items: exercises ,courseId})}>
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
        marginTop: 40,
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
    navButton: {
        backgroundColor: '#F6A444',
        padding: 10,
        borderRadius: 50,
    },
    mainImage: {
        width: '90%',
        height: 200,
        marginBottom: 10,
        alignSelf: 'center',
        borderRadius: 20,

    },
    dateText: {
        textAlign: 'left',
        marginLeft: 30,
        fontSize: 16,
        // marginVertical: 10,
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
    loadingText: {
    marginTop: 10,
    fontSize: 18,
    fontFamily: 'appfont_01',
  },
});

export default Couseexercies;