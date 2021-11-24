import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Rating } from "react-native-elements";
import firebase from "firebase";
import {SafeAreaView} from "react-native-safe-area-context";
import GlobalStyles from "../styles/GlobalStyles";
export default function UserTimeDetails({ route, navigation }) {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  useEffect(() => {
    //Vælger tabellen/dokument tabellen
    let queryCat = firebase
      .database()
      .ref(`/Categories/${route.params.time.category}`);
    let queryLoc = firebase
      .database()
      .ref(`/Locations/${route.params.time.location}`);

    queryCat.on("value", (snapshot) => {
      let data = snapshot.val();
      if (data) {
        setCategory(data);
      }
    });
    queryLoc.on("value", (snapshot) => {
      let data = snapshot.val();
      if (data) {
        setLocation(data);
      }
    });
  }, []);
  return (
      <SafeAreaView style={GlobalStyles.userContainer}>
        <Text style={GlobalStyles.userTitleText}>Pronto</Text>
        <Text style={GlobalStyles.userUnderTitleText}>Oplysninger om tiden</Text>
        <View style={GlobalStyles.menuOptions}>
        <Text style={GlobalStyles.text}>Udbyder: {route.params.time.clinic}</Text>
        <Text style={GlobalStyles.text}>Kategori: {category.name}</Text>
        <Text style={GlobalStyles.text}>Lokation: {location.addressString}</Text>
        <Text style={GlobalStyles.text}>Normal pris: {route.params.time.price}</Text>
        <Text style={GlobalStyles.text}>Ny pris: {route.params.time.discountPrice}</Text>
        <Text style={GlobalStyles.text}>Beskrivelse:{" "} {route.params.time.description ? route.params.time.description : null}
        </Text>
            <Text style={GlobalStyles.text}>Rating:</Text>
            <Rating readonly startingValue={rating} fractions={1} />
        </View>
      </SafeAreaView>
  );
}
