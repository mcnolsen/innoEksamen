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

export default function TimeListUsers({ navigation }) {
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
    /*
    if (!locations) {
      //Finder locations
      let queryLocation = firebase.database().ref(`/Locations/`);
      queryLocation.on("value", (snapshot) => {
        const data2 = snapshot.val();
        setLocations(data2);
      });
    }*/
  }),
    [];
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
        </SafeAreaView>
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
    const bookingsRef = firebase.database().ref(`/Bookings/`);
    bookingsRef.push({ time_id: item.id, customer_name: "Jens Ole" });
    //Sætter status 0, så denne ikke længere ses, samt lagrer booking i 'Bookings'
    firebase.database().ref(`/Times/${id}`).update({ status: 0 });
  };
  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={GlobalStyles.menuOptions}>
        <View style={GlobalStyles.section}>
          <Checkbox
            value={useMaxDist}
            onValueChange={() => {
              setUseMaxDist(!useMaxDist);
            }}
          />
          <Text>Brug maksimal distance</Text>
        </View>
        {useMaxDist ? (
          <View style={GlobalStyles.menuOptions}>
            <Text style={GlobalStyles.label}>Maksimum distance (km)</Text>
            <Text>{maxDist}</Text>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={1}
              maximumValue={50}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              step={1}
              onValueChange={(e) => {
                setMaxDist(e);
              }}
              value={maxDist}
            />
          </View>
        ) : null}
      </View>
      <FlatList
        data={times}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      ></FlatList>
    </SafeAreaView>
  );
}
