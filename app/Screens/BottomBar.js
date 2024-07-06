import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import bar01 from '../../assets/image/bar-01.png';
import bar02 from '../../assets/image/bar-02.png';
import bar03 from '../../assets/image/bar-03.png';
import bar04 from '../../assets/image/bar-04.png';
import bar05 from '../../assets/image/bar-05.png';

const BottomBar = () => {
    const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer}
      onPress={() => navigation.navigate('ShopScreen')}>
        <Image source={bar01} style={styles.icon} />
        <Text style={styles.label}>ร้านค้า</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer}
      onPress={() => navigation.navigate('ClothingScreen')}>
        <Image source={bar02} style={styles.icon} />
        <Text style={styles.label}>เสื้อผ้า</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer}
      onPress={() => navigation.navigate('HomeScreen')}>
        <Image source={bar03} style={styles.icon} />
        <Text style={styles.label}>หน้าหลัก</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer}
      onPress={() => navigation.navigate('ExerciseScreen')}>
        <Image source={bar04} style={styles.icon} />
        <Text style={styles.label}>ภารกิจ</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer}
      onPress={() => navigation.navigate('AnalysisScreen')}>
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
    paddingVertical: 10,
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 50,
    height: 50,
  },
  label: {
    marginTop: 5,
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'appfont_01',
  },
});

export default BottomBar;
