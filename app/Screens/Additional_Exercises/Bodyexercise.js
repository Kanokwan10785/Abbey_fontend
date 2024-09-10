// import React from 'react';
// import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import BottomBar from '../BottomBar';
// import { useNavigation } from '@react-navigation/native';
// import ex1 from '../../../assets/image/ex1.gif';
// import ex2 from '../../../assets/image/ex2.gif';
// import ex3 from '../../../assets/image/ex3.gif';
// import ex4 from '../../../assets/image/ex4.gif';

// const courses = [
//     {
//         id: '1',
//         title: 'บรรเทาอาการปวดหลัง',
//         description: 'ท่ายืดกล้ามเนื้อง่ายๆ บริเวณช่วงที่หลัง',
//         image: require('../../../assets/image/image-ex/knee.png'),
//         duration: '1:00 น',
//         exercises: [
//             { id: '1', image: ex1, name: 'ท่ากระโดดตบ', duration: '00:30 น' },
//             { id: '2', image: ex2, name: 'ท่าปั่นขา', duration: '00:30 น' },
//             { id: '3', image: ex3, name: 'ท่าแพลงก์', duration: '00:30 น' },
//             { id: '4', image: ex4, name: 'ท่ายกขา', duration: '00:30 น' }
//         ],
//     },
//     {
//         id: '2',
//         title: 'บรรเทาอาการคอตึง',
//         description: 'ท่ายืดกล้ามเนื้อง่ายๆ บริเวณคอ',
//         image: require('../../../assets/image/image-ex/knee.png'),
//         duration: '2:00 น',
//         exercises: [
//             { id: '1', image: ex1, name: 'ท่ายกแขน', duration: '00:30 น' },
//             { id: '2', image: ex2, name: 'ท่าหมุนหัว', duration: '00:30 น' }
//         ],
//     },
// ];

// const Bodyexercise = () => {
//     const navigation = useNavigation();

//     const renderCourse = ({ item }) => (
//         <TouchableOpacity
//             style={styles.exerciseItem}
//             onPress={() => {
//                 // นำทางไปยังหน้า Addexercises พร้อมส่งข้อมูลคอร์สไปด้วย
//                 navigation.navigate('Addexercises', { course: item });
//                 console.log('Selected course:', item);
//             }}
//         >
//             <Image source={item.image} style={styles.courseImage} />
//             <View style={styles.courseDetails}>
//                 <Text style={styles.courseName}>{item.title}</Text>
//                 <View style={styles.courseInfo}>
//                     <Icon name="clock-outline" size={16} color="#F6A444" />
//                     <Text style={styles.courseDuration}>{item.duration}</Text>
//                     <Icon name="dumbbell" size={16} color="#F6A444" />
//                     <Text style={styles.courseExerciseCount}>{item.exercises.length} ท่า</Text>
//                 </View>
//             </View>
//         </TouchableOpacity>
//     );

//     return (
//         <View style={styles.container}>
//             <FlatList
//                 data={courses}
//                 renderItem={renderCourse}
//                 keyExtractor={item => item.id}
//             />
//             <BottomBar />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FFF',
//     },
//     exerciseItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 10,
//         backgroundColor: '#FFF6D6',
//         marginVertical: 10,
//         borderRadius: 10,
//     },
//     courseImage: {
//         width: 80,
//         height: 50,
//         borderRadius: 10,
//     },
//     courseDetails: {
//         flex: 1,
//         marginLeft: 10,
//     },
//     courseName: {
//         fontSize: 16,
//         fontWeight: 'bold',
//     },
//     courseInfo: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 5,
//     },
//     courseDuration: {
//         marginLeft: 5,
//         marginRight: 10,
//         fontSize: 14,
//         color: '#666',
//     },
//     courseExerciseCount: {
//         fontSize: 14,
//         color: '#666',
//     },
// });

// export default Bodyexercise;
