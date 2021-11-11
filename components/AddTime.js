import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Button,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import firebase from "firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

/*//Global Styles import
import GlobalStyles from "../styles/GlobalStyles";

//Eksempel på brug af styles
<View style={GlobalStyles.container}></View>
*/
export default function AddTime({ navigation, route }) {
  const [date, setNewDate] = useState(new Date());
  const [showDate, setShowDate] = useState(Platform.OS === 'ios');
  const [showTime, setShowTime] = useState(Platform.OS === 'ios');

  const [locations, setLocations] = useState("");
  const [categories, setCategories] = useState("");

  //Inputs
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [time, setTime] = useState(new Date());
  const [description, setDescription] = useState("");

  const handleSave = () => {
    //Grund til clinic er hardcoded, er at det egentligt skal hentes fra den klinik,
    // som er logget ind. Der er bare ikke grund til at implementere det her i testen.
    const clinic = "Test Clinic";
    if (
      time.length === 0 ||
      price.length === 0 ||
      selectedLocation.length === 0 ||
      clinic.length === 0 ||
      date.length === 0 ||
      selectedCategory === 0 ||
      discountPrice.length === 0
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
            discountPrice: discountPrice,
            location: selectedLocation,
            clinic: clinic,
            status: 1,
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
  //Fjerner inputs
  const clearInformation = () => {
    setPrice("");
    setDiscountPrice("");
    setTime("");
    setDescription("");
    const today = new Date();
    setNewDate(today);
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
          setSelectedLocation(Object.values(data)[0]);
        }
        setLocations(data);
      });
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
          setSelectedCategory(Object.values(data)[0]);
        }
        setCategories(data);
      });
  };
  useEffect(() => {
    getLocations();
    getCategories();
  }, []);

  //Array with all the objects from the query
  const locationsArray = locations ? Object.values(locations) : false;
  //Array with the keys (id) to the the objects above
  const locationsKeys = locations ? Object.keys(locations) : false;

  //Array with all the objects from the query
  const categoriesArray = categories ? Object.values(categories) : false;
  //Array with the keys (id) to the the objects above
  const categoriesKeys = categories ? Object.keys(categories) : false;
  return (
    <ScrollView style={{ width: "100%" }}>
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
          <DateAndTimeComponent
            showDate={showDate}
            showTime={showTime}
            setShowDate={setShowDate}
            setShowTime={setShowTime}
            time={time}
            date={date}
          />
        </View>

        {/* Om datepicker skal vises, og hvordan denne ser ud. Hvis showDate=true, så vis komponentet*/}
        {showDate ? (
          <DateTimePicker
            value={date}
            onChange={(e, chosenDate) => {
              //Hvis der vælges et input, og ikke trykkes annuller
              if (chosenDate) {
                setNewDate(chosenDate);
              }
              //Hvis ios, så går den væk. Ellers ikke. På ios vises det anderledes, derfor er det vigtigt.
              setShowDate(Platform.OS === "ios");
            }}
            mode="datetime"
          />
        ) : (
          <View></View>
        )}
        {showTime ? (
          <DateTimePicker
            value={time}
            onChange={(e, chosenTime) => {
              //Hvis der vælges et input, og ikke trykkes annuller
              if (chosenTime) {
                setTime(chosenTime);
              }
              setShowTime(Platform.OS === "ios");
            }}
            mode="time"
          />
        ) : (
          <View></View>
        )}
        <View>
          <Text style={styles.text}>Lokation:</Text>
          <Picker
            onValueChange={(item, index) => {
              setSelectedLocation(item);
            }}
            value={selectedLocation}
          >
            {locations ? (
              locationsArray.map((e, index) => {
                return (
                  <Picker.Item
                    label={e.name}
                    value={locationsKeys[index]}
                    key={index}
                  />
                );
              })
            ) : (
              <Picker.Item label="..." />
            )}
          </Picker>
        </View>
        <View>
          <Text style={styles.text}>Kategori:</Text>
          <Picker
            onValueChange={(item, index) => {
              setSelectedCategory(item);
            }}
            value={selectedCategory}
          >
            {categories ? (
              categoriesArray.map((e, index) => {
                return (
                  <Picker.Item
                    label={e.name}
                    value={categoriesKeys[index]}
                    key={index}
                  />
                );
              })
            ) : (
              <Picker.Item label="..." />
            )}
          </Picker>
        </View>
        <View>
          <Text style={styles.text}>Pris:</Text>
          <TextInput
            value={price}
            onChangeText={(e) => {
              setPrice(e);
            }}
            placeholder="Indsæt pris før rabat..."
          />
          <Text style={styles.text}>Rabat pris:</Text>
          <TextInput
            value={discountPrice}
            onChangeText={(e) => {
              setDiscountPrice(e);
            }}
            placeholder="Indsæt pris efter rabat..."
          />
        </View>
        <View>
          <Text style={styles.text}>Beskrivelse:</Text>
          <TextInput
            value={description}
            onChangeText={(e) => {
              setDescription(e);
            }}
            placeholder="Indsæt eventuelt en beskrivelse..."
          />
        </View>

        <View styles={styles.button}>
          <Button title="Save" onPress={() => handleSave()} color="navy" />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const DateAndTimeComponent = (props) => {
  const { setShowTime, setShowDate, showDate, showTime, time, date } = props;
  if (Platform.OS === "ios") {
    return (
      <View>
        <Text style={styles.text}>Dato og Tid:</Text>
        {showDate ?  <Text></Text> : <Pressable
          onPress={() => {
            setShowDate(true);
          }}
          style={styles.button}
        >
          <Text style={styles.buttonTXT}>Vælg Dato</Text>
        </Pressable>}
        {showTime ? <Text></Text> : <Pressable
          onPress={() => {
            setShowTime(true);
          }}
          style={styles.button}
        >
          <Text style={styles.buttonTXT}>Vælg Tid</Text>
        </Pressable>}
      </View>
    );
  }
  return (
    <View>
      <Text style={styles.text}>Dato og Tid:</Text>
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
      <Text style={{ marginLeft: "auto", marginRight: "auto" }}>{`${
        time.getHours() < 10 ? `0${time.getHours()}` : time.getHours()
      }:${
        time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()
      }`}</Text>
      <Pressable
        onPress={() => {
          setShowTime(true);
        }}
        style={styles.button}
      >
        <Text style={styles.buttonTXT}>Vælg Tid</Text>
      </Pressable>
    </View>
  );
};

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
    flex: 2,
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
