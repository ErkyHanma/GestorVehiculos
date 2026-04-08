import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import MenuItems from "./MenuItems";

const HeaderMenu = () => {
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
              <MenuItems
                isLogin={isLogin}
                isSignUp={isSignUp}
                handleNavigation={handleNavigation}
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default HeaderMenu;

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
});
