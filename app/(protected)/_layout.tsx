import ProtectedHeaderMenu from "@/components/ProtectedHeaderMenu";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#0a0e14",
          borderTopColor: "rgba(137, 172, 255, 0.15)",
          borderTopWidth: 1,
        },

        tabBarItemStyle: {
          paddingVertical: 8,
        },

        tabBarActiveTintColor: "#89acff",
        tabBarInactiveTintColor: "#9CA3AF",

        headerShown: true,
        headerStyle: {
          backgroundColor: "#0a0e14",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 20,
          letterSpacing: -0.5,
        },
        headerTitleAlign: "center",
        headerTitle: "AutoPulse",
        headerLeft: () => <ProtectedHeaderMenu />,
      }}
    >
      <Tabs.Screen name="index" options={{ headerShown: false, href: null }} />

      <Tabs.Screen
        name="vehicles"
        options={{
          title: "Vehicles",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? "car" : "car-outline"}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="tires"
        options={{
          title: "Tires",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? "disc" : "disc-outline"}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="forum"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="maintenance"
        options={{
          title: "Maintenance",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? "construct" : "construct-outline"}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="fuel"
        options={{
          title: "Fuel",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? "flame" : "flame-outline"}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="finances"
        options={{
          title: "Finances",

          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? "cash" : "cash-outline"}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: null,
          tabBarIcon: ({ size, focused, color }) => (
            <Ionicons
              size={size}
              color={color}
              name={focused ? "person" : "person-outline"}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="changePassword"
        options={{
          title: "Change Password",
          href: null,
        }}
      />
    </Tabs>
  );
}
