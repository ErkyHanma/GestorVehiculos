import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AuthHeaderMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isLogin = pathname.includes("login");
  const isSignUp = pathname.includes("sign-up");

  const handleNavigation = (route: string) => {
    setMenuVisible(false);
    router.push(route as any);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="menu" size={24} color="#89acff" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={[styles.menuContent, styles.androidMenuBg]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation("/(public)/about")}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#89acff"
                />
                <Text style={styles.menuItemText}>About</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <Text style={styles.menuSection}>Authentication</Text>

              {isLogin && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation("/(auth)/sign-up")}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color="#89acff"
                  />
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
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AuthHeaderMenu;

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 16,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-start",
    paddingTop: 80,
  },
  menuContainer: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#89acff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  menuContent: {
    padding: 16,
  },
  androidMenuBg: {
    backgroundColor: "rgba(27, 32, 40, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(137, 172, 255, 0.15)",
  },
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
