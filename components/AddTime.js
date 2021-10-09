import React, { useState, useEffect } from "react";
import { View, Text, Alert, Button, StyleSheet, Pressable } from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import firebase from "firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export default function AddTime({ navigation, route }) {
  const initialState = { time: "", price: "", description: "" };
  const [newTime, setNewTime] = useState(initialState);
  const [date, setNewDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState("");
  const changeTextInput = (name, event) => {
    setNewTime({ ...newTime, [name]: event });
  };
  const handleSave = () => {
    const { time, price, description } = newTime;
    //Grund til clinic er hardcoded, er at det egentligt skal hentes fra den klinik,
    // som er logget ind. Der er bare ikke grund til at implementere det her i testen.
    const clinic = "Test Clinic";
    if (
      time.length === 0 ||
      price.length === 0 ||
      selectedLocation.length === 0 ||
      clinic.length === 0 ||
      date.length === 0
    ) {
      Alert.alert(
        "Ikke fuldt udfyldt",
        "Venligst udfyld alt før der kan gemmes"
      );
    } else {
      try {
        firebase
          .database()
          .ref("/Times/")
          .push({
            date: `${date}`,
            time: time,
            price: price,
            location: selectedLocation,
            clinic: clinic,
            status: 1,
            description: description,
          });
        Alert.alert(`Gemt`);
        setNewTime(initialState);
      } catch (error) {
        console.log(`Error: ${error.message}`);
      }
    }
  };
  const getLocations = () => {
    //Selects the table/document table
    let query = firebase.database().ref("/Locations/");

    //Performs the query
    query
      .orderByChild("status")
      .equalTo(1)
      .on("value", (snapshot) => {
        const data = snapshot.val();
        setLocations(data);
      });
  };
  useEffect(() => {
    getLocations();
  }, []);

  //Array with all the objects from the query
  const locationsArray = locations ? Object.values(locations) : false;
  //Array with the keys (id) to the the objects above
  const locationsKeys = locations ? Object.keys(locations) : false;
  return (
    <SafeAreaView
      style={{
        width: "80%",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: 10,
      }}
    >
      {/*Date picker aktiveringsknap. Skal vise om den skal vises eller ikke, da det er en pop-up/modal*/}
      <View>
        <Text style={styles.text}>Date:</Text>
        <Text
          style={{ marginLeft: "auto", marginRight: "auto" }}
        >{` ${date.getDate()}/${
          date.getMonth() + 1
        }-${date.getFullYear()}`}</Text>
        <Pressable
          onPress={() => {
            setShowDate(true);
          }}
          style={styles.button}
        >
          <Text style={styles.buttonTXT}>Vælg Dato</Text>
        </Pressable>
      </View>
      <View>
        <Text style={styles.text}>Location:</Text>
        <Picker
          onValueChange={(item, index) => {
            setSelectedLocation(item);
          }}
          value={selectedLocation}
        >
          {locations ? (
            locationsArray.map((e, index) => {
              return (
                <Picker.Item label={e.name} value={locationsKeys[index]} key={index} />
              );
            })
          ) : (
            <Picker.Item label="..." />
          )}
        </Picker>
      </View>
      {/* Om datepicker skal vises, og hvordan denne ser ud. Hvis showDate=true, så vis komponentet*/}
      {showDate ? (
        <DateTimePicker
          value={date}
          onChange={(e, chosenDate) => {
            setNewDate(chosenDate);
            setShowDate(false);
          }}
          mode="date"
        />
      ) : (
        <View></View>
      )}
      {/* Viser de forskellige inputfelter og deres navne*/}
      {Object.keys(initialState).map((attribute, index) => {
        return (
          <View key={index}>
            {/* Laver det først bogstav til uppercase, så det ser ordentligt ud */}
            <Text style={styles.text}>
              {`${attribute.charAt(0).toUpperCase()}${attribute.slice(1)}`}:
            </Text>
            <TextInput
              value={newTime[attribute]}
              onChangeText={(event) => {
                changeTextInput(attribute, event);
              }}
            />
          </View>
        );
      })}
      <View styles={styles.button}>
        <Button title="Save" onPress={() => handleSave()} color="navy" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
    marginLeft: "auto",
    marginRight: "auto",
    elevation: 3,
    backgroundColor: "navy",
    borderRadius: 10,
    height: "25%",
  },
  buttonTXT: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    fontWeight: "bold",
  },
});
