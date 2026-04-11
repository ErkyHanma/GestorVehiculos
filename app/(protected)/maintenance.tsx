import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
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

// Types
type Maintenance = {
  id: number;
  vehiculo_id: number;
  tipo: string;
  costo: number;
  piezas: string;
  fecha: string;
  fotos: string[];
};

// Main Screen
export default function MaintenanceScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [selected, setSelected] = useState<Maintenance | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterTipo, setFilterTipo] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [vehiculoId, setVehiculoId] = useState("");

  // Se necesita vehiculo_id — en producción
  // viene de la navegación desde Vehicles. Por ahora manual.
  const loadRecords = async (tipo = "") => {
    if (!vehiculoId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/mantenimientos?vehiculo_id=${vehiculoId}&tipo=${tipo}&page=1&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setRecords(data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/mantenimientos/detalle?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelected(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilter = (tipo: string) => {
    setFilterTipo(tipo);
    loadRecords(tipo);
  };

  if (selected)
    return (
      <MaintenanceDetail
        record={selected}
        token={token!}
        onBack={() => setSelected(null)}
        onRefresh={() => fetchDetail(selected.id)}
      />
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Maintenance Log</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.addBtnText}>+ Log Service</Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle ID input — temporal hasta tener desde Vehicles */}
      <View style={styles.vehicleInputRow}>
        <TextInput
          style={styles.vehicleInput}
          placeholder="Enter Vehicle ID..."
          placeholderTextColor="#72757d"
          keyboardType="numeric"
          value={vehiculoId}
          onChangeText={setVehiculoId}
        />
        <TouchableOpacity style={styles.loadBtn} onPress={() => loadRecords()}>
          <Text style={styles.loadBtnText}>Load</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {[
          "",
          "Cambio de aceite",
          "Frenos",
          "Suspensión",
          "Motor",
          "Llantas",
        ].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[styles.chip, filterTipo === tipo && styles.chipActive]}
            onPress={() => handleFilter(tipo)}
          >
            <Text
              style={[
                styles.chipText,
                filterTipo === tipo && styles.chipTextActive,
              ]}
            >
              {tipo === "" ? "All" : tipo}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#89acff" size="large" />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => fetchDetail(item.id)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardIconText}>🔧</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.tipo}</Text>
                  <Text style={styles.cardDate}>{item.fecha}</Text>
                </View>
                <Text style={styles.cardCost}>
                  RD$ {item.costo.toLocaleString("es-DO")}
                </Text>
              </View>
              {item.piezas ? (
                <Text style={styles.cardParts} numberOfLines={1}>
                  Parts: {item.piezas}
                </Text>
              ) : null}
              {item.fotos?.length > 0 && (
                <Text style={styles.cardPhotos}>
                  📷 {item.fotos.length} photo{item.fotos.length > 1 ? "s" : ""}
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {vehiculoId
                ? "No maintenance records found."
                : "Enter a vehicle ID to load records."}
            </Text>
          }
        />
      )}

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide">
        <MaintenanceForm
          token={token!}
          vehiculoId={vehiculoId}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadRecords(filterTipo);
          }}
        />
      </Modal>
    </View>
  );
}

