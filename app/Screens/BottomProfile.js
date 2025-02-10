import React, { useState, useEffect, useCallback  } from "react";
import { Image } from 'expo-image';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, DeviceEventEmitter, TextInput, Alert, LogBox } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { fetchUserProfile, updateUserProfile, uploadFile } from './api';
import cross from '../../assets/image/Clothing-Icon/cross-icon-01.png';
import edit from '../../assets/image/Clothing-Icon/edit-icon-02.png';

LogBox.ignoreAllLogs(); // ปิดข้อความแจ้งเตือนทั้งหมด (ใช้ในกรณีจำเป็นเท่านั้น)

const CustomAlertimage = ({ visible, onClose }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.customAlertContainer}>
      <View style={styles.customAlertBox}>
        <Text style={styles.customAlertTitle}>ยกเลิกการเลือกรูป</Text>
        <Text style={styles.customAlertMessage}>คุณได้ยกเลิกการเลือกรูปภาพแล้ว</Text>
        <TouchableOpacity style={styles.customAlertButton} onPress={onClose}>
          <Text style={styles.customAlertButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const CustomAlertdata = ({ visible, onConfirm, onCancel }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onCancel}
  >
    <View style={styles.customAlertContainer}>
      <View style={styles.customAlertBox}>
        <Text style={styles.customAlertTitle}>ยกเลิกการแก้ไข</Text>
        <Text style={styles.customAlertMessage}> คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการแก้ไข? ข้อมูลที่เปลี่ยนแปลงจะไม่ถูกบันทึก</Text>
        <View style={styles.buttonText}>
          <TouchableOpacity style={styles.customAlertButton} onPress={onConfirm}>
            <Text style={styles.customAlertButtonText}>ใช่</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.customAlertButton} onPress={onCancel}>
            <Text style={styles.customAlertButtonText}>ไม่</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const CustomAlertsaveProfile = ({ visible, onClose }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.customAlertContainer}>
      <View style={styles.customAlertBox}>
        <Text style={styles.customAlertTitle}>บันทึกโปรไฟล์</Text>
        <Text style={styles.customAlertMessage}>โปรไฟล์ของคุณได้รับการบันทึกแล้ว</Text>
        <TouchableOpacity style={styles.customAlertButton} onPress={onClose}>
          <Text style={styles.customAlertButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const ProfileButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(require("../../assets/image/profile02.png"));
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);  // สถานะใหม่สำหรับการบันทึก
  const [username, setUsername] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [birthday, setBirthday] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [level, setLevel] = useState("");
  const [isImageUpdated, setIsImageUpdated] = useState(false); // สถานะใหม่สำหรับการอัปเดตรูปภาพ
  const [originalProfileImage, setOriginalProfileImage] = useState(profileImage);
  const [originalData, setOriginalData] = useState({});
  const [isAlertVisible, setAlertVisible] = useState(false); // สถานะสำหรับ Custom Alert
  const [isDataAlertVisible, setDataAlertVisible] = useState(false); // สถานะสำหรับ CustomAlertdata
  const [isSaveAlertVisible, setSaveAlertVisible] = useState(false); // สถานะสำหรับ CustomAlertsaveProfile

  const navigation = useNavigation();

  // ฟังก์ชันโหลดข้อมูลจาก AsyncStorage ก่อน
  const loadUserProfileFromStorage = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      const storedLevel = await AsyncStorage.getItem('level');
      // const storedProfileImage = await AsyncStorage.getItem('profileImage');

      if (storedUsername) setUsername(storedUsername);
      if (storedLevel !== null) setLevel(JSON.parse(storedLevel)); // แปลงค่า level กลับจาก string เป็น number
      // if (storedProfileImage) setProfileImage({ uri: storedProfileImage });
    } catch (error) {
      console.error("Failed to load user profile from storage", error);
    }
  };

  // ฟังก์ชันโหลดข้อมูลจาก API
  const loadUserProfileFromAPI = async () => {
    const token = await AsyncStorage.getItem('jwt');
    const userId = await AsyncStorage.getItem('userId');
    if (!token || !userId) return;

    try {
      const userData = await fetchUserProfile(userId, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsername(userData.username);
      setWeight(userData.weight);
      setHeight(userData.height);
      setBmi(userData.BMI);
      setBirthday(userData.birthday);
      setAge(userData.age);
      setGender(transformGenderToThai(userData.selectedGender));
      setLevel(userData.level);

      const profileImageUrl = userData.picture?.formats?.medium?.url;
      if (profileImageUrl) {
        setProfileImage({ uri: profileImageUrl });
        setOriginalProfileImage({ uri: profileImageUrl });
      }

      setOriginalData({
        username: userData.username,
        weight: userData.weight,
        height: userData.height,
        bmi: userData.BMI,
        birthday: userData.birthday,
        age: userData.age,
        gender: transformGenderToThai(userData.selectedGender),
      });

      // บันทึกข้อมูลล่าสุดลงใน AsyncStorage
      await AsyncStorage.setItem('username', userData.username);
      await AsyncStorage.setItem('level', JSON.stringify(userData.level)); // บันทึก level เป็น string
      if (profileImageUrl) {
        await AsyncStorage.setItem('profileImage', profileImageUrl);
      }

    } catch (error) {
      Alert.alert("Error", "Failed to load user profile.");
    }
  };

  useEffect(() => {
    loadUserProfileFromStorage(); // โหลดข้อมูลจาก AsyncStorage ก่อน
    loadUserProfileFromAPI(); // อัปเดตข้อมูลจาก API หลังจากนั้น
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('bmiUpdated', async () => {
      console.log("BMI Updated, fetching new data...");
      await loadUserProfileFromAPI(); // โหลดข้อมูลใหม่
    });
  
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('profileUpdated', async () => {
      console.log("Profile Updated, fetching new data...");
      await loadUserProfileFromAPI(); // โหลดข้อมูลใหม่
    });
  
    return () => {
      subscription.remove();
    };
  }, []);  

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('WeightRecordsUpdated', async ({ bmi }) => {
      console.log("Weight Updated, fetching new data...");
      await loadUserProfileFromAPI(); // โหลดข้อมูลใหม่
      console.log("WeightRecordsUpdated BMI:", bmi); // ตรวจสอบค่า BMI ที่ส่งมา
    });
  
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('bmiUpdated', async () => {
      console.log("BMI Updated, fetching new data...");
      await loadUserProfileFromAPI(); // โหลดข้อมูลใหม่จาก API
    });
  
    return () => {
      subscription.remove(); // ลบ Listener เมื่อ Component ถูก Unmount
    };
  }, []);
  
  
  const transformGenderToThai = (gender) => {
    switch(gender) {
      case 'male':
        return 'ชาย';
      case 'female':
        return 'หญิง';
      default:
        return gender;
    }
  };

  const pickImage = async () => {
    try {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('ขออภัย เราต้องการสิทธิ์เข้าถึงกล้องเพื่อเปลี่ยนรูปโปรไฟล์');
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (result.cancelled) {
            setAlertVisible(true); // แสดง Custom Alert เมื่อผู้ใช้ยกเลิกการเลือกรูป
        } else {
            setProfileImage({ uri: result.assets[0].uri });
            setIsImageUpdated(true);
        }
    } catch (error) {
        console.error('Error picking image:', error);
        setAlertVisible(true); // แสดง Custom Alert เมื่อเกิดข้อผิดพลาด
    }
  };

  const handleCancel = () => {
    setUsername(originalData.username);
    setWeight(originalData.weight);
    setHeight(originalData.height);
    setBirthday(originalData.birthday);
    setAge(originalData.age);
    setGender(originalData.gender);
    setProfileImage(originalProfileImage); // คืนค่ารูปภาพเดิม
    setIsEditing(false);
  };

  const handleModalClose = () => {
    if (isEditing) {
      setDataAlertVisible(true); // แสดง CustomAlertdata
    } else {
      setModalVisible(false);
    }
  };

  const confirmModalClose = () => {
    setModalVisible(false);
    setIsEditing(false);
    setIsImageUpdated(false);
    setProfileImage(originalProfileImage);
    setUsername(originalData.username);
    setWeight(originalData.weight);
    setHeight(originalData.height);
    setBirthday(originalData.birthday);
    setAge(originalData.age);
    setGender(originalData.gender);
    setDataAlertVisible(false);
  };

  const saveProfile = async () => {
    const token = await AsyncStorage.getItem('jwt');
    const userId = await AsyncStorage.getItem('userId');
    if (!token || !userId) return;

    setIsSaving(true); // ปิดการใช้งานปุ่มบันทึกทันทีที่เริ่มการบันทึก

    try {
      let pictureId = null;

      if (isImageUpdated) { // อัปโหลดรูปโปรไฟล์ใหม่ถ้ามีการแก้ไข
        const fileExtension = profileImage.uri.split('.').pop();
        let mimeType = 'image/jpeg';
        if (fileExtension === 'png') {
          mimeType = 'image/png';
        }

        const formData = new FormData();
        formData.append('files', {
          uri: profileImage.uri,
          name: `profile-image.${fileExtension}`,
          type: mimeType,
        });

        // เรียกใช้งานฟังก์ชัน uploadFile
        const uploadData = await uploadFile(formData, token);

        pictureId = uploadData[0].id;
      }

      // สร้างอ็อบเจ็กต์สำหรับอัปเดตโปรไฟล์ผู้ใช้
      const updatedData = {
        username: username,
        age: age,
      };

      if (pictureId) {
        updatedData.picture = pictureId; // อัปเดตรูปโปรไฟล์ถ้ามีการอัปโหลดใหม่
      }

      // อัปเดตโปรไฟล์ผู้ใช้
      const response = await updateUserProfile(userId, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to update profile');
      }

      setIsEditing(false);
      setModalVisible(false);
      setSaveAlertVisible(true); // แสดง CustomAlertsaveProfile เมื่อบันทึกสำเร็จ    

      // บันทึกข้อมูลที่อัปเดตลงใน AsyncStorage
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('level', JSON.stringify(level)); // บันทึก level เป็น string
      if (profileImage.uri) {
        await AsyncStorage.setItem('profileImage', profileImage.uri);
      }

      DeviceEventEmitter.emit('profileUpdated'); // แจ้งเตือนให้ BottomProfile โหลดข้อมูลใหม่
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsSaving(false); // เปิดใช้งานปุ่มบันทึกอีกครั้งเมื่อการบันทึกเสร็จสิ้น
      setIsImageUpdated(false); // รีเซ็ตสถานะการอัปเดตรูปภาพ
    }
  };

  // ฟังก์ชันแปลง BMI เป็นข้อความ
  const getBMIStatus = (bmi) => {
    if (!bmi) return "ไม่มีข้อมูล";
    const bmiValue = parseFloat(bmi); // แปลงค่า BMI เป็นตัวเลข
    if (bmiValue < 18.6) return "ผอมเกินไป";
    if (bmiValue < 25.0) return "น้ำหนักปกติ";
    if (bmiValue < 30.0) return "น้ำหนักเริ่มมาก";
    return "อ้วนมาก";
  };
  
  const logout = async () => {
    try {
      // ลบ token ออกจาก AsyncStorage
      await AsyncStorage.removeItem('token');
      
      // ปิดโมดอล (ถ้ามี)
      setModalVisible(false);
  
      // เปลี่ยนหน้าไปยังหน้า Login
      navigation.navigate('Login');
  
      console.log('User logged out');
    } catch (error) {
      console.error('Error during logout:', error);
      // คุณสามารถแสดงข้อความแจ้งเตือนหรือจัดการข้อผิดพลาดได้ที่นี่
    }
  };  

  return (
    <View style={styles.profileContainer}>
      <View style={styles.levelCircle}>
      <Text style={styles.levelText}>{level}</Text> 
      </View>
      <TouchableOpacity
        style={styles.usernameContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.usernameText}>{username}</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose} // ใช้ handleModalClose แทน
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={handleModalClose} // ใช้ handleModalClose แทน
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
                <Text style={styles.profileText}>Lv {level}</Text>
              </View>
              {isEditing && (
                <TouchableOpacity style={styles.editButton} onPress={pickImage}>
                  <Text style={styles.editButtonText}>แก้ไข</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                  <Text style={styles.logoutButtonText}>ล็อกเอ้า</Text>
              </TouchableOpacity>
              <View style={styles.insidepersonalInformation}>
                <View style={styles.profileDetails}>
                  {isEditing ? (
                    <>
                      <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>ชื่อผู้ใช้:</Text>
                        <TextInput
                          style={styles.input}
                          value={username}
                          onChangeText={setUsername}
                          placeholder="ชื่อเล่น"
                        />
                      </View>
                      {/* <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>น้ำหนัก:</Text>
                        <TextInput
                          style={styles.input}
                          value={weight}
                          onChangeText={setWeight}
                          keyboardType="numeric"
                          placeholder="น้ำหนัก (kg)"
                        />
                      </View> */}
                      {/* <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>ส่วนสูง:</Text>
                        <TextInput
                          style={styles.input}
                          value={height}
                          onChangeText={setHeight}
                          keyboardType="numeric"
                          placeholder="ส่วนสูง (cm)"
                        />
                      </View> */}
                      {/* <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>วันเกิด:</Text>
                        <TextInput
                          style={styles.input}
                          value={birthday}
                          onChangeText={setBirthday}
                          placeholder="วว/ดด/คศ"
                        />
                      </View> */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.labelText}>อายุ:</Text>
                        <TextInput
                          style={styles.input}
                          value={age}
                          onChangeText={setAge}
                          keyboardType="numeric"
                          placeholder="อายุ (age)"
                        />
                      </View>
                      <View style={styles.buttonGroup}>
                        <TouchableOpacity onPress={saveProfile} style={styles.saveButton} disabled={isSaving}>
                          <Text style={styles.saveButtonText}>{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCancel} style={styles.backButton} disabled={isSaving}>
                          <Text style={styles.backButtonText}>ยกเลิก</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.headText}>{username || "ไม่มีข้อมูล"}</Text>
                      <Text style={styles.detailText}>ส่วนสูง: {height || "ไม่มีข้อมูล"} เซนติเมตร</Text>
                      <Text style={styles.detailText}>น้ำหนัก: {weight || "ไม่มีข้อมูล"} กิโลกรัม</Text>
                      {/* <Text style={styles.detailText}>วันเกิด: {birthday || "ไม่มีข้อมูล"}</Text> */}
                      <Text style={styles.detailText}>อายุ: {age || "ไม่มีข้อมูล"} ปี</Text>
                      <Text style={styles.detailText}>เพศ: {gender || "ไม่มีข้อมูล"}</Text>
                      <Text style={styles.detailText}>BMI: {bmi ? `${bmi} (${getBMIStatus(bmi)})` : "ไม่มีข้อมูล"}</Text>
                      {/* <Text style={styles.detailText}>BMI: {bmi ? `${getBMIStatus(bmi)}` : "ไม่มีข้อมูล"}</Text> */}
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
      {/* Render the custom alerts */}
      <CustomAlertimage visible={isAlertVisible} onClose={() => setAlertVisible(false)} />
      <CustomAlertdata visible={isDataAlertVisible} onConfirm={confirmModalClose} onCancel={() => setDataAlertVisible(false)}/>
      <CustomAlertsaveProfile visible={isSaveAlertVisible} onClose={() => setSaveAlertVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: { flexDirection: "row", alignItems: "center" },
  levelCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "white", justifyContent: "center", alignItems: "center", borderColor: "#FFCC00", borderWidth: 5, marginRight: -10, zIndex: 1 },
  levelText: { fontSize: 28, fontFamily: "appfont_02" },
  usernameContainer: { backgroundColor: "white", borderRadius: 8, paddingVertical: 5, paddingLeft: 24, paddingRight: 10, marginLeft: -8 },
  usernameText: { fontSize: 18, fontFamily: "appfont_02" },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { width: "90%", backgroundColor: "#FFAF32", borderRadius: 20, padding: 12, borderWidth: 12, borderColor: "#F9E79F" },
  modalHeader: { width: "100%", alignItems: "flex-end" },
  closeButton: { width: 45, height: 45, right: -35, top: -35, justifyContent: "center", alignItems: "center", position: "absolute" },
  crossIcon: { width: 40, height: 40 },
  profileInfo: { flexDirection: "row" },
  insideProfile: { width: 86, height: 86, borderRadius: 2, justifyContent: "center", alignItems: "center", borderColor: "#9E640A", borderWidth: 6, marginRight: 20 },
  profileImage: { width: 76, height: 76 },
  profileText: { fontSize: 14, width: 35, color: "white", fontFamily: "appfont_02", backgroundColor: "rgba(0, 0, 0, 0.5)", top: 52, right: 1, position: "absolute", textAlign: "center" },
  insidepersonalInformation: { width: "65%", height: 180, borderRadius: 8, backgroundColor: "#F9E79F", borderColor: "#E97424", borderWidth: 4, marginRight: 20 },
  editdepersonalInformation: { width: 45, height: 45, position: "absolute", justifyContent: "center", alignItems: "center", right: -2 },
  editIcon: { width: 20, height: 20 },
  profileDetails: { padding: 5 },
  inputGroup: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  labelText: { fontSize: 16, width: 50, fontFamily: "appfont_02", color: "#000", marginRight: 10 },
  input: { backgroundColor: "white", color: "black", borderRadius: 5, borderWidth: 1, borderColor: "#ccc", marginBottom: -5, paddingLeft: 10, fontSize: 16, fontFamily: "appfont_02", flex: 0.9, textAlign: "left" },
  headText: { fontSize: 24, color: "#000", fontFamily: "appfont_02", marginBottom: -1, textAlign: "center" },
  detailText: { fontSize: 16, color: "#000", fontFamily: "appfont_02", marginBottom: 4 },
  editButton: { width: 80, height: 30, backgroundColor: "#E97424", borderRadius: 30, justifyContent: "center", alignItems: "center", position: "absolute", top: 90, left: 3 },
  editButtonText: { fontSize: 18, textAlign: "center", color: "white", fontFamily: "appfont_02" },
  buttonGroup: { flexDirection: "row", justifyContent: "space-between", width: "100%", top: 25 },
  saveButton: { width: 95, height: 30, backgroundColor: "green", borderRadius: 30, justifyContent: "center", alignItems: "center" },
  saveButtonText: { fontSize: 18, textAlign: "center", color: "white", fontFamily: "appfont_02" },
  backButton: { width: 95, height: 30, backgroundColor: "#e59400", borderRadius: 30, justifyContent: "center", alignItems: "center" },
  backButtonText: { fontSize: 18, textAlign: "center", color: "white", fontFamily: "appfont_02" },
  logoutButton: { width: 95, height: 30, backgroundColor: "#6b1d1d", borderRadius: 30, justifyContent: "center", alignItems: "center", position: "absolute", bottom: 1 },
  logoutButtonText: { fontSize: 18, textAlign: "center", color: "white", fontFamily: "appfont_02" },
  customAlertContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  customAlertBox: { width: 320, padding: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#F9E79F", borderColor: "#E97424", borderWidth: 6 },
  buttonText: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  customAlertTitle: { fontSize: 20, fontFamily: "appfont_02", marginBottom: 3 },
  customAlertMessage: { fontSize: 16, fontFamily: "appfont_01", marginBottom: 10 },
  customAlertButtonText: { fontSize: 18, textAlign: "center", color: "white", fontFamily: "appfont_02" },
  customAlertButton: { backgroundColor: "#e59400", color: "white", borderRadius: 10, padding: 2, alignItems: "center", width: "25%" },
});

export default ProfileButton;
