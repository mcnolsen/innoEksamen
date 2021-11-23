import { StyleSheet } from "react-native";

const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 0,
    backgroundColor: "#c1dbd8",
    padding: 10,
  },
  renderItem: {
    padding: 30,
    textAlign: "center",
  },
  imageContainer: {
    flex: 1,
    marginLeft: 0,
    marginRight: 0,
    padding: 20,
    marginBottom: 0,
    marginTop: -50,
  },
  homeText: {
    fontFamily: "Roboto",
    fontSize: 80,
    color: "#333",
    textAlign: "center",
    top: "86%",
    fontWeight: "bold",
  },
  titleText: {
    fontSize: 24,
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
    marginLeft: "auto",
    marginRight: "auto",
    elevation: 3,
    backgroundColor: "#059095",
    borderRadius: 10,
    height: "25%",
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.25,
    color: "white",
    fontWeight: "bold",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
  },
  listItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 5,
    padding: 5,
    width: "90%",
    justifyContent: "center",
  },
  listButton: {
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
    marginLeft: "auto",
    marginRight: "auto",
    elevation: 3,
    backgroundColor: "#059095",
    borderRadius: 10,
    height: "50%",
  },
  section: {
    flexDirection: "row",
  },
  menuOptions: {
      padding: 5
  },
});

export default GlobalStyles;
