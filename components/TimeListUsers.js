import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  Pressable, ImageBackground,
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
import {getBackgroundColor} from "react-native/Libraries/LogBox/UI/LogBoxStyle";

export default function TimeListUsers({ navigation }) {
  const [times, setTimes] = useState();
  const [userLocation, setUserLocation] = useState(null);
  const [useMaxDist, setUseMaxDist] = useState(false);
  const [didSearch, setDidSearch] = useState(false);
  const [maxDist, setMaxDist] = useState(10);
  const [missingLocations, setMissingLocations] = useState([]);

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

    //Perfomer querien til at få alle lokationer
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
        } else {
          setTimes(null);
        }
        setDidSearch(true);
      });
  }, [selectedCategory]);

  const findLocationDetails = (location_id) => {
    //Leder efter, om der allerede er data for en lokation med dette id, i de lokationer, som ikke automatisk bliver gemt i tids objektet
    let knownMissingLocation = missingLocations.find((el) => {
      return el.id === location_id;
    });
    if (knownMissingLocation) {
      return knownMissingLocation;
    } else {
      //Finder locations
      let queryLocation = firebase.database().ref(`/Locations/${location_id}`);
      queryLocation.once("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          let missingLocationToAdd = { id: location_id, ...data };
          let newMissingLocations = [...missingLocations, missingLocationToAdd];
          setMissingLocations(newMissingLocations);
        }
      });
      let knownMissingLocationAgain = missingLocations.find((el) => {
        return el.id === location_id;
      });
      return knownMissingLocationAgain;
    }
  };

  //Render item required for flatlist. Shows how to render each item in the list.
  const renderItem = ({ item, index }) => {
    const date = new Date(item.date);
    let locationAlternative;
    if (!item.location.addressString) {
      let searchLocation = findLocationDetails(item.location);
      if (searchLocation) {
        locationAlternative = searchLocation.addressString
          ? searchLocation.addressString
          : searchLocation.name;
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
          }. Udbyder: ${item.clinic}. Ny pris: ${
            item.discountPrice
          }. Før pris: ${item.price}. Rabat: ${
            Number(item.price) - item.discountPrice
          }. Distance: ${
            item.distance ? `${item.distance}m` : `Kan ikke findes.`
          }`}</Text>
          <View>
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
      <SafeAreaView style={GlobalStyles.container}>
        <Text>{`Tid: ${item.time}. Sted: ${item.clinic}, ${
          location ? location.name : ""
        }. Pris: ${item.price}`}</Text>
        <View>
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
  const TimesListComponent = (props) => {
    const { times, didSearch } = props;
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
                    color: "orange",
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
                <Text>Udbyder: {el.clinic}</Text>
                <Text>Pris: {el.discountPrice}</Text>
                <Text>
                  Distance:
                  {el.distance
                    ? ` ${(el.distance / 1000).toFixed(1)}`
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
    <SafeAreaView style={GlobalStyles.userContainer}>
      <Text style={GlobalStyles.userTitleText}>Pronto</Text>
      <View style={GlobalStyles.menuOptions}>
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
        <CheckBox
          checked={useMaxDist}
          onPress={() => {
            setUseMaxDist(!useMaxDist);
          }}
          title="Brug maksimal distance"
        />
        {useMaxDist ? (
          <View>
            <Text style={{ color: "#333" }}>
              Maksimum distance: {maxDist} km
            </Text>
            <Slider
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
      <TimesListComponent times={times} didSearch={didSearch} />
    </SafeAreaView>
  );
}
