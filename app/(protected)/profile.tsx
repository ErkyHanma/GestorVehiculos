import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
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
  const { token } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <View style={styles.photoGradientRing}>
          <View style={styles.photoInner}>
            <Image source={{ uri: profile?.fotoUrl }} style={styles.photo} />
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={handleUpdatePhoto}>
            <Ionicons name="create-outline" size={16} color="#002b6a" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>
          {profile?.nombre} {profile?.apellido}
        </Text>

        <View style={styles.badgeRow}>
          {profile?.rol ? (
            <View style={styles.badgePrimary}>
              <Text style={styles.badgePrimaryText}>{profile.rol}</Text>
            </View>
          ) : null}
          {profile?.grupo ? (
            <View style={styles.badgeTertiary}>
              <Text style={styles.badgeTertiaryText}>{profile.grupo}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.updatePhotoBtn}
          onPress={handleUpdatePhoto}
        >
          <Text style={styles.updatePhotoBtnText}>Update Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <InfoCard
          label="Full Name"
          value={`${profile?.nombre} ${profile?.apellido}`}
          icon="person-outline"
        />
        <InfoCard
          label="Email Address"
          value={profile?.correo}
          icon="mail-outline"
        />
        <InfoCard
          label="User Role"
          value={profile?.rol}
          icon="shield-outline"
          accent
        />
        <InfoCard label="Group" value={profile?.grupo} icon="people-outline" />
        <InfoCard
          label="Student ID"
          value={profile?.matricula}
          icon="school-outline"
          fullWidth
        />
      </View>

      <View style={styles.statsCard}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="flash-outline" size={16} color="#89acff" />
          <Text style={styles.statsTitle}>Account Summary</Text>
        </View>
        <View style={styles.statsRow}>
          <StatItem label="Student ID" value={profile?.matricula ?? "—"} />
          <StatItem label="Role" value={profile?.rol ?? "—"} highlight />
          <StatItem label="Group" value={profile?.grupo ?? "—"} />
        </View>
        <View style={styles.statsDivider} />
      </View>
    </ScrollView>
  );
}

function InfoCard({
  label,
  value,
  icon,
  accent = false,
  fullWidth = false,
}: {
  label: string;
  value: string;
  icon?: string;
  accent?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <View style={[styles.card, fullWidth && styles.cardFull]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <View style={styles.cardRow}>
        <Text style={[styles.cardValue, accent && { color: "#ff7076" }]}>
          {value ?? "—"}
        </Text>
        {icon ? (
          <Ionicons name={icon as any} size={18} color="#89acff" />
        ) : null}
      </View>
    </View>
  );
}

function StatItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && { color: "#ffb7fc" }]}>
        {value}
      </Text>
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
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  photoGradientRing: {
    width: 136,
    height: 136,
    borderRadius: 68,
    padding: 3,
    backgroundColor: "#89acff",
    marginBottom: 16,
    position: "relative",
  },
  photoInner: {
    flex: 1,
    borderRadius: 65,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#0a0e14",
  },
  photo: { width: "100%", height: "100%" },
  editBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#89acff",
    borderRadius: 16,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0a0e14",
  },
  name: {
    color: "#f1f3fc",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badgePrimary: {
    backgroundColor: "rgba(137,172,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(137,172,255,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgePrimaryText: {
    color: "#89acff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  badgeTertiary: {
    backgroundColor: "rgba(255,183,252,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,183,252,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeTertiaryText: {
    color: "#ffb7fc",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  updatePhotoBtn: {
    backgroundColor: "#89acff",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  updatePhotoBtnText: { color: "#002b6a", fontWeight: "600", fontSize: 14 },
  grid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  card: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#20262f",
    width: "47.5%",
  },
  cardFull: { width: "100%" },
  cardLabel: {
    color: "#72757d",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardValue: { color: "#f1f3fc", fontSize: 15, fontWeight: "500", flex: 1 },
  statsCard: {
    margin: 16,
    backgroundColor: "#151a21",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  statsTitle: {
    color: "#89acff",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { alignItems: "center", flex: 1 },
  statLabel: {
    color: "#72757d",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  statValue: { color: "#f1f3fc", fontSize: 18, fontWeight: "bold" },
  statsDivider: {
    marginTop: 20,
    height: 1,
    backgroundColor: "rgba(137,172,255,0.15)",
  },
});
