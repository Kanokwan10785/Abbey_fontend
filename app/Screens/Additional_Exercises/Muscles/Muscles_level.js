import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomBar from '../../BottomBar';
import previous from '../../../../assets/image/previous.png';
import { useNavigation } from '@react-navigation/native';

const MusclesLevel = ({route}) => {
  const navigation = useNavigation();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { musclesId } = route.params;

  useEffect(() => {
    fetchCourses();
        }, [musclesId]);
 
        const fetchCourses = async () => {
          try {
            const response = await fetch(
              `http://192.168.1.200:1337/api/muscles-exercises/${musclesId}?populate=exercise_levels.image,icon,exercise_levels.all_exercises`
            );
            const data = await response.json();
        
            // console.log('Fetched Data:', data);
        
            if (!data || !data.data || !data.data.attributes.exercise_levels.data) {
              console.error("ไม่มีข้อมูลจาก API");
              setLevels([]);
              setLoading(false);
              return;
            }
            
            // ดึงข้อมูล exercise_levels
            const levelsData = data.data.attributes.exercise_levels.data.map((level) => {
              let totalDuration = 0;
              const exercises = level.attributes.all_exercises.data.map((exercise) => {

                if (exercise.attributes.reps) {
                  displayText = `${exercise.attributes.reps} ครั้ง`;
                  totalDuration += 30;
                } 
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
              }); 

              return {
                id: level.id,
                name: level.attributes.name,
                title: level.attributes.title,
                imageUrl: level.attributes.image?.data?.[0]?.attributes?.formats?.small?.url || null, // Small image
                duration: totalDuration,
                repetitions: exercises.length, 
              };
            });
            
            setLevels(levelsData);
            setLoading(false);
          } catch (error) {
            console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
            setLoading(false);
          }
        };

        const formatTotalTime = (seconds) => {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          return `${minutes} นาที ${remainingSeconds} วินาที`;
        };        

        const renderItem = ({ item }) => (
          <View >
          <Text style={styles.headerTitle}>{item.title}</Text>
          <View style={styles.heading}>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Musclesexercies', { musclesId: item.id})}>
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.titleName}>{item.name}</Text>
                <View style={styles.row}>
                  <Icon name="clock" size={20} color="#F6A444" style={{ marginRight: 5 }} />
                  <Text style={styles.detail}>{formatTotalTime(item.duration)}</Text>
                  <Icon name="dumbbell" size={20} color="#F6A444" style={{ marginRight: 5, marginLeft: 10 }} />
                  <Text style={styles.detail}>{item.repetitions}  ท่า</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          </View>
        );
        

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={previous} style={{ width: 30, height: 30 }} />
        </TouchableOpacity>
        <View style={styles.Title}>
          <Text style={styles.headerTitle}>กล้ามแขน</Text>
        </View>
      </View>
        <FlatList
          data={levels}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 40,
  },
  heading: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  Title: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginRight: 20,
    },
    titleName:{
      fontSize: 16,
      fontFamily: 'appfont_01',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'appfont_01',
        marginLeft: 15,
        marginTop: 5
    },
  card: {
    flexDirection: 'row',
    backgroundColor: '#F9E79F',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  image: {
    width: 130,
    height: 80,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    padding: 16,
  },
  levelName: {
    fontSize: 16,
    fontFamily: 'appfont_01',
    marginBottom: 5,
    marginLeft: 2
  },
  Name: {
    fontSize: 16,
    fontFamily: 'appfont_01',
    marginBottom: 5,
    color: '#000'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detail: {
    fontSize: 14,
    fontFamily: 'appfont_01',
    color: '#000',
    marginTop: 5,
    marginEnd: 30,
    marginRight: 30,
  },
});

export default MusclesLevel;
