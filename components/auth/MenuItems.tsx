import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MenuItems = ({
  isLogin,
  isSignUp,
  handleNavigation,
}: {
  isLogin: boolean;
  isSignUp: boolean;
  handleNavigation: (route: string) => void;
}) => {
  return (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleNavigation("/(public)/about")}
      >
        <Ionicons name="information-circle-outline" size={20} color="#89acff" />
        <Text style={styles.menuItemText}>About</Text>
      </TouchableOpacity>

      <View style={styles.menuDivider} />

      <Text style={styles.menuSection}>Authentication</Text>

      {isLogin && (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigation("/(auth)/sign-up")}
        >
          <Ionicons name="person-add-outline" size={20} color="#89acff" />
          <Text style={styles.menuItemText}>Sign Up</Text>
        </TouchableOpacity>
      )}

      {isSignUp && (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigation("/(auth)/login")}
        >
          <Ionicons name="log-in-outline" size={20} color="#89acff" />
          <Text style={styles.menuItemText}>Login</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default MenuItems;

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  menuItemText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(137, 172, 255, 0.15)",
    marginVertical: 8,
  },
  menuSection: {
    color: "#89acff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
});
