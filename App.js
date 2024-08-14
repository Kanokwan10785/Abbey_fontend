import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ExerciseScreen from './app/Screens/Exercise/ExerciseScreen.js';
import AnalysisScreen from './app/Screens/AnalysisScreen.js';
import ShopScreen from './app/Screens/ShopScreen.js';
import ClothingScreen from './app/Screens/ClothingScreen.js';
import HomeScreen from './app/Screens/HomeScreen.js';
import Description from './app/Screens/Exercise/Description.js';
import Question from './app/Screens/Question.js';
import Exercise1 from './app/Screens/Exercise/Exercise1.js';
import Exercise2 from './app/Screens/Exercise/Exercise2.js';
import Exercise4 from './app/Screens/Exercise/Exercise4.js';
import Login from './app/Screens/Login.js';
import Loginpage from './app/Screens/Loginpage.js';
import Register from './app/Screens/Register.js';
import Exercise from './app/Screens/Exercise/Exercise.js';
import Exercisehome from './app/Screens/Exercises/Exercisehome.js';
import ExerciseDetailScreen from './app/Screens/Exercises/ExerciseDetailScreen.js';
import ExerciseStartScreen from './app/Screens/Exercises/ExerciseStartScreen.js';
import ExerciseCompletionScreen from './app/Screens/Exercises/ExerciseCompletionScreen.js';
import Addexercises from './app/Screens/Additional_Exercises/Addexercises.js';
import Bodyexercise from './app/Screens/Additional_Exercises/Bodyexercise.js';
import Armexercies from './app/Screens/Additional_Exercises/Arm/Armexercies.js';
import Arm_start from './app/Screens/Additional_Exercises/Arm/Arm_start.js';
import Arm_finish from './app/Screens/Additional_Exercises/Arm/Arm_finish.js';
import Arm_relax from './app/Screens/Additional_Exercises/Arm/Arm_relax.js';
import Arm_des from './app/Screens/Additional_Exercises/Arm/Arm_des.js';
import Legexercies from './app/Screens/Additional_Exercises/Leg/Legexercies.js';
import Chestexercises from './app/Screens/Additional_Exercises/Chest/Chestexercies.js';
import Backexercises from './app/Screens/Additional_Exercises/Back/Backexercies.js';
import FoodScreen from './app/Screens/FoodScreen.js';
import { ClothingProvider } from './app/Screens/ClothingContext';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <NavigationContainer independent={true}>
    <ClothingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Loginpage" component={Loginpage} />
        <Stack.Screen name="Register" component={Register} /> */}
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ShopScreen" component={ShopScreen} />
        <Stack.Screen name="ClothingScreen" component={ClothingScreen} />
        <Stack.Screen name="FoodScreen" component={FoodScreen} />
        <Stack.Screen name="ExerciseScreen" component={ExerciseScreen} />
        <Stack.Screen name="AnalysisScreen" component={AnalysisScreen} />
        <Stack.Screen name="Description" component={Description} />
        {/* <Stack.Screen name="Question" component={Question} /> */}
        <Stack.Screen name="Exercise1" component={Exercise1} />
        <Stack.Screen name="Exercise2" component={Exercise2} />
        <Stack.Screen name="Exercise4" component={Exercise4} />
        <Stack.Screen name="Exercise" component={Exercise} />
        <Stack.Screen name="Exercisehome" component={Exercisehome} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
        <Stack.Screen name="ExerciseStart" component={ExerciseStartScreen} />
        <Stack.Screen name="ExerciseCompletion" component={ExerciseCompletionScreen} />
        <Stack.Screen name="Addexercises" component={Addexercises} />
        <Stack.Screen name="Bodyexercise" component={Bodyexercise} />
        <Stack.Screen name="Armexercies" component={Armexercies} />
        <Stack.Screen name="Arm_start" component={Arm_start} />
        <Stack.Screen name="Arm_finish" component={Arm_finish} />
        <Stack.Screen name="Arm_relax" component={Arm_relax} />
        <Stack.Screen name="Arm_des" component={Arm_des} />
        <Stack.Screen name="Legexercies" component={Legexercies} />
        <Stack.Screen name="Chestexercises" component={Chestexercises} />
        <Stack.Screen name="Backexercises" component={Backexercises} />
      </Stack.Navigator>
    </ClothingProvider>
  </NavigationContainer>
);

const AppNavigator = () => (
  <NavigationContainer independent={true}>
    <ClothingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="ShopScreen" component={ShopScreen} />
        <Stack.Screen name="ClothingScreen" component={ClothingScreen} />
        <Stack.Screen name="FoodScreen" component={FoodScreen} />
        <Stack.Screen name="ExerciseScreen" component={ExerciseScreen} />
        <Stack.Screen name="AnalysisScreen" component={AnalysisScreen} />
        <Stack.Screen name="Description" component={Description} />
        {/* <Stack.Screen name="Question" component={Question} /> */}
        <Stack.Screen name="Exercise1" component={Exercise1} />
        <Stack.Screen name="Exercise2" component={Exercise2} />
        <Stack.Screen name="Exercise4" component={Exercise4} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Exercise" component={Exercise} />
        <Stack.Screen name="Exercisehome" component={Exercisehome} />
        <Stack.Screen name="ExerciseDetailScreen" component={ExerciseDetailScreen} />
        <Stack.Screen name="ExerciseStartScreen" component={ExerciseStartScreen} />
        <Stack.Screen name="ExerciseCompletionScreen" component={ExerciseCompletionScreen} />
        <Stack.Screen name="Addexercises" component={Addexercises} />
        <Stack.Screen name="Bodyexercise" component={Bodyexercise} />
        <Stack.Screen name="Armexercies" component={Armexercies} />
        <Stack.Screen name="Arm_start" component={Arm_start} />
        <Stack.Screen name="Arm_finish" component={Arm_finish} />
        <Stack.Screen name="Arm_relax" component={Arm_relax} />
        <Stack.Screen name="Arm_des" component={Arm_des} />
        <Stack.Screen name="Legexercies" component={Legexercies} />
        <Stack.Screen name="Chestexercises" component={Chestexercises} />
        <Stack.Screen name="Backexercises" component={Backexercises} />
      </Stack.Navigator>
    </ClothingProvider>
  </NavigationContainer>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const [loaded] = useFonts({
    'appfont_01': require('./assets/fonts/Kanit-Regular.ttf'),
    'appfont_02': require('./assets/fonts/Kanit-Medium.ttf'),
  });

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('jwt');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
  }, []);

  if (!loaded) {
    return null;
  }

  if (isLoggedIn === null) {
    return null; // Optionally render a loading screen here
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default App;
