import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const extractTextFromDescription = (description) => {
  return description.map(block => {
    if (block.type === 'paragraph') {
      return block.children.map(child => child.text).join('');
    }
    return '';
  }).join(' ');
};

const extractAnimationUrl = (animation) => {
  if (animation && animation.data && animation.data[0] && animation.data[0].attributes) {
    return animation.data[0].attributes.url;
  }
  return null;
};

export default function Exercisehome() {
  const navigation = useNavigation();
  const [exercises, setExercises] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get('http://192.168.1.174:1337/api/exercises?populate=*');
        console.log("API Response:", response.data);

        const exercisesData = response.data.data.map(item => ({
          id: item.id,
          ...item.attributes,
          descriptionText: extractTextFromDescription(item.attributes.description),
          animationUrl: extractAnimationUrl(item.attributes.animation)
        }));

        setExercises(exercisesData);

        let time = 0;
        let calories = 0;
        exercisesData.forEach(exercise => {
          time += exercise.duration;
          calories += exercise.caloriesBurned;
        });
        setTotalTime(time);
        setTotalCalories(calories);
      } catch (error) {
        console.error("Error fetching exercises: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ออกกำลังกาย</Text>
      <Text>วันที่: {new Date().toLocaleDateString()}</Text>
      <Text>เวลาในการออกกำลังกาย: {totalTime} นาที</Text>
      <Text>ปริมาณแคลอรี่ที่ลดได้: {totalCalories} แคลอรี่</Text>
      <Text>จำนวนท่าออกกำลังกายทั้งหมด: {exercises.length}</Text>
      <Button title="เริ่ม" onPress={() => navigation.navigate('ExerciseStartScreen')} />
      <FlatList
        data={exercises.slice(0, 3)}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ExerciseDetailScreen', { exerciseId: item.id })}>
            <Text>{item.name}</Text>
            <Text>{item.descriptionText}</Text>
            {item.animationUrl && (
              <Image source={{ uri: item.animationUrl }} style={styles.image} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});
