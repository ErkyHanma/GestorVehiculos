import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE = "https://taller-itla.ia3x.com/api";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${API_BASE}/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProfile(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("foto", {
        uri: result.assets[0].uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);

      await fetch(`${API_BASE}/perfil/foto`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      fetchProfile();
    }
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#89acff" size="large" />
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      {/* Header with Photo */}
      <View style={styles.header}>
        <View style={styles.photoContainer}>
          <Image source={{ uri: profile?.fotoUrl }} style={styles.photo} />
          <TouchableOpacity style={styles.editBtn} onPress={handleUpdatePhoto}>
            <Text style={styles.editBtnText}>✎</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>
          {profile?.nombre} {profile?.apellido}
        </Text>
      </View>

      {/* Info Cards */}
      <View style={styles.grid}>
        <InfoCard
          label="Full Name"
          value={`${profile?.nombre} ${profile?.apellido}`}
        />
        <InfoCard label="Email" value={profile?.correo} />
        <InfoCard label="Role" value={profile?.rol} />
        <InfoCard label="Group" value={profile?.grupo} />
        <InfoCard label="Student ID" value={profile?.matricula} />
      </View>
    </ScrollView>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value ?? "—"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0e14" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0e14",
  },
  header: { alignItems: "center", paddingTop: 60, paddingBottom: 30 },
  photoContainer: { position: "relative", marginBottom: 16 },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#89acff",
  },
  editBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#89acff",
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  editBtnText: { color: "#002b6a", fontWeight: "bold" },
  name: { color: "#f1f3fc", fontSize: 24, fontWeight: "bold" },
  grid: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  cardLabel: {
    color: "#72757d",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardValue: { color: "#f1f3fc", fontSize: 16, fontWeight: "500" },
});
