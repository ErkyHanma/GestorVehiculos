import HeaderMenu from "@/components/HeaderMenu";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function PublicTabsLayout() {
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
        headerLeft: () => <HeaderMenu />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",

          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? "home" : "home-outline"}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: "Catalog",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? "book" : "book-outline"}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="vehicleDetails"
        options={{
          title: "Vehicle Details",
          href: null,
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          href: null,
          title: "About",
        }}
      />

      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? "newspaper" : "newspaper-outline"}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="newsDetails"
        options={{
          title: "News",
          href: null,
        }}
      />

      <Tabs.Screen
        name="videos"
        options={{
          title: "Videos",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? "videocam" : "videocam-outline"}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ size, focused, color }) => {
            return (
              <Ionicons
                size={size}
                color={color}
                name={focused ? "people" : "people-outline"}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="communityDetails"
        options={{
          title: "Community ",
          href: null,
        }}
      />
    </Tabs>
  );
}
