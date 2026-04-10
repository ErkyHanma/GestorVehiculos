import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const MenuItems = ({
  name,
  route,
  icon,
  handleNavigation,
}: {
  name: string;
  route: string;
  icon: string;
  handleNavigation: (route: string) => void;
}) => {
  return (
    <>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => handleNavigation(route)}
      >
        <Ionicons name={icon as any} size={20} color="#89acff" />
        <Text style={styles.menuItemText}>{name}</Text>
      </TouchableOpacity>
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
