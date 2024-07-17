import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';

const ProfileButton = () => (
    <View style={styles.profileContainer}>
      <View style={styles.levelCircle}>
        <Text style={styles.levelText}>13</Text>
      </View>
      <TouchableOpacity style={styles.usernameContainer} onPress={() => alert('เปิดหน้าต่างโปรไฟล์')}>
        <Text style={styles.usernameText}>AEK</Text>
      </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFCC00',
    borderWidth: 5,
    marginRight: -10,
    zIndex: 1,
  },    
  levelText: {
    fontSize: 28,
    fontFamily: 'appfont_02',
  },
  usernameContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 25,
    marginLeft: -8,
  },
  usernameText: {
    fontSize: 18,
    fontFamily: 'appfont_02',
  },
});
export default ProfileButton;