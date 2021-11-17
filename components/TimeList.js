import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import Checkbox from "expo-checkbox";

import * as Location from "expo-location";
import { getDistance } from "geolib";

import GlobalStyles from "../styles/GlobalStyles";

import firebase from "firebase";

export default function TimeList({ navigation }) {
  const [times, setTimes] = useState();
  const [userLocation, setUserLocation] = useState(null);
  const [useMaxDist, setUseMaxDist] = useState(false);
  const [didSearch, setDidSearch] = useState(false);
  const [maxDist, setMaxDist] = useState(10);
  const [missingLocations, setMissingLocations] = useState([]);

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
          if (data){
            let dataValues = Object.values(data);
            let dataKeys = Object.keys(data);
  
            //Få id med i objektet, samt distance beregninger
            let dataDistance = dataValues.map((el, index) => ({
              id: dataKeys[index],
              ...el,
              distance:
                //Beregn distance mellem lokations koordinater og brugeren.
                el.location.lon && el.location.lan && userLocation
                  ? getDistance(
                      {
                        longitude: userLocation.coords.longitude,
                        latitude: userLocation.coords.latitude,
                      },
                      { longitude: el.location.lon, latitude: el.location.lan }
                    )
                  : false,
            }));
            setTimes(dataDistance);
          }
          setDidSearch(true);


        });
    }
  }),
    [];

    if (!times && !didSearch) {
      //Hvis ingen tider, og men der ikke er søgt endnu.
      return (
        <SafeAreaView>
          <ActivityIndicator size="small" color="#0000ff" />
        </SafeAreaView>
      );
    } else if (!times && didSearch) {
      //Hvis ingen tider og der er blevet tjekket i db.
      return (
        <SafeAreaView>
          <Text>Ingen tilgængelige tider.</Text>
        </SafeAreaView>
      );
    }

  //Render item required for flatlist. Shows how to render each item in the list.
  const renderItem = ({ item, index }) => {
    const date = new Date(item.date);
    let locationAlternative;
    if (!item.location.addressString) {
      let searchLocation = findLocationDetails(item.location)
      if (searchLocation){
        locationAlternative = searchLocation.addressString ? searchLocation.addressString : searchLocation.name;

      }
    }
    //Hvis der er en dato (tidligere indtastet data, har ikke dato. Derfor dette, så der ikke opstår fejl)
    if (item.date) {
      return (
        <View style={GlobalStyles.container}>
          <Text>{`Tid: Kl. ${item.time}, d. ${date.getDate()}/${
            date.getMonth() + 1
          }-${date.getFullYear()}. Sted: ${
            item.location.addressString
              ? item.location.addressString
              : locationAlternative
          }. Udbyder: ${item.clinic}. Pris: ${item.price}. Distance: ${
            item.distance ? `${item.distance}m` : `Kan ikke findes.`
          }`}</Text>
          <View style={GlobalStyles.button}>
            <Button
              title="Ændre"
              onPress={() => {
                editTime(item);
              }}
            ></Button>

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
          <Button
            title="Ændre"
            onPress={() => {
              editTime(item);
            }}
          ></Button>
        </View>
      </View>
    );
  };
  //Confirmation of the booking is required, so to prevent accidental bookings.
  const editTime = (item) => {
     navigation.navigate("Details",{time:item})
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
    <SafeAreaView style={{ height: "100%" }}>
      <FlatList
        data={times}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      ></FlatList>
    </SafeAreaView>

  );
}

/*
const styles2 = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingTop: Platform.OS === "android" ? 20 : 0,
  },
});
 */

/*
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
*/