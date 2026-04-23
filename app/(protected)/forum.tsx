import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE = "https://taller-itla.ia3x.com/api";

// ─── Types ───────────────────────────────────────────────
type Vehicle = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  foto_url: string;
};

type Topic = {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  vehiculo: string;
  vehiculoFoto: string;
  autor: string;
  totalRespuestas: number;
  ultimaRespuesta?: string;
};

type Reply = {
  id: number;
  contenido: string;
  fecha: string;
  autor: string;
};

type TopicDetail = Topic & { respuestas: Reply[] };

const formatDate = (fecha: string) =>
  new Date(fecha).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

// ─── Main Screen ─────────────────────────────────────────
export default function ForumScreen() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "mine">("all");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [myTopics, setMyTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<TopicDetail | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    fetchTopics();
    fetchVehicles();

    fetchMyTopics();
    const interval = setInterval(() => {
      fetchMyTopics();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/foro/temas?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTopics(data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTopics = async () => {
    try {
      const res = await fetch(`${API_BASE}/foro/mis-temas?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMyTopics(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE}/vehiculos?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVehicles(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopicDetail = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/foro/detalle?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedTopic(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (selectedTopic) {
    return (
      <TopicDetailView
        topic={selectedTopic}
        token={token!}
        onBack={() => setSelectedTopic(null)}
        onRefresh={() => fetchTopicDetail(selectedTopic.id)}
      />
    );
  }

  const displayTopics = activeTab === "all" ? topics : myTopics;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Community Forum</Text>
          <Text style={styles.subtitle}>
            Connect, share insights and manage your threads
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={async () => {
            await fetchVehicles();
            setShowCreateModal(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={16} color="#002b6a" />
          <Text style={styles.createBtnText}>Create Topic</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[
          { key: "all", label: "Recent Discussions" },
          { key: "mine", label: "My Topics" },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === key && styles.tabTextActive,
              ]}
            >
              {label}
            </Text>
            {key === "mine" && myTopics.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{myTopics.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#89acff" size="large" />
        </View>
      ) : (
        <FlatList
          data={displayTopics}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 14 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.topicCard}
              onPress={() => fetchTopicDetail(item.id)}
            >
              {/* Vehicle photo */}
              {item.vehiculoFoto ? (
                <Image
                  source={{ uri: item.vehiculoFoto }}
                  style={styles.topicImage}
                />
              ) : (
                <View style={[styles.topicImage, styles.topicImagePlaceholder]}>
                  <Ionicons name="car-outline" size={24} color="#72757d" />
                </View>
              )}

              <View style={styles.topicContent}>
                {/* Vehicle badge */}
                <View style={styles.vehicleBadge}>
                  <Ionicons
                    name="car-sport-outline"
                    size={10}
                    color="#89acff"
                  />
                  <Text style={styles.vehicleBadgeText}>{item.vehiculo}</Text>
                </View>

                <Text style={styles.topicTitle} numberOfLines={2}>
                  {item.titulo}
                </Text>
                <Text style={styles.topicDesc} numberOfLines={2}>
                  {item.descripcion}
                </Text>

                <View style={styles.topicMeta}>
                  <View style={styles.topicMetaLeft}>
                    <Ionicons name="person-outline" size={12} color="#72757d" />
                    <Text style={styles.topicAuthor}>{item.autor}</Text>
                    <Text style={styles.topicDot}>·</Text>
                    <Text style={styles.topicDate}>
                      {formatDate(item.fecha)}
                    </Text>
                  </View>
                  <View style={styles.topicMetaRight}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={12}
                      color="#72757d"
                    />
                    <Text style={styles.topicReplies}>
                      {item.totalRespuestas}
                    </Text>
                  </View>
                </View>

                {activeTab === "mine" && item.ultimaRespuesta && (
                  <Text style={styles.lastActivity}>
                    Last activity: {formatDate(item.ultimaRespuesta)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {activeTab === "mine"
                ? "You haven't created any topics yet."
                : "No discussions found."}
            </Text>
          }
        />
      )}

      {/* Create Topic Modal */}
      <Modal visible={showCreateModal} animationType="slide">
        <CreateTopicForm
          token={token!}
          vehicles={vehicles}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTopics();
            fetchMyTopics();
          }}
        />
      </Modal>
    </View>
  );
}

// ─── Topic Detail View ────────────────────────────────────
function TopicDetailView({
  topic,
  token,
  onBack,
  onRefresh,
}: {
  topic: TopicDetail;
  token: string;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleReply = async () => {
    if (!reply.trim()) {
      Alert.alert("Error", "Reply cannot be empty.");
      return;
    }
    setSending(true);
    try {
      const body = new URLSearchParams();
      body.append(
        "datax",
        JSON.stringify({
          tema_id: topic.id,
          contenido: reply.trim(),
        }),
      );
      const res = await fetch(`${API_BASE}/foro/responder`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const data = await res.json();
      if (data.success) {
        setReply("");
        onRefresh();
      } else {
        Alert.alert("Error", data.message ?? "Could not post reply.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back-outline" size={20} color="#89acff" />
          <Text style={styles.backBtnText}>Back to Forum</Text>
        </TouchableOpacity>

        {/* Topic hero */}
        {topic.vehiculoFoto ? (
          <Image
            source={{ uri: topic.vehiculoFoto }}
            style={styles.detailImage}
          />
        ) : null}

        <View style={styles.detailContent}>
          <View style={styles.vehicleBadge}>
            <Ionicons name="car-sport-outline" size={10} color="#89acff" />
            <Text style={styles.vehicleBadgeText}>{topic.vehiculo}</Text>
          </View>

          <Text style={styles.detailTitle}>{topic.titulo}</Text>

          <View style={styles.detailMeta}>
            <Ionicons name="person-circle-outline" size={14} color="#72757d" />
            <Text style={styles.detailAuthor}>{topic.autor}</Text>
            <Text style={styles.topicDot}>·</Text>
            <Text style={styles.topicDate}>{formatDate(topic.fecha)}</Text>
          </View>

          <Text style={styles.detailDesc}>{topic.descripcion}</Text>
        </View>

        {/* Replies */}
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>
            Replies ({topic.totalRespuestas})
          </Text>
          {topic.respuestas?.length > 0 ? (
            topic.respuestas.map((r) => (
              <View key={r.id} style={styles.replyCard}>
                <View style={styles.replyHeader}>
                  <View style={styles.replyAvatar}>
                    <Ionicons name="person-outline" size={14} color="#89acff" />
                  </View>
                  <View>
                    <Text style={styles.replyAuthor}>{r.autor}</Text>
                    <Text style={styles.replyDate}>{formatDate(r.fecha)}</Text>
                  </View>
                </View>
                <Text style={styles.replyContent}>{r.contenido}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No replies yet. Be the first to respond.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Reply input */}
      <View style={styles.replyBar}>
        <TextInput
          style={styles.replyInput}
          placeholder="Write a reply..."
          placeholderTextColor="#72757d"
          value={reply}
          onChangeText={setReply}
          multiline
        />
        <TouchableOpacity
          style={[styles.replyBtn, sending && { opacity: 0.6 }]}
          onPress={handleReply}
          disabled={sending}
        >
          <Ionicons name="send-outline" size={18} color="#002b6a" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Create Topic Form ────────────────────────────────────
function CreateTopicForm({
  token,
  vehicles,
  onClose,
  onSuccess,
}: {
  token: string;
  vehicles: Vehicle[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [saving, setSaving] = useState(false);

  // Solo vehículos con foto
  const vehiclesWithPhoto = vehicles.filter(
    (v) => v.foto_url && v.foto_url.trim() !== "",
  );

  const handleSave = async () => {
    if (!selectedVehicle) {
      Alert.alert("Error", "Please select a vehicle.");
      return;
    }
    if (!titulo.trim()) {
      Alert.alert("Error", "Title is required.");
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert("Error", "Description is required.");
      return;
    }

    setSaving(true);
    try {
      const body = new URLSearchParams();
      body.append(
        "datax",
        JSON.stringify({
          vehiculo_id: selectedVehicle.id,
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
        }),
      );
      const res = await fetch(`${API_BASE}/foro/crear`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        Alert.alert("Error", data.message ?? "Could not create topic.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formHeader}>
        <View>
          <Text style={styles.title}>Create Topic</Text>
          <Text style={styles.subtitle}>Start a new discussion</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle selector */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>VEHICLE (must have photo)</Text>
        <TouchableOpacity
          style={styles.vehicleSelector}
          onPress={() => setShowVehicleSelector(true)}
        >
          {selectedVehicle ? (
            <View style={styles.vehicleSelectorSelected}>
              {selectedVehicle.foto_url ? (
                <Image
                  source={{ uri: selectedVehicle.foto_url }}
                  style={styles.vehicleSelectorThumb}
                />
              ) : null}
              <View>
                <Text style={styles.vehicleSelectorPlate}>
                  {selectedVehicle.placa}
                </Text>
                <Text style={styles.vehicleSelectorName}>
                  {selectedVehicle.marca} {selectedVehicle.modelo}
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons name="car-outline" size={16} color="#72757d" />
              <Text style={styles.vehicleSelectorPlaceholder}>
                Select a vehicle with photo...
              </Text>
            </View>
          )}
          <Text style={styles.vehicleSelectorArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>TOPIC TITLE</Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="e.g. Engine noise after oil change"
          placeholderTextColor="#72757d"
          value={titulo}
          onChangeText={setTitulo}
          maxLength={150}
        />
      </View>

      {/* Description */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>DESCRIPTION</Text>
        <TextInput
          style={[styles.fieldInput, { height: 120, textAlignVertical: "top" }]}
          placeholder="Describe your topic in detail..."
          placeholderTextColor="#72757d"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Ionicons name="chatbubbles-outline" size={16} color="#002b6a" />
        <Text style={styles.saveBtnText}>
          {saving ? "Posting..." : "Post Topic"}
        </Text>
      </TouchableOpacity>

      {/* Vehicle Selector Modal */}
      <Modal visible={showVehicleSelector} animationType="slide" transparent>
        <View style={styles.selectorOverlay}>
          <View style={styles.selectorSheet}>
            <Text style={styles.selectorTitle}>Select Vehicle</Text>
            {vehiclesWithPhoto.length === 0 ? (
              <View style={styles.centered}>
                <Ionicons name="warning-outline" size={32} color="#ff7076" />
                <Text style={[styles.emptyText, { marginTop: 12 }]}>
                  No vehicles with photos found.{"\n"}Add a photo to a vehicle
                  first.
                </Text>
              </View>
            ) : (
              vehiclesWithPhoto.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={styles.selectorItem}
                  onPress={() => {
                    setSelectedVehicle(v);
                    setShowVehicleSelector(false);
                  }}
                >
                  <Image
                    source={{ uri: v.foto_url }}
                    style={styles.selectorThumb}
                  />
                  <View>
                    <Text style={styles.selectorName}>
                      {v.marca} {v.modelo} {v.anio}
                    </Text>
                    <Text style={styles.selectorPlate}>{v.placa}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={styles.selectorCancel}
              onPress={() => setShowVehicleSelector(false)}
            >
              <Text style={styles.selectorCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0e14" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  header: { padding: 16, paddingTop: 60 },
  title: { color: "#f1f3fc", fontSize: 26, fontWeight: "bold" },
  subtitle: { color: "#72757d", fontSize: 12, marginTop: 2, marginBottom: 12 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#89acff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  createBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 13 },

  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#20262f",
    paddingBottom: 4,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#89acff" },
  tabText: { color: "#72757d", fontSize: 14, fontWeight: "500" },
  tabTextActive: { color: "#89acff", fontWeight: "700" },
  tabBadge: {
    backgroundColor: "#ff7076",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },

  // Topic card
  topicCard: {
    backgroundColor: "#151a21",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#20262f",
  },
  topicImage: { width: "100%", height: 140, backgroundColor: "#20262f" },
  topicImagePlaceholder: { justifyContent: "center", alignItems: "center" },
  topicContent: { padding: 14 },
  vehicleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(137,172,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(137,172,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  vehicleBadgeText: {
    color: "#89acff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  topicTitle: {
    color: "#f1f3fc",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  topicDesc: {
    color: "#72757d",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  topicMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topicMetaLeft: { flexDirection: "row", alignItems: "center", gap: 4 },
  topicMetaRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  topicAuthor: { color: "#72757d", fontSize: 11 },
  topicDot: { color: "#44484f", fontSize: 11 },
  topicDate: { color: "#72757d", fontSize: 11 },
  topicReplies: { color: "#72757d", fontSize: 11 },
  lastActivity: { color: "#ffb7fc", fontSize: 10, marginTop: 6 },
  emptyText: {
    color: "#72757d",
    textAlign: "center",
    marginTop: 40,
    padding: 16,
    lineHeight: 20,
  },

  // Detail
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 16,
    paddingTop: 60,
  },
  backBtnText: { color: "#89acff", fontSize: 15 },
  detailImage: { width: "100%", height: 200, backgroundColor: "#20262f" },
  detailContent: { padding: 16 },
  detailTitle: {
    color: "#f1f3fc",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
  },
  detailMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  detailAuthor: { color: "#72757d", fontSize: 13 },
  detailDesc: { color: "#a8abb3", fontSize: 14, lineHeight: 22 },

  // Replies
  repliesSection: { paddingHorizontal: 16, marginTop: 8 },
  repliesTitle: {
    color: "#f1f3fc",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  replyCard: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(137,172,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(137,172,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  replyAuthor: { color: "#f1f3fc", fontSize: 13, fontWeight: "600" },
  replyDate: { color: "#72757d", fontSize: 11 },
  replyContent: { color: "#a8abb3", fontSize: 14, lineHeight: 20 },

  // Reply bar
  replyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    paddingBottom: 24,
    backgroundColor: "#0a0e14",
    borderTopWidth: 1,
    borderTopColor: "#20262f",
  },
  replyInput: {
    flex: 1,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 12,
    color: "#f1f3fc",
    borderWidth: 1,
    borderColor: "#20262f",
    fontSize: 14,
    maxHeight: 80,
  },
  replyBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#89acff",
    justifyContent: "center",
    alignItems: "center",
  },

  // Create form
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 16,
    paddingTop: 60,
  },
  cancelText: { color: "#ff7076", fontSize: 16 },
  fieldGroup: { paddingHorizontal: 16, marginBottom: 16 },
  fieldLabel: {
    color: "#72757d",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 14,
    color: "#f1f3fc",
    borderWidth: 1,
    borderColor: "#20262f",
    fontSize: 15,
  },
  vehicleSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  vehicleSelectorSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  vehicleSelectorThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#20262f",
  },
  vehicleSelectorPlate: {
    color: "#89acff",
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  vehicleSelectorName: { color: "#72757d", fontSize: 11, marginTop: 2 },
  vehicleSelectorPlaceholder: { color: "#72757d", fontSize: 14 },
  vehicleSelectorArrow: { color: "#89acff", fontSize: 12 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 16,
    marginTop: 8,
    backgroundColor: "#89acff",
    borderRadius: 12,
    padding: 16,
  },
  saveBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 16 },

  // Selector modal
  selectorOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  selectorSheet: {
    backgroundColor: "#151a21",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  selectorTitle: {
    color: "#f1f3fc",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  selectorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#20262f",
  },
  selectorThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#20262f",
  },
  selectorPlate: {
    color: "#89acff",
    fontSize: 12,
    fontFamily: "monospace",
    letterSpacing: 1,
    marginTop: 2,
  },
  selectorName: { color: "#f1f3fc", fontSize: 14, fontWeight: "600" },
  selectorCancel: { marginTop: 16, padding: 14, alignItems: "center" },
  selectorCancelText: { color: "#ff7076", fontSize: 16 },
});
