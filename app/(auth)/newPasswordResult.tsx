import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const NewPasswordResult = () => {
  const { message } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <View style={styles.containerContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="flash" size={32} color="#0a0e14" />
          </View>
          <Text style={styles.logoText}>AUTOPULSE</Text>
        </View>

        <View>
          <Text style={styles.title}>{message}</Text>

          {/* Change Password Button */}
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={() => {
              router.replace("/(auth)/login");
            }}
          >
            <Text style={styles.buttonText}>Go to Login </Text>
            <Ionicons name="arrow-forward" size={20} color="#0a0e14" />
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerQuestion}>
              Reset your password to access all features and start managing your
              vehicles with ease.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default NewPasswordResult;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e14",
  },
  containerContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 80,
    justifyContent: "center",
    alignContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#89acff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 2,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 44,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  buttonWrapper: {
    marginBottom: 32,
    backgroundColor: "#89acff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0a0e14",
    letterSpacing: 1,
  },
  registerContainer: {
    alignItems: "center",
    gap: 12,
  },
  registerQuestion: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});
