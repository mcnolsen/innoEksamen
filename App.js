import React from "react";
import { StyleSheet, Text, View } from "react-native";
import firebase from "firebase/app";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import TimeList from "./components/TimeList";
import AddTime from "./components/AddTime";
import Categories from "./components/Categories";
import HomeScreen from "./components/HomeScreen";
import { Ionicons } from "react-native-vector-icons";
import Locations from "./components/Locations";
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
      {/*Vi tilføjer navigationen for bottom-tabs
      */}
      <Tab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            title: "Home",
            tabBarIcon: () => <Ionicons name="home" size={20} />,
            headerShown: null,
          }}
        />
        <Tab.Screen
          name="TimeList"
          component={TimeList}
          options={{
            title: "Time List",
            tabBarIcon: () => <Ionicons name="calendar" size={20} />,
            headerShown: null,
          }}
        />
        <Tab.Screen
          name="AddTime"
          component={AddTime}
          options={{
            title: "Add Time",
            tabBarIcon: () => <Ionicons name="add" size={20} />,
            headerShown: null,
          }}
        />
        <Tab.Screen
          name="Locations"
          component={Locations}
          options={{
            title: "Locations",
            tabBarIcon: () => <Ionicons name="location-outline" size={20} />,
            headerShown: null,
          }}
        />
                <Tab.Screen
          name="Categories"
          component={Categories}
          options={{
            title: "Categories",
            tabBarIcon: () => <Ionicons name="folder" size={20} />,
            headerShown: null,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const StackNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TimeList" component={TimeList} />
      <Stack.Screen name="AddTime" component={AddTime} />
      <Stack.Screen name="Locations" component={Locations} />
    </Stack.Navigator>
  );
};
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlZNI-7IXCafQtcaxHAwKVZAzRWGmQn0Y",
  authDomain: "fir-testoevelse5.firebaseapp.com",
  databaseURL: "https://fir-testoevelse5-default-rtdb.firebaseio.com",
  projectId: "fir-testoevelse5",
  storageBucket: "fir-testoevelse5.appspot.com",
  messagingSenderId: "488071054341",
  appId: "1:488071054341:web:74ef335629a980c0f4c86c",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
