import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';
import dollar from '../../assets/image/dollar-01.png';

const DollarIcon = () => (
    <View style={styles.currencyContainer}>
      <View style={styles.currencyBackground}>
        <Text style={styles.currencyText}>1,250</Text>
        <Image source={dollar} style={styles.currencyIcon} />
      </View>
    </View>
);

  
const styles = StyleSheet.create({
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  currencyBackground: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: -5,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 14,
  },
});
export default DollarIcon;