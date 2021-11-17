import React from 'react';
import firebase from 'firebase';
import { View, Text, Platform, StyleSheet, Button, Alert } from 'react-native';
import {useEffect, useState} from "react";

const Details = ({route,navigation}) => {
    const [time,setTime] = useState({});

    //Her hentes tidsværdierne og de sættes
    useEffect(() => {
        setTime(route.params);
    }),[];
    const handleEdit = () => {
        const time = route.params.time
        navigation.navigate('Edit Details', { time });
    };

    //Stakeholder skal bekræfte hvorvidt pågældende vil slette den valgte tid
    const confirmDelete = () => {
        if(Platform.OS ==='ios' || Platform.OS ==='android'){
            Alert.alert('Er du sikker?', 'Ønsker du at slette tiden?', [
                { text: 'Fortryd', style: 'cancel' },
                { text: 'Slet', style: 'destructive', onPress:()=>handleDelete() },
            ]);
        }
    };

    //Koden bag selve sletningen af afbudstiden
    const  handleDelete = () => {
        const id = route.params.time[0];
        try {
            firebase
                .database()
                //Stien for tiden angives
                .ref(`/Times/${id}`)
                //Dataen fra den stien fjernes via nedenstående kommando
                .remove();
            //Via navigation.goBack går vi tilbage når ovenstående er udført
            navigation.goBack();
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    if (!time) {
        return <Text>No data</Text>;
    }

    //Der defineres to typer onPress - en for af ændre en tid i oversigten og en for at slette en tid fra oversigten
    return (
        <View style={styles.container}>
            <Button title="Ændre" onPress={ () => handleEdit()} />
            <Button title="Slet" onPress={() => confirmDelete()} />
        </View>
    );
}
//Details eksporteres
export default Details;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-start' },
    row: {
        margin: 10,
        padding: 10,
        flexDirection: 'row',
    },
    label: { width: 100, fontWeight: 'bold' },
    value: { flex: 1 },
});