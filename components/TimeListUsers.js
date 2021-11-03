import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Button, Alert, ImageBackground,  } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import firebase from "firebase";

export default function TimeListUsers({ navigation }) {
  const [times, setTimes] = useState();
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (!times) {
      //Selects the table/document table
      let query = firebase.database().ref("/Times/");

      //Performs the query
      query
        .orderByChild("status")
        .equalTo(1)
        .on("value", (snapshot) => {
          const data = snapshot.val();
          setTimes(data);
        });

      //Finder locations
      let queryLocation = firebase.database().ref(`/Locations/`);
      queryLocation.on("value", (snapshot) => {
        const data2 = snapshot.val();
        setLocations(data2);
      });
    }
  }),
    [];

  if (!times) {
    //If no times, return here and end the function.
    return <Text>Ingen tilgængelige tider.</Text>;
  }
  //Array with all the objects from the query
  const timesArray = Object.values(times);
  //Array with the keys (id) to the the objects above
  const timesKeys = Object.keys(times);

  //Array with all the objects from the query
  const locationsArray = Object.values(locations);
  //Array with the keys (id) to the the objects above
  const locationsKeys = Object.keys(locations);

  //Render item required for flatlist. Shows how to render each item in the list.
  const renderItem = ({ item, index }) => {
    //Find locationindex, hvorefter lokations detaljerne kan findes
    let locationIndex = locationsKeys.findIndex((e) => {
      return e === item.location;
    });
    let location = locationsArray[locationIndex];
    const date = new Date(item.date);
    //Hvis der er en dato (tidligere indtastet data, har ikke dato. Derfor dette, så der ikke opstår fejl)
    if (item.date) {
      return (
        <View style={styles.container}>
          <Text>{`Tid: Kl. ${item.time}, d. ${date.getDate()}/${
            date.getMonth() + 1
          }-${date.getFullYear()}. Sted: ${item.clinic}, ${
            location ? location.name : item.location.name
          }. Pris: ${item.price}`}</Text>
          <View style={styles.button}>
            <Button
              title="Book"
              onPress={() => {
                confirmBooking(item, index);
              }}
            ></Button>
          </View>
        </View>
      );
    }
    return (
    
      <View style={styles.container}>
        <Text>{`Tid: ${item.time}. Sted: ${item.clinic}, ${
          location ? location.name : ""
        }. Pris: ${item.price}`}</Text>
        <View style={styles.button}>
          <Button
            title="Book"
            onPress={() => {
              confirmBooking(item, index);
            }}
          ></Button>
        </View>
      </View>
    );
  };
  //Confirmation of the booking is required, so to prevent accidental bookings.
  const confirmBooking = (item, index) => {
    Alert.alert("Er du sikker på?", "Vil du booke denne tid?", [
      { text: "Fortryd", style: " cancel" },
      {
        text: "Book Tid",
        style: "default",
        onPress: () => {
          handleConfirm(item, index);
        },
      },
    ]);
  };
  //Hvad der skal ske, hvis der confirmes
  const handleConfirm = (item, index) => {
    const id = timesKeys[index];
    const bookingsRef = firebase.database().ref(`/Bookings/`);
    bookingsRef.push({ time_id: id, customer_name: "Jens Ole" });
    //Sætter status 0, så denne ikke længere ses, samt lagrer booking i 'Bookings'
    firebase.database().ref(`/Times/${id}`).update({ status: 0 });
  };
  return (
    <ImageBackground style={styles2.container} source={require("../assets/salongro1.jpg")}>
    <SafeAreaView style={{height: "100%"}}>
  

      <FlatList 
        data={timesArray}
        renderItem={renderItem}
        keyExtractor={(item, index) => timesKeys[index]}
      ></FlatList>
    </SafeAreaView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    margin: 5,
    padding: 5,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  button: {
    flex: 0,
    width: "20%",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
  label: { fontWeight: "bold" },
});

const styles2 = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
});
