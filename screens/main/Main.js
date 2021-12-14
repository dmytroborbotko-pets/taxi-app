import { Entypo } from "@expo/vector-icons";
import * as Location from "expo-location";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { get, ref as firebaseRef } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Destination from "../../components/Destinstion";
import { auth, database } from "../../components/firebase";
import IconsAreas from "../../components/IconsAreas";
import Map from "../../components/Map";
import OriginAutocomplete from "../../components/OriginAutocomplete";
import PickUpTaxi from "../../components/PickUpTaxi";
import WayPointInput from "../../components/WayPointInput";
import {
  selectBtnWayPoint,
  selectDestination,
  selectOrigin,
  setOrigin
} from "../../slice/navSlice";
import { selectPremium, selectStandart, selectVan } from "../../slice/typeCar";
import BtnSubmit from "../registration/BtnSubmit";
import BtnCard from "./BtnCard";
import BtnDecline from "./BtnDecline";
import BtnPickUp from "./BtnPickUp";
import { mainStyles } from "./mainStyle";

export default function Main({ navigation }) {
  // States
  const [driver, setDriver] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [applyActive, setApplyActive] = useState(false);
  const [user, setUser] = useState({});
  const [requestState, setRequestState] = useState(false);
  const [active, setActive] = useState(false);

  // drivers database
  useEffect(async () => {
    const dbRef = firebaseRef(database);
    const db = await get(dbRef);
    setDriver(db.val());
  }, []);

  // Logout
  const logOutUser = async () => {
    await signOut(auth);
    navigation.navigate("registration");
    console.log(logOutUser);
  };

  // Redux Selectors
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const standart = useSelector(selectStandart);
  const van = useSelector(selectVan);
  const premium = useSelector(selectPremium);
  const btnWayPoint = useSelector(selectBtnWayPoint)

  // If not login go to registration form
  onAuthStateChanged(auth, (currentUser) => {
    if (!currentUser) {
      navigation.navigate("registration");
    }
    setUser(currentUser);
  });

  // Request for geolocation permission and getting current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  // Check geolocation error
  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  // Redux and Ref for searching area
  const dispatch = useDispatch();

  return (
    // Routing
    <View style={mainStyles.container}>
      <View style={mainStyles.box}>
        <Map />
        <View style={mainStyles.inputBox}>
          <View style={mainStyles.textBox}>
            <Text style={mainStyles.greeting}>Welcome Back, {user?.email}</Text>
            <Text style={mainStyles.title}>Where are you going?</Text>
          </View>

          {/* Destination and waypoint searching areas */}
          <Destination />
          {btnWayPoint && <WayPointInput />}

          {/* Icons between searching areas */}
          <View style={styles.toGo}>
            <IconsAreas />

            {/* Origin searching area */}
            <OriginAutocomplete
              setAddressText={"My current location"}
              active={active}
            />
          </View>
        </View>
      </View>

      {/* Btn my current location */}
      <View style={styles.btn}>
        <TouchableOpacity
          style={active ? { display: "none" } : { display: "flex" }}
          activeOpacity={0.7}
          onPress={
            (console.log(origin),
            () => {
              dispatch(
                setOrigin({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                })
              );
              setActive(true);
            })
          }
        >
          <View
            style={[
              styles.btnLoc,
              active
                ? { borderColor: "transparent" }
                : { borderColor: "#2076db" },
            ]}
          >
            <View style={styles.pos}>
              <Entypo name="direction" size={24} color="#2076db" />
              <Text style={styles.btnText}>My current location</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Apply btn */}
        {destination && origin && (
          <TouchableOpacity
            style={
              applyActive || requestState == true
                ? { display: "none" }
                : { display: "flex" }
            }
            activeOpacity={0.7}
            onPress={() => setApplyActive(true)}
          >
            <BtnSubmit text="Apply" />
          </TouchableOpacity>
        )}
      </View>

      {/* Choose type of car */}
      {applyActive && (
        <View style={styles.pickUp}>
          <PickUpTaxi />
          <TouchableOpacity activeOpacity={0.7}>
            <BtnCard />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => [setRequestState(true), setApplyActive(false)]}
          >
            <BtnPickUp text="Request" />
          </TouchableOpacity>
        </View>
      )}

      {/* Driver */}
      {requestState && standart && (
        <View style={styles.pickUp}>
          <View style={styles.driver}>
            <View style={styles.boxDriver}>
              <Image
                style={styles.imgDriver}
                source={{ uri: `${driver.Standart.John.img}` }}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{driver.Standart.John.name}</Text>
                <Text style={styles.car}>{driver.Standart.John.car}</Text>
              </View>
            </View>
            <Text style={styles.cost}>{driver.Standart.John.cost}$</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => [setRequestState(false), setApplyActive(true)]}
          >
            <BtnDecline text="Decline" />
          </TouchableOpacity>
        </View>
      )}
      {requestState && van && (
        <View style={styles.pickUp}>
          <View style={styles.driver}>
            <View style={styles.boxDriver}>
              <Image
                style={styles.imgDriver}
                source={{ uri: `${driver.Van.Michael.img}` }}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{driver.Van.Michael.name}</Text>
                <Text style={styles.car}>{driver.Van.Michael.car}</Text>
              </View>
            </View>
            <Text style={styles.cost}>{driver.Van.Michael.cost}$</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => [setRequestState(false), setApplyActive(true)]}
          >
            <BtnDecline text="Decline" />
          </TouchableOpacity>
        </View>
      )}
      {requestState && premium && (
        <View style={styles.pickUp}>
          <View style={styles.driver}>
            <View style={styles.boxDriver}>
              <Image
                style={styles.imgDriver}
                source={{ uri: `${driver.Premium.Willam.img}` }}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{driver.Premium.Willam.name}</Text>
                <Text style={styles.car}>{driver.Premium.Willam.car}</Text>
              </View>
            </View>

            <Text style={styles.cost}>{driver.Premium.Willam.cost}$</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => [setRequestState(false), setApplyActive(true)]}
          >
            <BtnDecline text="Decline" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  box: {
    flex: 1,
    width: "90%",
    justifyContent: "center",
  },
  btn: {
    flex: 1,
    width: "80%",
    alignSelf: "center",
    justifyContent: "flex-end",
    position: "absolute",
    bottom: 100,
  },
  autocomp: {
    flex: 1,
  },
  toGo: {
    width: "100%",
  },
  btnLoc: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  pos: {
    flexDirection: "row",
    padding: 10,
  },
  btnText: {
    fontFamily: "qb",
    fontSize: 18,
    marginLeft: 10,
    color: "#2076db",
  },
  pickUp: {
    width: "90%",
    alignSelf: "center",
    bottom: 0,
    position: "absolute",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  driver: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  name: {
    fontFamily: "qb",
    fontSize: 18,
    marginLeft: 10,
    color: "#414560",
  },
  car: {
    fontFamily: "qb",
    fontSize: 18,
    marginLeft: 10,
    color: "#414560",
  },
  imgDriver: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  cost: {
    fontFamily: "qb",
    fontSize: 18,
    marginLeft: 10,
    color: "#414560",
    textAlign: "right",
  },
  boxDriver: {
    flexDirection: "row",
  },
});
