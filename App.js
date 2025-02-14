import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AnalysisScreen from './app/Screens/AnalysisScreen.js';
import ShopScreen from './app/Screens/ShopScreen.js';
import ClothingScreen from './app/Screens/ClothingScreen.js';
import HomeScreen from './app/Screens/HomeScreen.js';
import BottomProfile from './app/Screens/BottomProfile.js';
import Description from './app/Screens/Daily_exercise/Description.js';
import Question from './app/Screens/Question.js';
import Startex from './app/Screens/Daily_exercise/Startex.js';
import Exercise1 from './app/Screens/Daily_exercise/Exercise1.js';
import Exercise2 from './app/Screens/Daily_exercise/Exercise2.js';
import Exercise4 from './app/Screens/Daily_exercise/Exercise4.js';
import Login from './app/Screens/Login.js';
import Loginpage from './app/Screens/Loginpage.js';
import Register from './app/Screens/Register.js';
import Addexercises from './app/Screens/Additional_Exercises/Addexercises.js';
import FoodScreen from './app/Screens/FoodScreen.js';
import { BalanceProvider } from './app/Screens//BalanceContext';
import Couseexercies from './app/Screens/Couse_add/Couseexercies.js';
import Couse_start from './app/Screens/Couse_add/Couse_start.js';
import Couse_startc from './app/Screens/Couse_add/Couse_startc.js';
import Couse_relax from './app/Screens/Couse_add/Couse_relax.js';
import Couse_finish from './app/Screens/Couse_add/Couse_finish.js';
import Couse_des from './app/Screens/Couse_add/Couse_des.js';
import Musclesexercies from './app/Screens/Additional_Exercises/Muscles/Musclesexercies.js';
import Muscles_startc from './app/Screens/Additional_Exercises/Muscles/Muscles_startc.js';
import Muscles_start from './app/Screens/Additional_Exercises/Muscles/Muscles_start.js';
import Muscles_relax from './app/Screens/Additional_Exercises/Muscles/Muscles_relax.js';
import Muscles_finish from './app/Screens/Additional_Exercises/Muscles/Muscles_finish.js';
import Muscles_des from './app/Screens/Additional_Exercises/Muscles/Muscles_des.js';
import Homeexercise from './app/Screens/Daily_exercise/Home_exercise.js';
import Dayexercise from './app/Screens/Daily_exercise/Day_exercise.js';
import Muscleslevel from './app/Screens/Additional_Exercises/Muscles/Muscles_level.js';

const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <BalanceProvider>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* ใส่หน้าจอ Login และหน้าจออื่น ๆ */}
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Loginpage" component={Loginpage} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="BottomProfile" component={BottomProfile} />
      <Stack.Screen name="ShopScreen" component={ShopScreen} />
      <Stack.Screen name="ClothingScreen" component={ClothingScreen} />
      <Stack.Screen name="FoodScreen" component={FoodScreen} />
      <Stack.Screen name="AnalysisScreen" component={AnalysisScreen} />
      <Stack.Screen name="Description" component={Description} />
      <Stack.Screen name="Question" component={Question} />
      <Stack.Screen name="Startex" component={Startex} />
      <Stack.Screen name="Exercise1" component={Exercise1} />
      <Stack.Screen name="Exercise2" component={Exercise2} />
      <Stack.Screen name="Exercise4" component={Exercise4} />
      <Stack.Screen name="Couseexercies" component={Couseexercies} />
      <Stack.Screen name='Couse_start' component={Couse_start} />
      <Stack.Screen name='Couse_startc' component={Couse_startc} />
      <Stack.Screen name='Couse_relax' component={Couse_relax} />
      <Stack.Screen name='Couse_finish' component={Couse_finish} />
      <Stack.Screen name='Couse_des' component={Couse_des} />
      <Stack.Screen name="Addexercises" component={Addexercises} />
      <Stack.Screen name='Musclesexercies' component={Musclesexercies} />
      <Stack.Screen name='Muscles_startc' component={Muscles_startc} /> 
      <Stack.Screen name='Muscles_start' component={Muscles_start} /> 
      <Stack.Screen name='Muscles_relax' component={Muscles_relax} /> 
      <Stack.Screen name="Muscles_finish" component={Muscles_finish} />
      <Stack.Screen name="Muscles_des" component={Muscles_des} />
      <Stack.Screen name="Homeexercise" component={Homeexercise} />
      <Stack.Screen name="Dayexercise" component={Dayexercise} />
      <Stack.Screen name="Muscleslevel" component={Muscleslevel} />
    </Stack.Navigator>
  </BalanceProvider>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  const [loaded] = useFonts({
    'appfont_01': require('./assets/fonts/Kanit-Regular.ttf'),
    'appfont_02': require('./assets/fonts/Kanit-Medium.ttf'),
  });

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (token) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);  // ให้สถานะเป็น false แต่ไม่ต้องลบ token
      }
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
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