// Maintenance Detail
function MaintenanceDetail({
  record,
  token,
  onBack,
  onRefresh,
}: {
  record: Maintenance;
  token: string;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const handleAddPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const remaining = 5 - (record.fotos?.length ?? 0);
      const selected = result.assets.slice(0, remaining);

      if (selected.length === 0) {
        Alert.alert("Limit reached", "This record already has 5 photos.");
        return;
      }

      const formData = new FormData();
      formData.append("datax", JSON.stringify({ mantenimiento_id: record.id }));
      selected.forEach((asset, i) => {
        formData.append("fotos[]", {
          uri: asset.uri,
          name: `photo_${i}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      await fetch(`${API_BASE}/mantenimientos/fotos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      onRefresh();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>{record.tipo}</Text>
        <Text style={styles.detailSubtitle}>{record.fecha}</Text>
      </View>

      <View style={styles.detailCards}>
        <DetailCard
          label="Cost"
          value={`RD$ ${record.costo.toLocaleString("es-DO")}`}
        />
        {record.piezas ? (
          <DetailCard label="Parts" value={record.piezas} />
        ) : null}
      </View>

      {/* Photo Gallery */}
      <View style={styles.gallerySection}>
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryTitle}>
            Photos ({record.fotos?.length ?? 0}/5)
          </Text>
          {(record.fotos?.length ?? 0) < 5 && (
            <TouchableOpacity
              style={styles.addPhotoBtn}
              onPress={handleAddPhotos}
            >
              <Text style={styles.addPhotoBtnText}>+ Add Photos</Text>
            </TouchableOpacity>
          )}
        </View>

        {record.fotos?.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photoRow}>
              {record.fotos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={styles.galleryPhoto} />
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No photos yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

// Maintenance Form
function MaintenanceForm({
  token,
  vehiculoId,
  onClose,
  onSuccess,
}: {
  token: string;
  vehiculoId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    vehiculo_id: vehiculoId,
    tipo: "",
    costo: "",
    piezas: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [photos, setPhotos] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const pickPhotos = async () => {
    if (photos.length >= 5) {
      Alert.alert("Limit", "Maximum 5 photos allowed.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const available = 5 - photos.length;
      setPhotos([...photos, ...result.assets.slice(0, available)]);
    }
  };

  const handleSave = async () => {
    if (!form.tipo || !form.costo || !form.vehiculo_id) {
      Alert.alert("Error", "Vehicle ID, type and cost are required.");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        "datax",
        JSON.stringify({
          vehiculo_id: Number(form.vehiculo_id),
          tipo: form.tipo,
          costo: Number(form.costo),
          piezas: form.piezas,
          fecha: form.fecha,
        }),
      );
      photos.forEach((photo, i) => {
        formData.append("fotos[]", {
          uri: photo.uri,
          name: `photo_${i}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      const res = await fetch(`${API_BASE}/mantenimientos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        Alert.alert("Error", data.message ?? "Could not save record.");
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
        <Text style={styles.title}>New Service</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {[
        { key: "vehiculo_id", placeholder: "Vehicle ID", keyboard: "numeric" },
        { key: "tipo", placeholder: "Type (e.g. Oil Change)" },
        { key: "costo", placeholder: "Cost (RD$)", keyboard: "numeric" },
        { key: "piezas", placeholder: "Parts used (optional)" },
        { key: "fecha", placeholder: "Date (YYYY-MM-DD)" },
      ].map(({ key, placeholder, keyboard }) => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#72757d"
          keyboardType={keyboard as any}
          value={(form as any)[key]}
          onChangeText={(text) => setForm({ ...form, [key]: text })}
        />
      ))}

      {/* Photo picker */}
      <TouchableOpacity style={styles.photoPickerBtn} onPress={pickPhotos}>
        <Text style={styles.photoPickerText}>
          📷 Add Photos ({photos.length}/5)
        </Text>
      </TouchableOpacity>

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.photoRow}>
            {photos.map((p, i) => (
              <Image
                key={i}
                source={{ uri: p.uri }}
                style={styles.photoThumb}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? "Saving..." : "Save Record"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Detail Card
function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailCardLabel}>{label}</Text>
      <Text style={styles.detailCardValue}>{value}</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0e14" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0e14",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  title: { color: "#f1f3fc", fontSize: 28, fontWeight: "bold" },
  addBtn: {
    backgroundColor: "#89acff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 13 },
  vehicleInputRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  vehicleInput: {
    flex: 1,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 12,
    color: "#f1f3fc",
    borderWidth: 1,
    borderColor: "#20262f",
  },
  loadBtn: {
    backgroundColor: "#20262f",
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#44484f",
  },
  loadBtnText: { color: "#89acff", fontWeight: "600" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#151a21",
    borderWidth: 1,
    borderColor: "#20262f",
  },
  chipActive: {
    backgroundColor: "rgba(137,172,255,0.15)",
    borderColor: "#89acff",
  },
  chipText: {
    color: "#72757d",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chipTextActive: { color: "#89acff" },
  card: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#20262f",
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconText: { fontSize: 20 },
  cardInfo: { flex: 1 },
  cardTitle: { color: "#f1f3fc", fontSize: 16, fontWeight: "bold" },
  cardDate: { color: "#72757d", fontSize: 12, marginTop: 2 },
  cardCost: { color: "#89acff", fontSize: 15, fontWeight: "bold" },
  cardParts: { color: "#72757d", fontSize: 12, marginTop: 4 },
  cardPhotos: { color: "#ffb7fc", fontSize: 12, marginTop: 4 },
  emptyText: {
    color: "#72757d",
    textAlign: "center",
    marginTop: 40,
    padding: 16,
  },
  backBtn: { padding: 16, paddingTop: 60 },
  backBtnText: { color: "#89acff", fontSize: 16 },
  detailHeader: { paddingHorizontal: 16, marginBottom: 16 },
  detailTitle: { color: "#f1f3fc", fontSize: 24, fontWeight: "bold" },
  detailSubtitle: { color: "#72757d", fontSize: 14, marginTop: 4 },
  detailCards: { paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  detailCard: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  detailCardLabel: {
    color: "#72757d",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  detailCardValue: { color: "#f1f3fc", fontSize: 16, fontWeight: "500" },
  gallerySection: { paddingHorizontal: 16, marginBottom: 40 },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  galleryTitle: { color: "#f1f3fc", fontSize: 16, fontWeight: "bold" },
  addPhotoBtn: {
    backgroundColor: "#20262f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#44484f",
  },
  addPhotoBtnText: { color: "#89acff", fontSize: 12, fontWeight: "600" },
  photoRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  galleryPhoto: {
    width: 160,
    height: 120,
    borderRadius: 10,
    backgroundColor: "#20262f",
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#20262f",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  cancelText: { color: "#ff7076", fontSize: 16 },
  input: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 14,
    color: "#f1f3fc",
    borderWidth: 1,
    borderColor: "#20262f",
  },
  photoPickerBtn: {
    margin: 16,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#20262f",
    borderStyle: "dashed",
  },
  photoPickerText: { color: "#72757d", fontSize: 15 },
  saveBtn: {
    margin: 16,
    backgroundColor: "#89acff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 16 },
});
