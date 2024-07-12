import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Question = () => {
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ข้อมูลส่วนตัว</Text>
      <Text style={styles.subtitle}>ทำให้เรารู้จักกับคุณมากขึ้น</Text>
      <TextInput style={styles.input} placeholder="ชื่อ :" />
      <TextInput style={styles.input} placeholder="ส่วนสูง :" />
      <TextInput style={styles.input} placeholder="น้ำหนักปัจจุบัน :" />
      <TextInput style={styles.input} placeholder="วันเกิด : วว/ดด/ปปปป" />

      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[styles.genderButton, selectedGender === 'male' && styles.selectedGenderButton]}
          onPress={() => setSelectedGender('male')}
        >
          <Icon name="gender-male" size={40} color={selectedGender === 'male' ? '#FFF' : '#FFA500'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderButton, selectedGender === 'female' && styles.selectedGenderButton]}
          onPress={() => setSelectedGender('female')}
        >
          <Icon name="gender-female" size={40} color={selectedGender === 'female' ? '#FFF' : '#FFA500'} />
        </TouchableOpacity>
      </View>

      <View style={styles.animalContainer}>
        <TouchableOpacity
          style={[styles.animalButton, selectedAnimal === 'cat' && styles.selectedAnimalButton]}
          onPress={() => setSelectedAnimal('cat')}
        >
          <Image source={require('../../assets/image/cat.png')} style={styles.animalIcon} tintColor={selectedAnimal === 'cat' ? '#FFF' : '#FFA500'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.animalButton, selectedAnimal === 'dog' && styles.selectedAnimalButton]}
          onPress={() => setSelectedAnimal('dog')}
        >
          <Image source={require('../../assets/image/dog.png')} style={styles.animalIcon} tintColor={selectedAnimal === 'dog' ? '#FFF' : '#FFA500'} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.startButton}>
        <Text style={styles.startButtonText}>เริ่มต้น</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  title: {
    fontFamily: 'appfont_01',
    fontSize: 35,
    textAlign: 'center',
    marginVertical: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'appfont_01', 
  },
  input: {
    height: 45,
    width: '85%',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    alignSelf: 'center',
    fontSize: 16,
    fontFamily: 'appfont_01',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  genderButton: {
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
    padding: 16,
    width: 140,
    alignItems: 'center',
    height: 70,
  },
  selectedGenderButton: {
    backgroundColor: '#FFA500',
  },
  animalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 30,
  },
  animalButton: {
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 8,
    padding: 16,
    width: 140,
    alignItems: 'center',
    height: 140,
  },
  selectedAnimalButton: {
    backgroundColor: '#FFA500',
  },
  animalIcon: {
    width: 100,
    height: 100,
  },
  startButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 15,
    marginTop: 32,
    borderRadius: 50,
    width: 320,
    marginTop: 20,
    alignSelf: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'appfont_01',
    textAlign: 'center',
  },
});

export default Question;
