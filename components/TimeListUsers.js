import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import GlobalStyles from "../styles/GlobalStyles";

import { getDistance } from "geolib";

import firebase from "firebase";

export default function TimeListUsers({ navigation }) {
  const [times, setTimes] = useState();
  const [locations, setLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [timesWithDistance, setTimesWithDistance] = useState();

  useEffect(() => {
    const requestLocationAccess = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      let userLocation = await Location.getCurrentPositionAsync({});
      setUserLocation(userLocation);
    };
    requestLocationAccess();
    if (!times) {
      //Vælger tabellen/dokument tabellen
      let query = firebase.database().ref("/Times/");
      //Performs the query
      query
        .orderByChild("status")
        .equalTo(1)
        .on("value", (snapshot) => {
          let data = snapshot.val();
          if (userLocation) {
            let dataValues = Object.values(data);
            let dataKeys = Object.keys(data);

            //Få id med i objektet, samt distance beregninger
            let dataDistance = dataValues.map((el, index) => ({
              id: dataKeys[index],
              ...el,
              distance:
              //Beregn distance mellem lokations koordinater og brugeren.
                el.location.lon && el.location.lan
                  ? getDistance(
                      {
                        longitude: userLocation.coords.longitude,
                        latitude: userLocation.coords.latitude,
                      },
                      { longitude: el.location.lon, latitude: el.location.lan }
                    )
                  : false,
            }));
            setTimesWithDistance(dataDistance);
          }
          setTimes(data);
        });
    }
  }),
    [];

  if (!times) {
    //Hvis ingen tider, return.
    return (
      <SafeAreaView>
        <Text>Ingen tilgængelige tider.</Text>
      </SafeAreaView>
    );
  }
  //Array with the keys (id) to the the objects above
  const timesKeys = Object.keys(times);

  //Render item required for flatlist. Shows how to render each item in the list.
  const renderItem = ({ item, index }) => {
    const date = new Date(item.date);
    //Hvis der er en dato (tidligere indtastet data, har ikke dato. Derfor dette, så der ikke opstår fejl)
    if (item.date) {
      return (
        <View style={GlobalStyles.container}>
          <Text>{`Tid: Kl. ${item.time}, d. ${date.getDate()}/${
            date.getMonth() + 1
          }-${date.getFullYear()}. Sted: ${
            item.location.addressString
              ? item.location.addressString
              : item.clinic
          }. Udbyder: ${item.clinic}. Pris: ${item.price}. Distance: ${
            item.distance ? `${item.distance}m` : `Kan ikke findes.`
          }`}</Text>
          <View style={GlobalStyles.button}>
            {/* Vi fjerner button midlertidigt for feedback fra stakeholders
            <Button
              title="Book"
              onPress={() => {
                confirmBooking(item, index);
              }}
            ></Button>
            */}
          </View>
        </View>
      );
    }
    return (
      <View style={GlobalStyles.container}>
        <Text>{`Tid: ${item.time}. Sted: ${item.clinic}, ${
          location ? location.name : ""
        }. Pris: ${item.price}`}</Text>
        <View style={GlobalStyles.button}>
          {/* Vi fjerner button midlertidigt for feedback fra stakeholders
          <Button
            title="Book"
            onPress={() => {
              confirmBooking(item, index);
            }}
          ></Button>
          */}
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
    <ImageBackground
      style={styles2.container}
      source={require("../assets/salongro1.jpg")}
    >
      <SafeAreaView style={{ height: "100%" }}>
        <FlatList
          data={timesWithDistance}
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
