import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Exercise4 = () => {
  const navigation = useNavigation();
  const coins = 1325;
  const reward = 20;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}
        onPress={() => navigation.navigate('ExerciseScreen')}>
          <Icon name="close" size={30} color="#FFA500" />
        </TouchableOpacity>
        <View style={styles.coinsContainer}>
          <Icon name="coin" size={24} color="#FFA500" />
          <Text style={styles.coinsText}>{coins}</Text>
        </View>
      </View>
      <View style={styles.trophyContainer}>
        <Image source={require('../../../assets/image/trophy.png')} style={styles.trophyImage} />
        <View style={styles.coinRewardContainer}>
          <Icon name="coin" size={24} color="#FFA500" />
          <Text style={styles.coinRewardText}>{reward}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.finishButton}
      onPress={() => navigation.navigate('ExerciseScreen')}>
        <Text style={styles.finishButtonText}>เสร็จสิ้น</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  closeButton: {
    margin: 16,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
  },
  coinsText: {
    fontSize: 18,
    marginLeft: 8,
    fontFamily: 'appfont_01',
    color: '#FFA500',
  },
  trophyContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  trophyImage: {
    width: 200,
    height: 200,
  },
  coinRewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 25,
    marginVertical: 20,
  },
  coinRewardText: {
    fontSize: 18,
    color: '#FFF',
    marginLeft: 8,
    fontFamily: 'appfont_01',
  },
  finishButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    borderRadius: 50,
    width: 320,
    alignItems: 'center',
    marginTop: 20,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'appfont_01',
  },
});

export default Exercise4;
