import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  Pressable,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Slider, CheckBox, Divider } from "react-native-elements";
//import Slider from "@react-native-community/slider";
//import Checkbox from "expo-checkbox";
import { Picker } from "@react-native-picker/picker";

import * as Location from "expo-location";
import { getDistance } from "geolib";

import GlobalStyles from "../styles/GlobalStyles";

import firebase from "firebase";
import { getBackgroundColor } from "react-native/Libraries/LogBox/UI/LogBoxStyle";
import { ScrollView } from "react-native-gesture-handler";

export default function TimeListUsers({ navigation }) {
  const [times, setTimes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [useMaxDist, setUseMaxDist] = useState(false);
  const [didSearch, setDidSearch] = useState(false);
  const [maxDist, setMaxDist] = useState(10);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState();
  const [selectedCategory, setSelectedCategory] = useState("");

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
    //Referer til categories tabellen
    let query = firebase.database().ref("/Categories/");

    //Perfomer querien til at få alle kategorier
    query.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        dataKeys = Object.keys(data);
        dataValues = Object.values(data);

        if (dataKeys && dataValues) {
          const dataMapped = dataValues.map((el, index) => ({
            id: dataKeys[index],
            ...el,
          }));
          setCategories(dataMapped);
          setSelectedCategory(dataMapped[0].id);
        }
      }
    });
    /*
    if (!locations) {
      //Finder locations
      let queryLocation = firebase.database().ref(`/Locations/`);
      queryLocation.on("value", (snapshot) => {
        const data2 = snapshot.val();
        setLocations(data2);
      });
    }*/
  }, []);
  useEffect(() => {
    //Vælger tabellen/dokument tabellen
    let query = firebase.database().ref("/Times/");
    //Performs the query
    query
      .orderByChild("category")
      .equalTo(selectedCategory)
      .on("value", (snapshot) => {
        let data = snapshot.val();
        if (data) {
          let dataValues = Object.values(data);
          let dataKeys = Object.keys(data);
          //Få id med i objektet, samt distance beregninger
          if (dataKeys && dataValues) {
            let data = dataValues.map((el, index) => {
              return {
                id: dataKeys[index],
                ...el,
                //Beregn distance mellem lokations koordinater og brugeren.
                distance:
                  el.location.lon && el.location.lan && userLocation
                    ? getDistance(
                        {
                          longitude: userLocation.coords.longitude,
                          latitude: userLocation.coords.latitude,
                        },
                        {
                          longitude: el.location.lon,
                          latitude: el.location.lan,
                        }
                      )
                    : false,
              };
            });
            setTimes(data);
          }
        } else {
          setTimes([]);
        }
        setDidSearch(true);
      });
  }, [selectedCategory, userLocation]);

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
  const TimesListComponent = (props) => {
    const { times, didSearch, locations } = props;
    //Hvis der ikke er blevet søgt endnu
    if (!times && !didSearch) {
      return <ActivityIndicator />;
    } else if (!times && didSearch) {
      return <Text>Ingen tilgængelige tider</Text>;
    } else {
      return (
        <View
          style={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row",
            flexBasis: 4,
            justifyContent: "center",
          }}
        >
          {times.map((el) => {
            return (
              <Pressable
                key={el.id}
                style={GlobalStyles.listItem}
                onPress={() => {
                  navigation.navigate("UserTimeDetails", { time: el });
                }}
              >
                <Text
                  style={{
                    textAlign: "right",
                    fontWeight: "bold",
                    color: "#038f93",
                  }}
                >
                  -
                  {(
                    ((Number(el.price) - Number(el.discountPrice)) /
                      Number(el.price)) *
                    100
                  ).toFixed(2)}
                  %
                </Text>
                <Divider />
                {/* Placeholder. Clinic navnet skal findes ved at lede i databasen, når den finder tiderne*/}
                <Text style={GlobalStyles.text}>Udbyder: {el.clinic}</Text>
                <Text style={GlobalStyles.text}>Pris: {el.discountPrice}</Text>
                <Text style={GlobalStyles.text}>
                  Distance:
                  {el.distance
                    ? ` ${(el.distance / 1000).toFixed(1)}km`
                    : " Kunne ikke findes."}
                </Text>
              </Pressable>
            );
          })}
        </View>
      );
    }
  };
  return (
    <ScrollView style={GlobalStyles.userContainer}>
      <SafeAreaView style={GlobalStyles.userContainer, {marginTop: 15}}>
        <Text style={GlobalStyles.userTitleText}>Pronto</Text>
        <Text style={GlobalStyles.userUnderTitleText}>
          Ledige tider nær dig
        </Text>
        <View style={GlobalStyles.menuOptions}>
          <Text style={GlobalStyles.text}>Vælg kategori:</Text>
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
          <CheckBox
            checked={useMaxDist}
            checkedColor="#038f93"
            onPress={() => {
              setUseMaxDist(!useMaxDist);
            }}
            title="Vælg distance"
          />
          {useMaxDist ? (
            <View>
              <Text style={{ color: "white" }}>
                Maksimum distance: {maxDist} km
              </Text>
              <Slider
                minimumValue={1}
                maximumValue={50}
                minimumTrackTintColor="#038f93"
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
        <TimesListComponent
          times={times}
          didSearch={didSearch}
          locations={locations}
          key={times}
        />
      </SafeAreaView>
    </ScrollView>
  );
}
