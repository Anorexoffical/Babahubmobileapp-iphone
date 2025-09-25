import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Alert, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import InAppBrowser from "react-native-inappbrowser-reborn";

const PaymentScreen = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const openPayment = async () => {
      try {
        const storedUrl = await AsyncStorage.getItem("latestPaymentUrl");
        console.log("Loaded PayFast URL:", storedUrl);

        if (!storedUrl) {
          Alert.alert("Error", "No payment URL found!");
          setLoading(false);
          return;
        }

        // Only try InAppBrowser on mobile devices (not web/Expo Go)
        if (Platform.OS !== "web" && InAppBrowser?.isAvailable) {
          const available = await InAppBrowser.isAvailable();
          if (available) {
            await InAppBrowser.open(storedUrl, {
              dismissButtonStyle: "cancel",
              preferredBarTintColor: "#3366FF",
              preferredControlTintColor: "white",
              showTitle: true,
              toolbarColor: "#3366FF",
              secondaryToolbarColor: "black",
              enableUrlBarHiding: true,
              enableDefaultShare: false,
            });
          } else {
            await Linking.openURL(storedUrl);
          }
        } else {
          // On web or Expo Go → always use system browser
          await Linking.openURL(storedUrl);
        }
      } catch (error) {
        console.error("Payment open error:", error);
        Alert.alert("Error", "Could not open PayFast");
      } finally {
        setLoading(false);
      }
    };

    openPayment();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3366FF" />
      </View>
    );
  }

  return null;
};

export default PaymentScreen;
