import { Ionicons } from "@expo/vector-icons";
import React from "react";
import
  {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from "react-native";

const About = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.logoIcon}>
          <Ionicons name="flash" size={48} color="#0a0e14" />
        </View>
        <Text style={styles.title}>AutoPulse</Text>
        <Text style={styles.version}>V4.2.0 PERFORMANCE INTERFACE</Text>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>The Kinetic Cockpit</Text>
        <Text style={styles.description}>
          AutoPulse is a high-performance vehicle management system that
          transforms your automotive experience into a precision-engineered
          interface. Think of it as your vehicle command center, delivering
          real-time telemetry, diagnostics, and control at your fingertips.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Core Features</Text>
        <View style={styles.featureGrid}>
          <FeatureCard
            icon="speedometer-outline"
            title="Real-Time Telemetry"
            description="Monitor your vehicle's performance metrics in real-time"
          />
          <FeatureCard
            icon="shield-checkmark-outline"
            title="AES-256 Encryption"
            description="Military-grade security for all vehicle communications"
          />
          <FeatureCard
            icon="analytics-outline"
            title="Advanced Analytics"
            description="Deep insights into your driving patterns and efficiency"
          />
          <FeatureCard
            icon="notifications-outline"
            title="Smart Alerts"
            description="Proactive notifications for maintenance and diagnostics"
          />
        </View>
      </View>

      {/* Technology */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Technology Stack</Text>
        <View style={styles.techStack}>
          <TechItem
            label="React Native"
            value="High-performance cross-platform"
          />
          <TechItem label="Expo Router" value="File-based navigation system" />
          <TechItem label="TypeScript" value="Type-safe development" />
          <TechItem
            label="Secure Telemetry"
            value="AES-256 encrypted data transmission"
          />
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <TouchableOpacity style={styles.buttonWrapper}>
          <Ionicons name="mail-outline" size={20} color="#0a0e14" />
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 AutoPulse Systems. All rights reserved.
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Privacy Protocol</Text>
            </TouchableOpacity>
            <Text style={styles.footerDivider}>•</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIconContainer}>
      <Ionicons name={icon} size={24} color="#89acff" />
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </View>
);

const TechItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.techItem}>
    <Text style={styles.techLabel}>{label}</Text>
    <Text style={styles.techValue}>{value}</Text>
  </View>
);

export default About;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e14",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#89acff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 2,
    marginBottom: 8,
  },
  version: {
    fontSize: 12,
    color: "#6b7280",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: "#9ca3af",
    lineHeight: 24,
  },
  featureGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: "#0f141a",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(137, 172, 255, 0.15)",
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(137, 172, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 20,
  },
  techStack: {
    gap: 12,
  },
  techItem: {
    backgroundColor: "#0f141a",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#89acff",
  },
  techLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#89acff",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  techValue: {
    fontSize: 13,
    color: "#9ca3af",
  },
  ctaSection: {
    alignItems: "center",
    marginTop: 20,
  },
  buttonWrapper: {
    width: "100%",
    marginBottom: 40,
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
  footer: {
    alignItems: "center",
    gap: 12,
  },
  footerText: {
    fontSize: 12,
    color: "#6b7280",
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerLink: {
    fontSize: 13,
    color: "#9ca3af",
  },
  footerDivider: {
    color: "#6b7280",
  },
});
