import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ExerciseStartScreen() {
  const navigation = useNavigation();
  const [timer, setTimer] = useState(30); 
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            navigation.navigate('ExerciseCompletionScreen');
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else if (!isRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  return (
    <View style={styles.container}>
      <Text>เวลาการออกกำลังกาย: {timer} วินาที</Text>
      <Button title={isRunning ? "หยุด" : "เริ่ม"} onPress={() => setIsRunning(!isRunning)} />
      <Button title="ถัดไป" onPress={() => navigation.navigate('ExerciseCompletionScreen')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
});
