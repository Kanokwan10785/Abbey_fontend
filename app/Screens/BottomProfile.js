import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Platform, TextInput } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import cross from '../../assets/image/Clothing-Icon/cross-icon-01.png';
import edit from '../../assets/image/Clothing-Icon/edit-icon-02.png';

const ProfileButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(require("../../assets/image/123.jpg"));
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("AEK IEIEIE");
  const [weight, setWeight] = useState("56kg");
  const [height, setHeight] = useState("178cm");
  const [birthday, setBirthday] = useState("12/12/2555");
  const [age, setAge] = useState("11ปี");
  const [gender, setGender] = useState("ชาย");

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('ขออภัย เราต้องการสิทธิ์เข้าถึงกล้องเพื่อเปลี่ยนรูปโปรไฟล์');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setProfileImage({ uri: result.uri });
    }
  };

  return (
    <View style={styles.profileContainer}>
      <View style={styles.levelCircle}>
        <Text style={styles.levelText}>13</Text>
      </View>
      <TouchableOpacity
        style={styles.usernameContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.usernameText}>AEK</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setModalVisible(!modalVisible)}
                style={styles.closeButton}
              >
                <Image source={cross} style={styles.crossIcon} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.insideProfile}>
                <Image
                  source={profileImage}
                  style={styles.profileImage}/>
                <Text style={styles.profileText}>Lv 00</Text>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={pickImage}>
                   <Text style={styles.editButtonText}>แก้ไข</Text>
              </TouchableOpacity>
              <View style={styles.insidepersonalInformation}>
                <View style={styles.profileDetails}>
                  {isEditing ? (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>ชื่อ:</Text>
                        <TextInput
                          style={styles.input}
                          value={name}
                          onChangeText={setName}
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>น้ำหนัก:</Text>
                        <TextInput
                          style={styles.input}
                          value={weight}
                          onChangeText={setWeight}
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>ส่วนสูง:</Text>
                        <TextInput
                          style={styles.input}
                          value={height}
                          onChangeText={setHeight}
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>วันเกิด:</Text>
                        <TextInput
                          style={styles.input}
                          value={birthday}
                          onChangeText={setBirthday}
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>อายุ:</Text>
                        <TextInput
                          style={styles.input}
                          value={age}
                          onChangeText={setAge}
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>เพศ:</Text>
                        <TextInput
                          style={styles.input}
                          value={gender}
                          onChangeText={setGender}
                        />
                      </View>
                      <TouchableOpacity onPress={() => setIsEditing(false)}>
                        <Text style={styles.saveButton}>บันทึก</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.headText}>{name}</Text>
                      <Text style={styles.detailText}>น้ำหนัก: {weight}</Text>
                      <Text style={styles.detailText}>ส่วนสูง: {height}</Text>
                      <Text style={styles.detailText}>วันเกิด: {birthday}</Text>
                      <Text style={styles.detailText}>อายุ: {age}</Text>
                      <Text style={styles.detailText}>เพศ: {gender}</Text>
                    </>
                  )}
                  {!isEditing && (
                    <TouchableOpacity
                      style={styles.editdepersonalInformation}
                      onPress={() => setIsEditing(true)}
                    >
                      <Image source={edit} style={styles.editIcon} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#FFCC00",
    borderWidth: 5,
    marginRight: -10,
    zIndex: 1,
  },
  levelText: {
    fontSize: 28,
    fontFamily: "appfont_02",
  },
  usernameContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 25,
    marginLeft: -8,
  },
  usernameText: {
    fontSize: 18,
    fontFamily: "appfont_02",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFAF32",
    borderRadius: 20,
    padding: 12,
    borderWidth: 12,
    borderColor: "#F9E79F",
  },
  modalHeader: {
    width: "100%",
    alignItems: "flex-end",
  },
  closeButton: {
    width: 45,
    height: 45,
    right: -35,
    top: -35,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  crossIcon: {
    width: 40,
    height: 40,
  },
  profileInfo: {
    flexDirection: "row",
  },
  insideProfile: {
    width: 86,
    height: 86,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#9E640A",
    borderWidth: 6,
    marginRight: 20,
  },
  profileImage: {
    width: 76,
    height: 76,
  },
  profileText: {
    fontSize: 16,
    color: "white",
    fontFamily: "appfont_02",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    top: 54,
    right: 2,
    position: "absolute",
  },
  insidepersonalInformation: {
    width: "65%",
    height: "100%", // เพิ่มความสูงของกล่องโปรไฟล์ให้พอดีกับข้อมูลที่เพิ่มขึ้น
    borderRadius: 8,
    backgroundColor: "#F9E79F",
    borderColor: "#E97424",
    borderWidth: 4,
    marginRight: 20,
  },
  editdepersonalInformation: {
    width: 45,
    height: 45,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    right: -2,
  },
  editIcon: {
    width: 20,
    height: 20,
  },
  profileDetails: {
    padding: 5,
    // alignItems: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelText: {
    fontSize: 16,
    fontFamily: "appfont_02",
    color: "#000",
    marginRight: 10,
  },
  headText: {
    fontSize: 24,
    color: "#000",
    fontFamily: "appfont_02",
    marginBottom: -1,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "appfont_02",
    marginBottom: 4,
  },
  editButton: {
    width: 80,
    height: 30,
    backgroundColor: "#E97424",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: "50%",
    left: 3,
  },
  editButtonText: {
    fontSize: 18,
    textAlign: 'center',
    color: "white",
    fontFamily: "appfont_02",
  },
  input: {
    fontSize: 16,
    fontFamily: "appfont_02",
    color: "#000",
    backgroundColor: "#FFF",
    paddingLeft: 15,
    marginVertical: 2,
    borderRadius: 8,
    flex: 1,  // เพิ่ม flex: 1 เพื่อให้ช่อง input ขยายเต็มที่
  },
  saveButton: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: "appfont_02",
    backgroundColor: "green",
    padding: 2,
    borderRadius: 8,
    top: 4,
  },
});

export default ProfileButton;
