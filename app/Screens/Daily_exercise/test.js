import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

const Dayexercise = () => {
  const route = useRoute();
  const { dayNumber, weekId } = route.params; // Extracting parameters passed from the Homeexercise screen

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Day:", dayNumber, "Week:", weekId); // Check params
    fetchExercises(dayNumber, weekId);
  }, [dayNumber, weekId]);

  const fetchExercises = async (day, week) => {
    try {
      const response = await fetch(`http://172.30.81.182:1337/api/days?filters[dayNumber][$eq]=${day}&filters[week][$eq]=${week}&populate=all_exercises`);
      const data = await response.json();
      console.log('API Response:', data); // Inspect API response

      // Extract all exercises from the response
      const allExercises = data?.data?.[0]?.attributes?.all_exercises?.data || [];
      const formattedExercises = allExercises.map(exercise => ({
        id: exercise.id,
        name: exercise.attributes.name,
        description: exercise.attributes.description[0]?.children[0]?.text || 'No description',
        duration: exercise.attributes.duration,
        reps: exercise.attributes.reps,
        dollar: exercise.attributes.dollar,
      }));

      setExercises(formattedExercises);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.exerciseItem}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Text style={styles.exerciseDescription}>{item.description}</Text>
      {item.duration ? (
        <Text style={styles.exerciseInfo}>Duration: {item.duration} minutes</Text>
      ) : (
        <Text style={styles.exerciseInfo}>Reps: {item.reps}</Text>
      )}
      <Text style={styles.exerciseInfo}>Dollar: {item.dollar}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Day {dayNumber} - Full Body</Text>
      {loading ? <Text>Loading...</Text> : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
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
    marginBottom: 20,
  },
  exerciseItem: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#333',
  },
});

export default Dayexercise;
