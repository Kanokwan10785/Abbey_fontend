import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import BottomBar from './BottomBar'


export default function AnalysisScreen() {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text>AnalysisScreen</Text>
        </View>
        <BottomBar />
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center', // Center content vertically
      alignItems: 'center', // Center content horizontally
    },
  });