import { teamMembers } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const About = () => {
  const handleCall = async (phone: string) => {
    await Linking.openURL(`tel:${phone}`);
  };

  const handleOpenTelegram = async (telegramUrl: string) => {
    await Linking.openURL(telegramUrl);
  };

  const handleSendEmail = async (email: string) => {
    await Linking.openURL(`mailto:${email}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Our Team</Text>

      {teamMembers.map((member) => (
        <View key={member.id} style={styles.card}>
          <Image source={member.photoUrl} style={styles.photo} />

          <View style={styles.row}>
            <Ionicons name="person" size={18} color="#89acff" />
            <Text style={styles.label}>Nombre y Apellido:</Text>
            <Text style={styles.value}>{member.fullName}</Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="school" size={18} color="#89acff" />
            <Text style={styles.label}>Matricula ITLA:</Text>
            <Text style={styles.value}>{member.matricula}</Text>
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => handleCall(member.phone)}
          >
            <Ionicons name="call" size={18} color="#89acff" />
            <Text style={styles.actionText}>Telefono: {member.phone}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => handleSendEmail(member.email)}
          >
            <Ionicons name="mail" size={18} color="#89acff" />
            <Text style={styles.actionText}>{member.email}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

export default About;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e14",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 40,
    gap: 18,
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 6,
  },
  card: {
    borderRadius: 4,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#89acff",
  },
  photo: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  label: {
    color: "#89acff",
    fontWeight: "700",
    fontSize: 14,
  },
  value: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#89acff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#1d2430",
  },
  actionText: {
    color: "#89acff",
    fontWeight: "700",
    fontSize: 14,
  },
});
