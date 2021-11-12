import { StyleSheet } from "react-native";

const GlobalStyles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 0,
        marginRight: 0,
        padding: 30,
        marginBottom: 0,
        backgroundColor: "#b0e0e6",
        textAlign: "center",
    },
    boxContainer:{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        height:200,
        margin: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleText: {
        fontSize: 18,
        color: '#333',
    },
    text: {
        fontSize: 16,
        lineHeight: 21,
        letterSpacing: 0.25,
        fontWeight: "bold",
    },
    button: {
        alignItems: "center",
        justifyContent: "center",
        width: "40%",
        marginLeft: "auto",
        marginRight: "auto",
        elevation: 3,
        backgroundColor: "#008B8B",
        borderRadius: 10,
        height: "25%",
        height: 30,
    },
    buttonText: {
        fontSize: 16,
        lineHeight: 21,
        letterSpacing: 0.25,
        color: "white",
    },
    label: {
        fontWeight: "bold",
        color: "#333",
    },
    listItem: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 5,
        padding: 5,
        width: "90%",
        justifyContent: "center",
    },
})

export default GlobalStyles




