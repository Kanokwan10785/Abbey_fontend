import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Description = ({ route, navigation }) => {
  const { item, items } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items && item) {
      const index = items.findIndex(i => i.id === item.id);
      setCurrentIndex(index);
    }
  }, [item, items]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      navigation.setParams({ item: items[newIndex] });
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      navigation.setParams({ item: items[newIndex] });
    }
  };

  if (!item || !items) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>เกิดข้อผิดพลาดในการโหลดข้อมูล</Text>
      </View>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <Image source={currentItem.image} style={styles.exerciseImage} />
      <View style={styles.header}>
        <Text style={styles.title}>{currentItem.name}</Text>
        <View style={styles.timerContainer}>
          <Icon name="timer" size={20} color="#FFA500" />
          <Text style={styles.timerText}>{currentItem.duration}</Text>
        </View>
      </View>
      <Text style={styles.description}>{currentItem.description}</Text>
      <Text style={styles.sectionTitle}>กล้ามเนื้อที่เน้น</Text>
      <Image
        source={require('../../../assets/image/exercise.png')}
        style={styles.muscleImage}
      />
      <View style={styles.navigation}>
        <View style={styles.buttonnav}>
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious} disabled={currentIndex === 0}>
            <Icon name="chevron-left" size={30} color={currentIndex === 0 ? "#CCC" : "#FFA500"} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.textpage}>{currentIndex + 1}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={handleNext} disabled={currentIndex === items.length - 1}>
            <Icon name="chevron-right" size={30} color={currentIndex === items.length - 1 ? "#CCC" : "#FFA500"} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>ปิด</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  exerciseImage: {
    borderRadius: 20,
    width: '95%',
    height: 300,
    marginTop: 40,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 22,
    color: '#333',
    fontFamily: 'appfont_02',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    marginLeft: 4,
    fontSize: 18,
    color: '#FFA500',
    fontFamily: 'appfont_01',
  },
  description: {
    fontSize: 18,
    color: '#555',
    margin: 16,
    fontFamily: 'appfont_01',
  },
  sectionTitle: {
    fontSize: 22,
    color: '#333',
    marginVertical: 8,
    marginHorizontal: 16,
    fontFamily: 'appfont_02',
  },
  muscleImage: {
    borderRadius: 20,
    width: '95%',
    height: 300,
    alignSelf: 'center',
    marginVertical: 20,
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
    fontFamily: 'appfont_01',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  buttonnav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textpage: {
    fontSize: 18,
    marginHorizontal: 16,
    color: '#FFA500',
    fontFamily: 'appfont_01',
  },
  navButton: {
    padding: 8,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    backgroundColor: '#F6A444',
    borderRadius: 50,
  },
  closeText: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: 'appfont_01',
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default Description;
