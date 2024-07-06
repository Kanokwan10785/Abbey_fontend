import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Description = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/image/exercise.png')}
        style={styles.exerciseImage}
      />
      <View style={styles.header}>
        <Text style={styles.title}>ท่ากระโดดตบ</Text>
        <View style={styles.timerContainer}>
          <Icon name="timer" size={20} color="#FFA500" />
          <Text style={styles.timerText}>00:30 น.</Text>
        </View>
      </View>
      <Text style={styles.description}>
        เริ่มจากอยู่ในท่ายืนเท้าชิด แขนแนบลำตัว จากนั้นกระโดดแยกขา และมือทั้งสองข้างแตะกันเหนือศีรษะ กลับสู่ท่าเตรียม และทำซ้ำ
      </Text>
      <Text style={styles.sectionTitle}>กล้ามเนื้อที่เน้น</Text>
      <Image
        source={require('../../../assets/image/exercise.png')}
        style={styles.muscleImage}
      />
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="chevron-left" size={30} color="#FFA500" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeText}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="chevron-right" size={30} color="#FFA500" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>ปิด</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
    height: '100%',
  },
  exerciseImage: {
    borderRadius: 20,
    width: '95%',
    height: 200,
    marginTop: 50,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timerContainer: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    marginLeft: 4,
    fontSize: 16,
    color: '#FFA500',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  muscleImage: {
    borderRadius: 20,
    width: '95%',
    height: 300,
    marginTop: 20,
    alignSelf: 'center',
  },
  muscleLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  muscleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 4,
  },
  labelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00F',
    marginRight: 4,
  },
  labelText: {
    fontSize: 14,
    color: '#333',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  navButton: {
    padding: 8,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFA500',
    borderRadius: 4,
  },
  closeText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default Description;
