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

type TeamMember = {
  id: string;
  fullName: string;
  matricula: string;
  phone: string;
  telegramUrl: string;
  email: string;
  photoUrl: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: "1",
    fullName: "Nombre Apellido 1",
    matricula: "2023-0001",
    phone: "+18095550101",
    telegramUrl: "https://t.me/username1",
    email: "miembro1@itla.edu.do",
    photoUrl: "https://i.pravatar.cc/400?img=12",
  },
  {
    id: "2",
    fullName: "Nombre Apellido 2",
    matricula: "2023-0002",
    phone: "+18095550102",
    telegramUrl: "https://t.me/username2",
    email: "miembro2@itla.edu.do",
    photoUrl: "https://i.pravatar.cc/400?img=32",
  },
];

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
          <Image source={{ uri: member.photoUrl }} style={styles.photo} />

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
            onPress={() => handleOpenTelegram(member.telegramUrl)}
          >
            <Ionicons name="paper-plane" size={18} color="#89acff" />
            <Text style={styles.actionText}>Telegram</Text>
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
    backgroundColor: "#2c323d",
    borderRadius: 10,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#89acff",
  },
  photo: {
    width: "100%",
    height: 220,
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
