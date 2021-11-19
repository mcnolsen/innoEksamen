import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Rating } from "react-native-elements";
import firebase from "firebase";
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
    <View>
      <Text>Udbyder: {route.params.time.clinic}</Text>
      <Text>Kategori: {category.name}</Text>
      <Text>Lokation: {location.addressString}</Text>
      <Text>Normal pris: {route.params.time.price}</Text>
      <Text>Ny pris: {route.params.time.discountPrice}</Text>
      <Text>
        Beskrivelse:{" "}
        {route.params.time.description ? route.params.time.description : null}
      </Text>
      <Text>Rating:</Text>
      <Rating readonly startingValue={rating} fractions={1} />
    </View>
  );
}
