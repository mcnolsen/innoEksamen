import React from 'react';
import {StyleSheet, Button, ImageBackground, TouchableOpacity, SafeAreaView, Image, Text,} from 'react-native';
import GlobalStyles from "../styles/GlobalStyles";

function HomeScreen (props) {
    return (
        <ImageBackground style={GlobalStyles.imageContainer} source={require("../assets/homeScreenBack.jpg")}>
        <Text style={GlobalStyles.homeText}>Pronto</Text>
        </ImageBackground>
    )
}

/*
function HomeScreen (props) {
    return (
   <ImageBackground style={styles2.container} source={require("../assets/homeScreenBack.jpg")}>
       <SafeAreaView style={styles2.container}>
      <TouchableOpacity>
      <Image style={imageStyle.constainer}
      // Styler med fade duration på 1.5 sek og importere image fra assets folder (logo) - Virker kun på Android
        fadeDuration={1500}
        source={require("../assets/pronto.png")} />
      </TouchableOpacity>

    </SafeAreaView>
   </ImageBackground>
    );
}

*/


/*
const styles = StyleSheet.create( {
    background: {
        flex: 1
    }
})

const imageStyle = StyleSheet.create({
    constainer: {
      padding: 20,
      marginTop: -50,
      opacity: 0.9
    },
  });
  const buttonStyle = StyleSheet.create({
    constainer: {
      paddingVertical: 20,
      flex: 1,
      padding: 70,
      marginTop: -50,
    },
  });

  const styles2 = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingTop: Platform.OS === "android" ? 20 : 0,
    },
  });
*/

export default HomeScreen;