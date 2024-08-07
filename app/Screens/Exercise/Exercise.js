import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getDailyExercise } from '../api';

const Exercise = () => {
  const [dailyExercise, setDailyExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDailyExercise();
        console.log(data); 
        if (data && data.data && data.data.length > 0) {
          setDailyExercise(data.data[1].attributes);
        } else {
          setDailyExercise(null);
        }
      } catch (error) {
        console.error('Error fetching daily exercise.js', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (!dailyExercise) {
    return <Text>No exercise data available js</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ออกกำลังกาย</Text>
      <Text>{dailyExercise.date}</Text>
      <Text>Total Time: {dailyExercise.totalTime} hours</Text>
      <Text>Total Calories: {dailyExercise.totalCalories} cal</Text>
      <FlatList
        data={dailyExercise.exercise.data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.exerciseItem}>
            <Text>Name: {item.attributes.name}</Text>
            <Text>Duration: {item.attributes.duration} hours</Text>
            <Text>Calories: {item.attributes.calories} cal</Text>
            <Text>Description: {item.attributes.description[0].children[0].text}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  exerciseItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Exercise;
