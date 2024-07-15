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
import Exercise3 from './app/Screens/Exercise/Exercise3.js';
import Exercise4 from './app/Screens/Exercise/Exercise4.js';
import Loginpage from './app/Screens/Loginpage.js';
import Register from './app/Screens/Register.js';
const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Loginpage" component={Loginpage} />
    <Stack.Screen name="Register" component={Register} />
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="ShopScreen" component={ShopScreen} />
    <Stack.Screen name="ClothingScreen" component={ClothingScreen} />
    <Stack.Screen name="ExerciseScreen" component={ExerciseScreen} />
    <Stack.Screen name="AnalysisScreen" component={AnalysisScreen} />
    <Stack.Screen name="Description" component={Description} />
    <Stack.Screen name="Question" component={Question} />
    <Stack.Screen name="Exercise1" component={Exercise1} />
    <Stack.Screen name="Exercise2" component={Exercise2} />
    <Stack.Screen name="Exercise3" component={Exercise3} />
    <Stack.Screen name="Exercise4" component={Exercise4} />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="ShopScreen" component={ShopScreen} />
    <Stack.Screen name="ClothingScreen" component={ClothingScreen} />
    <Stack.Screen name="ExerciseScreen" component={ExerciseScreen} />
    <Stack.Screen name="AnalysisScreen" component={AnalysisScreen} />
    <Stack.Screen name="Description" component={Description} />
    <Stack.Screen name="Question" component={Question} />
    <Stack.Screen name="Exercise1" component={Exercise1} />
    <Stack.Screen name="Exercise2" component={Exercise2} />
    <Stack.Screen name="Exercise3" component={Exercise3} />
    <Stack.Screen name="Exercise4" component={Exercise4} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
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
