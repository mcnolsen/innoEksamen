import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Button,
    Alert,
    ActivityIndicator, Pressable,
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
    const findLocationDetails = (location_id) => {
      //Leder efter, om der allerede er data for en lokation med dette id, i de lokationer, som ikke automatisk bliver gemt i tids objektet
      let knownMissingLocation = missingLocations.find((el) => {
        return el.id === location_id
      });
      if (knownMissingLocation) {
        return knownMissingLocation
      } else {
        //Finder locations
        let queryLocation = firebase.database().ref(`/Locations/${location_id}`);
        queryLocation.once("value", (snapshot) => {
          const data = snapshot.val();
          if (data) {
            let missingLocationToAdd = {id: location_id, ...data
            };
            let newMissingLocations = [...missingLocations, missingLocationToAdd]
            setMissingLocations(newMissingLocations);
          }
        });
        let knownMissingLocationAgain = missingLocations.find((el) => {
          return el.id === location_id
        });
        return knownMissingLocationAgain
      }
    };
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
      return (
        <SafeAreaView style={GlobalStyles.container}>
          <Text>{`Tid: Kl. ${item.time}, d. ${date.getDate()}/${
            date.getMonth() + 1
          }-${date.getFullYear()}. Sted: ${
            item.location.addressString
              ? item.location.addressString
              : locationAlternative
          }. Udbyder: ${item.clinic}. Pris: ${item.price}. Distance: ${
            item.distance ? `${item.distance}m` : `Kan ikke findes.`
          }`}</Text>
        <View style={GlobalStyles.listButton}>
            <Pressable
        onPress={() => {
            editTime(item, index);
        }}
        style={GlobalStyles.button}
            ><Text style={GlobalStyles.buttonText}>Ændre</Text>
            </Pressable>
            </View>
            </SafeAreaView>
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
      <SafeAreaView style={GlobalStyles.container}>
      <FlatList
        data={times}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      ></FlatList>
    </SafeAreaView>

  );
}