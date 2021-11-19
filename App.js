import React from "react";
import { StyleSheet, Text, View } from "react-native";
import firebase from "firebase/app";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import TimeList from "./components/TimeList";
import AddTime from "./components/AddTime";
import Categories from "./components/Categories";
import HomeScreen from "./components/HomeScreen";
import { Ionicons } from "react-native-vector-icons";
import Locations from "./components/Locations";
import TimeListUsers from "./components/TimeListUsers";
import Details from "./components/Details";
import UserTimeDetails from "./components/UserTimeDetails";

//For stack navigator. Ved ikke om vi vil anvende dette.
import { createStackNavigator } from "@react-navigation/stack";
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//For drawer navigator
import { createDrawerNavigator } from "@react-navigation/drawer";
const Drawer = createDrawerNavigator();

//Ui
import { ThemeProvider } from "react-native-elements";
const theme = {
  Button: {
    color: "#fff",
  },
  Slider: {
    thumbStyle: {
      height: 20,
      width: 20,
      backgroundColor: "white",
    },
  },
  CheckBox: {
    containerStyle: {
      backgroundColor: "transparent",
      borderWidth: 0,
    },
  },
};
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        {/* swipeEdgeWidth: 0, for at forhindre at menuen kan aktiveres ved swipes */}
        <Drawer.Navigator
          initialRouteName="HomeScreen"
          screenOptions={{
            swipeEdgeWidth: 0,
          }}
        >
          <Drawer.Screen name="Hjem" component={HomeScreen} />
          <Drawer.Screen
            name="Udbyder Menu"
            component={TabNavigationSuppliers}
          />
          <Drawer.Screen name="Bruger Menu" component={TabNavigationUsers} />
        </Drawer.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const StackNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TimeList"
        component={TimeList}
        options={{ title: null, headerShown: false }}
      />
      <Stack.Screen
        name="Details"
        component={Details}
        options={{ title: "Ændre detaljer" }}
      />
    </Stack.Navigator>
  );
};

const UserTimeDetailsStackNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UserTimeList"
        component={TimeListUsers}
        options={{ title: null, headerShown: false }}
      />
      <Stack.Screen
        name="UserTimeDetails"
        component={UserTimeDetails}
        options={{ title: "Yderligere oplysninger" }}
      />
    </Stack.Navigator>
  );
};
const TabNavigationSuppliers = () => {
  return (
    <Tab.Navigator>
      {/*Vi tilføjer navigationen for bottom-tabs
       */}
      <Tab.Screen
        name="Stack Navigation"
        component={StackNavigation}
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
  );
};

const TabNavigationUsers = () => {
  return (
    <Tab.Navigator>
      {/*Vi tilføjer navigationen for bottom-tabs
       */}
      <Tab.Screen
        name="TimeListUsers"
        component={UserTimeDetailsStackNavigation}
        options={{
          title: "Tidsliste",
          tabBarIcon: () => <Ionicons name="calendar" size={20} />,
          headerShown: null,
        }}
      />
    </Tab.Navigator>
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
