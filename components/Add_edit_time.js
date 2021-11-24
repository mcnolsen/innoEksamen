import React from 'react';
import firebase from 'firebase';
import {Text,View, StyleSheet, TextInput, Button, Alert, ScrollView, SafeAreaView, } from 'react-native';
import {useEffect, useState} from "react";
import GlobalStyles from "../styles/GlobalStyles";

const Add_edit_time = ({navigation,route}) => {
    const initialState = {
    time: '',
    price: '',
   location: '',
    clinic: '',
    date: '',
    category: '',
    discountPrice: '',
    }
    const [newTime,setNewTime] = useState(initialState);
    //Her sikres det at route.name er Edit Booking og det bekræftes med 'True', hvis det er rigtigt
    const isEditTime = route.name === "Edit Time";

    useEffect(() => {
        if(isEditTime){
            const Time = route.params.time[1];
            setNewTime(Time)
        }
        //Dataen fjernes når man forlader dette view
        return () => {
            setNewTime(initialState)
        };
    }, []);

    const changeTextInput = (name,event) => {
        setNewTime({...newTime, [name]: event});
    }

    //Her defineres alle de inputfelter der skal gemmes, når der tilføjes en afbudstid
    const handleSave = () => {
        const { time, price, location, clinic, date, category, discountPrice } = newTime;

        //Her sikres det at alle felterne bliver udfyldt. I tilfælde af at ikke alle felter udfyldes, bliver brugeren påmindet om dette
        if(time.length === 0 || price.length === 0 || location.length === 0 || clinic.length === 0|| date.length === 0|| category.length === 0|| discountPrice.length === 0  ){
            return Alert.alert('Et af felterne mangler at blive udfyldt. Venligst udfyld feltet');
        }

        if(isEditTime){
            const id = route.params.time[0];
            try {
                firebase
                    .database()
                    .ref(`/Bookings/${id}`)
                    //Her bruges update med det formål kun at ændre det angivne felt eller de angivne felter
                    .update({ time, price, location, clinic, date, category, discountPrice });
                //De bekræftes af informationerne er opdateret via en alert
                Alert.alert("Din information er nu opdateret");
                const car = [id,newTime]
                navigation.navigate("Booking Details",{time});
            } catch (error) {
                console.log(`Error: ${error.message}`);
            }

        }else{

            try {
                firebase
                    .database()
                    .ref('/Bookings/')
                    .push({ time, price, location, clinic, date, category, discountPrice });
                Alert.alert(`Saved`);
                setNewTime(initialState)
            } catch (error) {
                console.log(`Error: ${error.message}`);
            }
        }

    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {
                    Object.keys(initialState).map((key,index) =>{
                        return(
                            <View style={styles.row} key={index}>
                                <Text style={styles.label}>{key}</Text>
                                <TextInput
                                    value={newTime[key]}
                                    onChangeText={(event) => changeTextInput(key,event)}
                                    style={styles.input}
                                />
                            </View>
                        )
                    })
                }
                <Button title={ isEditTime ? "Gem ændringer" : "Tilføj afbudstid"} onPress={() => handleSave()} />
            </ScrollView>
        </SafeAreaView>
    );
}

export default Add_edit_time;

/*
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    row: {
        flexDirection: 'row',
        height: 30,
        margin: 10,
    },
    label: {
        fontWeight: 'bold',
        width: 100
    },
    input: {
        borderWidth: 1,
        padding:5,
        flex: 1
    },
});
*/