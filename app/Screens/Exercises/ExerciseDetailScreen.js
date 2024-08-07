import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import axios from 'axios';

const extractTextFromDescription = (description) => {
  return description.map(block => {
    if (block.type === 'paragraph') {
      return block.children.map(child => child.text).join('');
    }
    return '';
  }).join(' ');
};

export default function ExerciseDetailScreen({ route }) {
  const { exerciseId } = route.params;
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await axios.get(`http://192.168.1.113:1337/api/exercises/${exerciseId}`);
        console.log("Exercise Response:", response.data);
        const exerciseData = response.data.data.attributes;
        setExercise({
          ...exerciseData,
          descriptionText: extractTextFromDescription(exerciseData.description)
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!exercise) {
    return <Text>Exercise not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise.name}</Text>
      <Text>{exercise.descriptionText}</Text>
      {exercise.animation && exercise.animation.data[0]?.attributes?.url ? (
        <Image source={{ uri: exercise.animation.data[0].attributes.url }} style={styles.image} />
      ) : (
        <Text>No animation available</Text>
      )}
      <Text>ระยะเวลา: {exercise.duration} นาที</Text>
      <Text>แคลอรี่ที่เผาผลาญ: {exercise.caloriesBurned}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
});
