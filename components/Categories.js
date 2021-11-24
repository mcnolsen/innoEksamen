import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, FlatList, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import firebase from "firebase";
import { TextInput } from "react-native-gesture-handler";
import GlobalStyles from "../styles/GlobalStyles";

export default function Categories({ navigation, route }) {
  const [categories, setCategories] = useState();
  const [newCategory, setNewCategory] = useState("");
  useEffect(() => {
    //Referer til categories tabellen
    let query = firebase.database().ref("/Categories/");

    //Perfomer querien til at få alle lokationer
    query.on("value", (snapshot) => {
      const data = snapshot.val();
      setCategories(data);
    });
  }, []);

  //Opret category i databasen. Skal også referere til et klinik id, som den person der opretter tiden skal være tilknyttet,
  // men dette er ikke vigtigt lige nu for at teste.
  const createCategory = () => {
    //Hvis ikke newcategory findes eller hvis længden er 0, vis fejl.
    if (newCategory.length === 0 || !newCategory) {
      Alert.alert("Venligst indtast et navn på kategori.");
    } else {
      firebase.database().ref("/Categories/").push({
        name: newCategory,
        status: 1,
      });
      Alert.alert("Kategorien er oprettet.");
    }
  };
  //Bekræftelse af slettelse er nødvendig, så fejl-sletninger ikke sker så ofte.
  const confirmDelete = (item, index) => {
    Alert.alert("Er du sikker?", "Vil du slette denne kategori", [
      { text: "Fortryd", style: "cancel" },
      {
        text: "Slet kategori",
        style: "default",
        onPress: () => {
          deleteCategory(item, index);
        },
      },
    ]);
  };

  const deleteCategory = (item, index) => {
    const id = categoriesKeys[index];
    firebase.database().ref(`/Categories/${id}`).remove();
    alert("Kategorien er nu slettet.");
  };
  //Array with all the objects from the query
  const categoriesArray = categories ? Object.values(categories) : false;
  //Array with the keys (id) to the the objects above
  const categoriesKeys = categories ? Object.keys(categories) : false;

  //Render item required for flatlist. Shows how to render each item in the list.
  const renderItem = ({ item, index }) => {
    return (
      <View style={GlobalStyles.listItem}>
        <Text>{item.name}</Text>
        <View style={GlobalStyles.listButton}>
          <Pressable
            onPress={() => {
              confirmDelete(item, index);
            }}
            style={GlobalStyles.button}
          ><Text style={GlobalStyles.buttonText}>Slet</Text>
          </Pressable>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={GlobalStyles.container}>
      <Text style={GlobalStyles.titleText}>Kategorier</Text>
      <Text style={GlobalStyles.label}>Opret kategori:</Text>
      <TextInput
        value={newCategory}
        onChangeText={(e) => {
          setNewCategory(e);
        }}
        placeholder="Indtast kategori navn..."
      ></TextInput>
      <Button title="Gem" onPress={() => createCategory()} color="#333" />
      <View style={{ marginTop: 20 }}>
        <Text style={GlobalStyles.label}>Nuværende Kategorier:</Text>
      </View>
      {categories ? (
        <FlatList
          data={categoriesArray}
          renderItem={renderItem}
          keyExtractor={(item, index) => categoriesKeys[index]}
        ></FlatList>
      ) : (
        <Text></Text>
      )}
    </SafeAreaView>
  );
}