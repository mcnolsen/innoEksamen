import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import firebase from "firebase";
import { TextInput } from "react-native-gesture-handler";
export default function Locations({ navigation, route }) {
  const [locations, setLocations] = useState();
  const [newLocation, setNewLocation] = useState("");
  useEffect(() => {
    //Referer til locations tabellen
    let query = firebase.database().ref("/Locations/");

    //Perfomer querien til at få alle lokationer
    query.on("value", (snapshot) => {
      const data = snapshot.val();
      setLocations(data);
    });
  }, []);

  //Opret location i databasen. Skal også referere til et klinik id, som den person der opretter tiden skal være tilknyttet,
  // men dette er ikke vigtigt lige nu for at teste.
  const createLocation = () => {
    //Hvis ikke newLocation findes eller hvis længden er 0, vis fejl.
    if (newLocation.length === 0 || !newLocation) {
      Alert.alert("Venligst indtast et lokations navn.");
    } else {
      firebase.database().ref("/Locations/").push({
        name: newLocation,
        status: 1,
      });
      Alert.alert("Lokationen er oprettet.");
    }
  };
  //Bekræftelse af slettelse er nødvendig, så fejl-sletninger ikke sker så ofte.
  const confirmDelete = (item, index) => {
    Alert.alert("Er du sikker?", "Vil du slette denne lokation?", [
      { text: "Fortryd", style: "cancel" },
      {
        text: "Slet tid",
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
      <View style={styles.listItem}>
        <Text>{item.name}</Text>
        <View style={styles.button}>
          <Pressable
            onPress={() => {
              confirmDelete(item, index);
            }}
            style={styles.button}
          >
            <Text style={styles.buttonTXT}>Slet</Text>
          </Pressable>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Opret lokation:</Text>
      <TextInput
        value={newLocation}
        onChangeText={(e) => {
          setNewLocation(e);
        }}
        placeholder="Indtast lokationsnavn..."
      ></TextInput>
      <Button title="Gem" onPress={() => createLocation()} color="navy" />
      <View style={{ marginTop: 20 }}>
        <Text style={styles.label}>Nuværende lokationer:</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 30,
    marginRight: 30,
    padding: 5,
    marginBottom: 100,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
    marginLeft: "auto",
    marginRight: "auto",
    elevation: 3,
    backgroundColor: "darkred",
    borderRadius: 10,
    height: "25%",
    height: 30,
  },
  buttonTXT: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  label: { fontWeight: "bold" },
  listItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 5,
    padding: 5,
    width: "90%",
    justifyContent: "center",
  },
});
