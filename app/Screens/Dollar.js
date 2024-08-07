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
  },
  currencyBackground: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
    currencyText: {
    fontSize: 18,
    marginRight: 14,
    fontFamily: 'appfont_02',
  },
  currencyIcon: {
    width: 40,
    height: 40,
    position: 'absolute',
    right: -5,
  },
});
export default DollarIcon;