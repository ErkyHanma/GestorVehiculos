import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Login = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const [studentId, setStudentId] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(public)");
      // router.replace("/(protected)/profile");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!studentId || !accessKey) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setError("");
      await login(studentId, accessKey);
      router.replace("/(public)");
      // router.replace("/(protected)/profile");
    } catch (err) {
      setError("Authentication failed. Please check your credentials.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="flash" size={32} color="#0a0e14" />
          </View>
          <Text style={styles.logoText}>AUTOPULSE</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>
            Synchronize your credentials to explore AutoPulse.
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#ff716c" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>STUDENT ID</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="car-outline"
                size={20}
                color="#89acff"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. 2025-0001"
                placeholderTextColor="#6b7280"
                value={studentId}
                onChangeText={setStudentId}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity>
                <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#89acff"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#6b7280"
                value={accessKey}
                onChangeText={setAccessKey}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#0a0e14" />
            ) : (
              <>
                <Text style={styles.buttonText}>LOGIN</Text>
                <Ionicons name="arrow-forward" size={20} color="#0a0e14" />
              </>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerQuestion}>
              Dont have an AutoPulse account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
              <Text style={styles.registerLink}>Create new account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e14",
  },
  containerContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
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
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#9ca3af",
    marginBottom: 32,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 113, 108, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 113, 108, 0.2)",
  },
  errorText: {
    color: "#ff716c",
    fontSize: 14,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#89acff",
    marginBottom: 12,
    letterSpacing: 1,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  forgotText: {
    fontSize: 11,
    color: "#6b7280",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0a0e14",
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 4,
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
  },
  registerLink: {
    fontSize: 16,
    fontWeight: "600",
    color: "#89acff",
  },
});
