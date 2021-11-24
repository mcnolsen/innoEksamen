import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, FlatList, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import firebase from "firebase";
import { TextInput } from "react-native-gesture-handler";
import * as Location from "expo-location";
import GlobalStyles from "../styles/GlobalStyles";

export default function Locations({ navigation, route }) {
  const [locations, setLocations] = useState();
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newZip, setNewZip] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [accessGranted, setAccessGranted] = useState(false)
  const [location, setLocation] = useState(null);
  useEffect(() => {
    //Referer til locations tabellen
    let query = firebase.database().ref("/Locations/");

    //Perfomer querien til at få alle lokationer
    query.on("value", (snapshot) => {
      const data = snapshot.val();
      setLocations(data);
    });

    //Spørger om permission til at bruge lokation
    requestLocationAccess();
  }, []);
  const requestLocationAccess = async () =>{
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }
    setAccessGranted(true)
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  }

  //Opret location i databasen. Skal også referere til et klinik id, som den person der opretter tiden skal være tilknyttet,
  // men dette er ikke vigtigt lige nu for at teste.
  const createLocation = async () => {
    try {
      const coordinates = await Location.geocodeAsync(
        `${newAddress}, ${newZip} ${newCity}`
      );
      console.log(coordinates)
      //Hvis ikke newLocation findes eller hvis længden er 0, vis fejl.
      if (newName.length === 0 || !newName || newZip.length === 0 || !newZip || newAddress.length === 0 || !newAddress | newCity.length === 0 || !newCity) {
        Alert.alert("Venligst udfyld alle oplysninger.");
      } else if (!coordinates[0]){
        //Hvis koordinaterne ikke kunne findes
        Alert.alert("Oplysningerne kunne ikke konverteres til koordinater. Venligst prøv igen.");

      }
      else {
        firebase
          .database()
          .ref("/Locations/")
          .push({
            name: newName,
            addressString: `${newAddress}, ${newZip} ${newCity}`,
            lon: coordinates[0].longitude,
            lan: coordinates[0].latitude,
            status: 1,
          });
        Alert.alert("Lokationen er oprettet.");
      }
    } catch (err) {
      if (err) {
        console.log(err);
        Alert.alert("Oplysningerne kunne ikke konverteres til koordinater. Venligst prøv igen.");
      }
    }
  };
  //Bekræftelse af slettelse er nødvendig, så fejl-sletninger ikke sker så ofte.
  const confirmDelete = (item, index) => {
    Alert.alert("Er du sikker?", "Vil du slette denne lokation?", [
      { text: "Fortryd", style: "cancel" },
      {
        text: "Slet lokation",
        style: "default",
        onPress: () => {
          deleteLocation(item, index);
        },
      },
    ]);
  };

  const deleteLocation = (item, index) => {
    const id = locationsKeys[index];
    firebase.database().ref(`/Locations/${id}`).remove();
    alert("Lokationen er nu slettet.");
  };
  //Array with all the objects from the query
  const locationsArray = locations ? Object.values(locations) : false;
  //Array with the keys (id) to the the objects above
  const locationsKeys = locations ? Object.keys(locations) : false;

  //Render item required for flatlist. Shows how to render each item in the list.
  const renderItem = ({ item, index }) => {
    return (
      <View style={GlobalStyles.listItem}>
        <Text>{item.name}</Text>
        <View style={GlobalStyles.button}>
          <Pressable
            onPress={() => {
              confirmDelete(item, index);
            }}
          ><Text style={GlobalStyles.buttonText}>Slet</Text>
          </Pressable>
        </View>
      </View>
    );
  };
  //Hvis ikke der er givet tilladelse til lokation
  if (!accessGranted){
    return(
      <SafeAreaView style={GlobalStyles.container}>
        <Text style={GlobalStyles.label}>Tilladelse af adgang til lokation skal gives, for at kunne oprette en lokation. Venligst tillad dette</Text>
      {locations ? (
        <FlatList
          data={locationsArray}
          renderItem={renderItem}
          keyExtractor={(item, index) => locationsKeys[index]}
        ></FlatList>
      ) : (
        <Text></Text>
      )}
    </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <Text style={GlobalStyles.titleText}>Lokationer</Text>
  <Text style={GlobalStyles.text}>Opret lokation</Text>
      <Text style={GlobalStyles.label}>Lokationsnavn:</Text>
      <TextInput
        value={newName}
        onChangeText={(e) => {
          setNewName(e);
        }}
        placeholder="Indtast lokationsnavn..."
      ></TextInput>
      <Text style={GlobalStyles.label}>Bynavn:</Text>
      <TextInput
        value={newCity}
        onChangeText={(e) => {
          setNewCity(e);
        }}
        placeholder="Indtast bynavn..."
      ></TextInput>
      <Text style={GlobalStyles.label}>Zip/post kode:</Text>
      <TextInput
        value={newZip}
        onChangeText={(e) => {
          setNewZip(e);
        }}
        placeholder="Indtast zip kode..."
      ></TextInput>
      <Text style={GlobalStyles.label}>Addresse:</Text>
      <TextInput
        value={newAddress}
        onChangeText={(e) => {
          setNewAddress(e);
        }}
        placeholder="Indtast addresse..."
      ></TextInput>

      <Button title="Gem" onPress={() => createLocation()} color="#333" />

      <View style={{ marginTop: 20 }}>
        <Text style={GlobalStyles.label}>Nuværende lokationer:</Text>
      </View>

      {locations ? (
        <FlatList
          data={locationsArray}
          renderItem={renderItem}
          keyExtractor={(item, index) => locationsKeys[index]}
        ></FlatList>
      ) : (
        <Text></Text>
      )}
    </SafeAreaView>
  );
}