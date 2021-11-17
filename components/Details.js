import React from "react";
import firebase from "firebase";
import { View, Text, Platform, StyleSheet, Button, Alert } from "react-native";
import { TextInput } from "react-native-gesture-handler";

import { useEffect, useState } from "react";
import GlobalStyles from "../styles/GlobalStyles";
import { Picker } from "@react-native-picker/picker";

const Details = ({ route, navigation }) => {
  const [date, setNewDate] = useState(new Date());
  const [showDate, setShowDate] = useState(Platform.OS === "ios");
  const [showTime, setShowTime] = useState(Platform.OS === "ios");

  const [locations, setLocations] = useState("");
  const [categories, setCategories] = useState("");

  //Inputs
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [description, setDescription] = useState("");

  //Her hentes tidsværdierne og de sættes
  useEffect(() => {
      if(!locations){
        getLocations();
        setPrice(route.params.time.price);
        setDiscountPrice(route.params.time.discountPrice);
        setDescription(route.params.time.description);
      }
      if(!categories){
        getCategories();
      }

  }),
    [];

  const handleSave = () => {
    if (
      price.length === 0 ||
      selectedLocation.length === 0 ||
      selectedCategory === 0 ||
      discountPrice.length === 0
    ) {
      Alert.alert(
        "Alle felter skal udfyldes",
        "Venligst udfyld alt før der kan gemmes"
      );
    } else {
      try {
        firebase.database().ref(`/Times/${route.params.time.id}`).update({
          price: price,
          discountPrice: discountPrice,
          location: selectedLocation,
          description: description,
          category: selectedCategory,
        });
        Alert.alert(`Gemt`);
        clearInformation();
      } catch (error) {
        console.log(`Error: ${error.message}`);
      }
    }
  };
  //Stakeholder skal bekræfte hvorvidt pågældende vil slette den valgte tid
  const confirmDelete = () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      Alert.alert("Er du sikker?", "Ønsker du at slette tiden?", [
        { text: "Fortryd", style: "cancel" },
        { text: "Slet", style: "destructive", onPress: () => handleDelete() },
      ]);
    }
  };

  //Koden bag selve sletningen af afbudstiden
  const handleDelete = () => {
    const id = route.params.time.id;
    try {
      firebase
        .database()
        //Stien for tiden angives
        .ref(`/Times/${id}`)
        //Dataen fra den stien fjernes via nedenstående kommando
        .remove();
      //Via navigation.goBack går vi tilbage når ovenstående er udført
      navigation.goBack();
    } catch (error) {
      Alert.alert(error.message);
    }
  };
  //Fjerner inputs
  const clearInformation = () => {
    setPrice("");
    setDiscountPrice("");
    setDescription("");
  };
  const getLocations = () => {
    //Vælger tabellen/dokument tabellen
    let query = firebase.database().ref("/Locations/");

    //Performer queryen
    query
      .orderByChild("status")
      .equalTo(1)
      .on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let dataValues = Object.values(data);
          let dataKeys = Object.keys(data);

          let dataMapped = dataValues.map((el, index) => ({
            id: dataKeys[index],
            ...el,
          }));
          setLocations(dataMapped);
          //Finder den nuværende lokation
          const selected = dataMapped.find((el) => {
            return el === route.params.time.location;
          });

          setSelectedLocation(selected);
        }
      });

      let query2 = firebase.database().ref(`/Times/${route.params.time.id}/location`);
      query2.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log(data)
      })


  };
  const getCategories = () => {
    //Selects the table/document table
    let query = firebase.database().ref("/Categories/");

    //Performs the query
    query
      .orderByChild("status")
      .equalTo(1)
      .on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let dataValues = Object.values(data);
          let dataKeys = Object.keys(data);

          let dataMapped = dataValues.map((el, index) => ({
            id: dataKeys[index],
            ...el,
          }));

          setCategories(dataMapped);

          //Finder den nuværende kategori
          const selected = dataMapped.find((el) => {
            return el.category === route.params.time.category;
          });
          setSelectedCategory(selected);
        }
      });
  };

  if (!route.params) {
    return <Text>No data</Text>;
  }

  //Der defineres to typer onPress - en for af ændre en tid i oversigten og en for at slette en tid fra oversigten
  return (
    <View style={styles.container}>
      <View>
        <Text style={GlobalStyles.text}>Lokation:</Text>
        <Picker
          onValueChange={(item, index) => {
            setSelectedLocation(item);
          }}
          selectedValue={selectedLocation}
        >
          {locations ? (
            locations.map((e, index) => {
              return <Picker.Item label={e.name} value={e.id} key={index} />;
            })
          ) : (
            <Picker.Item label="..." />
          )}
        </Picker>
      </View>
      <View>
        <Text style={GlobalStyles.text}>Kategori:</Text>
        <Picker
          onValueChange={(item, index) => {
            setSelectedCategory(item);
          }}
          selectedValue={selectedCategory}
        >
          {categories ? (
            categories.map((e, index) => {
              return <Picker.Item label={e.name} value={e.id} key={index} />;
            })
          ) : (
            <Picker.Item label="..." />
          )}
        </Picker>
      </View>
      <View>
        <Text style={GlobalStyles.text}>Normal pris:</Text>
        <TextInput
          value={price}
          onChangeText={(e) => {
            setPrice(e);
          }}
          placeholder="Indsæt pris før rabat..."
        />
        <Text style={GlobalStyles.text}>Rabat pris:</Text>
        <TextInput
          value={discountPrice}
          onChangeText={(e) => {
            setDiscountPrice(e);
          }}
          placeholder="Indsæt pris efter rabat..."
        />
      </View>
      <View>
        <Text style={GlobalStyles.text}>Beskrivelse:</Text>
        <TextInput
          value={description}
          onChangeText={(e) => {
            setDescription(e);
          }}
          placeholder="Indsæt eventuelt en beskrivelse..."
        />
      </View>

      <Button title="Gem" onPress={() => handleSave()} color="#333" />
      <Button title="Slet" onPress={() => confirmDelete()} />
    </View>
  );
};
//Details eksporteres
export default Details;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start" },
  row: {
    margin: 10,
    padding: 10,
    flexDirection: "row",
  },
  label: { width: 100, fontWeight: "bold" },
  value: { flex: 1 },
});
