import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import ExerciseScreen from './app/Screens/Exercise/ExerciseScreen.js';
import AnalysisScreen from './app/Screens/AnalysisScreen.js';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { useFonts } from 'expo-font';
import ShopScreen from './app/Screens/ShopScreen.js';
import ClothingScreen from './app/Screens/ClothingScreen.js';
import HomeScreen from './app/Screens/HomeScreen.js';
import Description from './app/Screens/Exercise/Description.js';
import FoodScreen from './app/Screens/FoodScreen.js';
import { ClothingProvider } from './app/Screens/ClothingContext';

const Stack = createNativeStackNavigator();

const App = () => {

  const [loaded] = useFonts({
    'appfont_01': require('./assets/fonts/Kanit-Regular.ttf'),
    'appfont_02': require('./assets/fonts/Kanit-Medium.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <ClothingProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ShopScreen" component={ShopScreen} />
          <Stack.Screen name="ClothingScreen" component={ClothingScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="FoodScreen" component={FoodScreen} />
          <Stack.Screen name="ExerciseScreen" component={ExerciseScreen} />
          <Stack.Screen name="AnalysisScreen" component={AnalysisScreen} />
          <Stack.Screen name="Description" component={Description} />
        </Stack.Navigator>
      </ClothingProvider>
    </NavigationContainer>
  );
};

export default App;
