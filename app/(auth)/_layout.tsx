import HeaderMenu from "@/components/auth/HeaderMenu";
import { Tabs } from "expo-router";

export default function AuthTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: "none" },
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
        name="login"
        options={{
          href: null,
          headerTitle: "Login",
        }}
      />

      <Tabs.Screen
        name="sign-up"
        options={{
          href: null,
          headerTitle: "Sign Up",
        }}
      />

      <Tabs.Screen
        name="activate-account"
        options={{
          href: null,
          headerTitle: "Activate Account",
        }}
      />
    </Tabs>
  );
}
