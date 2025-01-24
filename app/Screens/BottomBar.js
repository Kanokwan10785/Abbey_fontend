import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import bar01 from '../../assets/image/bar-01.png';
import bar02 from '../../assets/image/bar-02.png';
import bar03 from '../../assets/image/bar-03B.png';
// import bar03 from '../../assets/image/bar-03.png';
import bar04 from '../../assets/image/bar-04.png';
import bar05 from '../../assets/image/bar-05.png';

const BottomBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const isActive = (screenName) => {
    return route.name === screenName;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={isActive('ShopScreen') ? styles.aftericonContainer : styles.beforeiconContainer} onPress={() => navigation.navigate('ShopScreen')}>
        <Image source={bar01} style={styles.icon} />
        <Text style={styles.label}>ร้านค้า</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={isActive('ClothingScreen') ? styles.aftericonContainer : styles.beforeiconContainer} onPress={() => navigation.navigate('ClothingScreen')}>
        <Image source={bar02} style={styles.icon} />
        <Text style={styles.label}>เสื้อผ้า</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={isActive('HomeScreen') ? styles.aftericonContainer : styles.beforeiconContainer} onPress={() => navigation.navigate('HomeScreen')}>
        <Image source={bar03} style={styles.icon} />
        <Text style={styles.label}>หน้าหลัก</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={isActive('Homeexercise') ? styles.aftericonContainer : styles.beforeiconContainer} onPress={() => navigation.navigate('Homeexercise')}>
        <Image source={bar04} style={styles.icon} />
        <Text style={styles.label}>ภารกิจ</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={isActive('AnalysisScreen') ? styles.aftericonContainer : styles.beforeiconContainer} onPress={() => navigation.navigate('AnalysisScreen')}>
        <Image source={bar05} style={styles.icon} />
        <Text style={styles.label}>วิเคราะห์</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F6A444',
    paddingVertical: 5,
  },
  beforeiconContainer: {
    width: '19%',
    alignItems: 'center',
    borderColor: "#F9E79F",
    borderWidth: 6,
    borderRadius: 10,
  },
  aftericonContainer: {
    width: '19%',
    alignItems: 'center',
    // marginTop: -5,
  },
  icon: {
    width: 50,
    height: 50,
    marginTop: 5,
  },
  label: {
    marginTop: 5,
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'appfont_01',
  },
});

export default BottomBar;
