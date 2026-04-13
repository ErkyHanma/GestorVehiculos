import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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

type Vehicle = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
};

type Maintenance = {
  id: number;
  vehiculo_id: number;
  tipo: string;
  costo: number;
  piezas: string;
  fecha: string;
  fotos: string[];
};

const formatDate = (fecha: string) => {
  const date = new Date(fecha);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function MaintenanceScreen() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<Maintenance | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [filterTipo, setFilterTipo] = useState("");
  const [showForm, setShowForm] = useState(false);

  const totalCosto = records.reduce((sum, r) => sum + Number(r.costo), 0);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE}/vehiculos?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setVehicles(data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const loadRecords = async (tipo = "", vId?: number) => {
    const id = vId ?? selectedVehicle?.id;
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/mantenimientos?vehiculo_id=${id}&tipo=${tipo}&page=1&limit=20`,
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
      setSelectedRecord(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setShowVehicleSelector(false);
    setRecords([]);
    setFilterTipo("");
    loadRecords("", v.id);
  };

  if (selectedRecord)
    return (
      <MaintenanceDetail
        record={selectedRecord}
        token={token!}
        onBack={() => {
          setSelectedRecord(null);
          loadRecords(filterTipo);
        }}
        onRefresh={() => fetchDetail(selectedRecord.id)}
      />
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Maintenance Log</Text>
          <Text style={styles.subtitle}>
            Health telemetry & service records
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (!selectedVehicle) {
              Alert.alert(
                "No vehicle selected",
                "Please select a vehicle first.",
              );
              return;
            }
            setShowForm(true);
          }}
        >
          <Text style={styles.addBtnText}>+ Log Service</Text>
        </TouchableOpacity>
      </View>

      <View>
        {/* Vehicle Selector */}
        <TouchableOpacity
          style={styles.vehicleSelector}
          onPress={() => setShowVehicleSelector(true)}
        >
          {loadingVehicles ? (
            <ActivityIndicator color="#89acff" size="small" />
          ) : selectedVehicle ? (
            <>
              <View>
                <Text style={styles.vehicleSelectorPlate}>
                  {selectedVehicle.placa}
                </Text>
                <Text style={styles.vehicleSelectorName}>
                  {selectedVehicle.marca} {selectedVehicle.modelo} ·{" "}
                  {selectedVehicle.anio}
                </Text>
              </View>
              <Text style={styles.vehicleSelectorArrow}>▼</Text>
            </>
          ) : (
            <>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="car-outline" size={16} color="#72757d" />
                <Text style={styles.vehicleSelectorPlaceholder}>
                  Select a vehicle...
                </Text>
              </View>
              <Text style={styles.vehicleSelectorArrow}>▼</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Stats */}
        {records.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Cost</Text>
              <Text style={styles.statValue}>
                RD$ {totalCosto.toLocaleString("es-DO")}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Records</Text>
              <Text style={styles.statValue}>{records.length}</Text>
            </View>
          </View>
        )}

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={{ maxHeight: 50 }}
        >
          <TouchableOpacity
            style={[styles.chip, filterTipo === "" && styles.chipActive]}
            onPress={() => {
              setFilterTipo("");
              loadRecords("");
            }}
          >
            <Text
              style={[
                styles.chipText,
                filterTipo === "" && styles.chipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {[
            "Oil Change",
            "Brakes",
            "Suspension",
            "Tires",
            "Engine",
            "Electrical",
            "Bodywork",
            "Other",
          ].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, filterTipo === cat && styles.chipActive]}
              onPress={() => {
                setFilterTipo(cat);
                loadRecords(cat);
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  filterTipo === cat && styles.chipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#89acff" size="large" />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={records}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => fetchDetail(item.id)}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="build-outline" size={22} color="#89acff" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.tipo}</Text>
                  <Text style={styles.cardDate}>
                    {formatDate(item.fecha)} · {selectedVehicle?.placa}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.cardCost}>
                    RD$ {item.costo.toLocaleString("es-DO")}
                  </Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                  </View>
                </View>
              </View>

              {item.piezas ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.partsRow}>
                    {item.piezas.split(",").map((p, i) => (
                      <View key={i} style={styles.partTag}>
                        <Text style={styles.partTagText}>PART: {p.trim()}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              ) : null}

              {item.fotos?.length > 0 && (
                <Text style={styles.cardPhotos}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 6,
                    }}
                  >
                    <Ionicons name="camera-outline" size={12} color="#ffb7fc" />
                    <Text style={styles.cardPhotos}>
                      {item.fotos.length} photo
                      {item.fotos.length > 1 ? "s" : ""}
                    </Text>
                  </View>
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {selectedVehicle
                ? "No maintenance records found."
                : "Select a vehicle to load records."}
            </Text>
          }
        />
      )}

      {/* Vehicle Selector Modal */}
      <Modal visible={showVehicleSelector} animationType="slide" transparent>
        <View style={styles.selectorOverlay}>
          <View style={styles.selectorSheet}>
            <Text style={styles.selectorTitle}>Select Vehicle</Text>
            {vehicles.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={styles.selectorItem}
                onPress={() => handleSelectVehicle(v)}
              >
                <View style={styles.selectorPlateTag}>
                  <Text style={styles.selectorPlate}>{v.placa}</Text>
                </View>
                <View>
                  <Text style={styles.selectorName}>
                    {v.marca} {v.modelo}
                  </Text>
                  <Text style={styles.selectorYear}>{v.anio}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.selectorCancel}
              onPress={() => setShowVehicleSelector(false)}
            >
              <Text style={styles.selectorCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide">
        <MaintenanceForm
          token={token!}
          vehiculoId={selectedVehicle?.id.toString() ?? ""}
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
// ─── Maintenance Detail ───────────────────────────────────
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.detailHeader}>
        <View style={styles.detailIconBox}>
          <Ionicons name="build-outline" size={26} color="#89acff" />
        </View>
        <View>
          <Text style={styles.detailTitle}>{record.tipo}</Text>
          <Text style={styles.detailSubtitle}>{formatDate(record.fecha)}</Text>
        </View>
      </View>

      <View style={styles.costCard}>
        <Text style={styles.costLabel}>Service Cost</Text>
        <Text style={styles.costValue}>
          RD${" "}
          {record.costo.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
        </Text>
      </View>

      {record.piezas ? (
        <View style={styles.partsSection}>
          <Text style={styles.partsSectionTitle}>Parts Used</Text>
          <View style={styles.partsTagsRow}>
            {record.piezas.split(",").map((p, i) => (
              <View key={i} style={styles.partTag}>
                <Text style={styles.partTagText}>PART: {p.trim()}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.gallerySection}>
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryTitle}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons name="images-outline" size={16} color="#f1f3fc" />
              <Text style={styles.galleryTitle}>
                Service Visuals ({record.fotos?.length ?? 0}/5)
              </Text>
            </View>
          </Text>
          {(record.fotos?.length ?? 0) < 5 && (
            <TouchableOpacity
              style={styles.addPhotoBtn}
              onPress={handleAddPhotos}
            >
              <Text style={styles.addPhotoBtnText}>+ Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {record.fotos?.length > 0 ? (
          <View style={styles.photoGrid}>
            {record.fotos.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={i === 0 ? styles.photoMain : styles.photoThumb}
              />
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addPhotosEmpty}
            onPress={handleAddPhotos}
          >
            <Ionicons name="camera-outline" size={24} color="#72757d" />
            <Text style={[styles.addPhotosEmptyText, { marginTop: 8 }]}>
              Add photos to this record
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

// ─── Maintenance Form ─────────────────────────────────────

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
  const CATEGORIES = [
    "Oil Change",
    "Brakes",
    "Suspension",
    "Tires",
    "Engine",
    "Electrical",
    "Bodywork",
    "Other",
  ];

  const [form, setForm] = useState({
    tipo: "",
    costo: "",
    piezas: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [photos, setPhotos] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // ✅ Validación de fecha (igual que en pinchazos, pero corregida)
  const isValidDate = (dateStr: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) return false;

    // Validar coherencia real (ej: 2026-02-30)
    if (
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Permite HOY, bloquea futuro
    if (date > today) return false;

    // Límite inferior razonable
    if (year < 2000) return false;

    return true;
  };

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
    if (!form.tipo || !form.costo) {
      Alert.alert("Error", "Type and cost are required.");
      return;
    }

    // ✅ Validación aplicada aquí
    if (!isValidDate(form.fecha)) {
      Alert.alert(
        "Error",
        "Invalid date. Use YYYY-MM-DD and a valid past or current date.",
      );
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      const parsedCosto = Number(form.costo.replace(",", "."));

      formData.append(
        "datax",
        JSON.stringify({
          vehiculo_id: Number(vehiculoId),
          tipo: form.tipo,
          costo: parsedCosto,
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
        <View>
          <Text style={styles.title}>New Service</Text>
          <Text style={styles.subtitle}>Register new entry</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Category selector */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>SERVICE CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  form.tipo === cat && styles.categoryChipActive,
                ]}
                onPress={() => setForm({ ...form, tipo: cat })}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    form.tipo === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {[
        {
          key: "costo",
          label: "COST (RD$)",
          placeholder: "0.00",
          keyboard: "numeric",
        },
        {
          key: "piezas",
          label: "PARTS USED (BOM)",
          placeholder: "Filter, oil 5W-30...",
        },
        { key: "fecha", label: "DATE", placeholder: "YYYY-MM-DD" },
      ].map(({ key, label, placeholder, keyboard }) => (
        <View key={key} style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput
            style={styles.fieldInput}
            placeholder={placeholder}
            placeholderTextColor="#72757d"
            keyboardType={keyboard as any}
            value={(form as any)[key]}
            onChangeText={(text) => setForm({ ...form, [key]: text })}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.photoPickerBtn} onPress={pickPhotos}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons name="camera-outline" size={18} color="#72757d" />
          <Text style={styles.photoPickerText}>
            Add Photos ({photos.length}/5)
          </Text>
        </View>
      </TouchableOpacity>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: 16, marginTop: 12 }}
        >
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
          {saving ? "Saving..." : "✓ Commit to Record"}
        </Text>
      </TouchableOpacity>
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
    backgroundColor: "#0a0e14",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 16,
    paddingTop: 60,
  },
  title: { color: "#f1f3fc", fontSize: 26, fontWeight: "bold" },
  subtitle: { color: "#72757d", fontSize: 12, marginTop: 2 },
  addBtn: {
    backgroundColor: "#89acff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 13 },
  vehicleSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  vehicleSelectorPlate: {
    color: "#89acff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  vehicleSelectorName: { color: "#72757d", fontSize: 12, marginTop: 2 },
  vehicleSelectorPlaceholder: { color: "#72757d", fontSize: 14 },
  vehicleSelectorArrow: { color: "#89acff", fontSize: 12 },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 4,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  statLabel: {
    color: "#72757d",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: { color: "#89acff", fontSize: 18, fontWeight: "bold" },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#151a21",
    borderWidth: 1,
    borderColor: "#20262f",
    height: 34,
    justifyContent: "center",
    alignItems: "center",
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
    letterSpacing: 0.5,
  },
  chipTextActive: { color: "#89acff" },
  filterClearBtn: { padding: 8 },
  filterClearText: { color: "#72757d", fontSize: 14 },
  card: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#20262f",
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconText: { fontSize: 20 },
  cardInfo: { flex: 1 },
  cardTitle: { color: "#f1f3fc", fontSize: 15, fontWeight: "bold" },
  cardDate: { color: "#72757d", fontSize: 12, marginTop: 2 },
  cardRight: { alignItems: "flex-end" },
  cardCost: { color: "#f1f3fc", fontSize: 16, fontWeight: "bold" },
  verifiedBadge: {
    backgroundColor: "rgba(255,183,252,0.1)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
    marginTop: 4,
  },
  verifiedBadgeText: {
    color: "#ffb7fc",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  partsRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  partTag: {
    backgroundColor: "#20262f",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  partTagText: { color: "#a8abb3", fontSize: 10, fontFamily: "monospace" },
  cardPhotos: { color: "#ffb7fc", fontSize: 12, marginTop: 6 },
  emptyText: {
    color: "#72757d",
    textAlign: "center",
    marginTop: 40,
    padding: 16,
  },
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#20262f",
  },
  selectorPlateTag: {
    backgroundColor: "#0a0e14",
    borderWidth: 1,
    borderColor: "#20262f",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  selectorPlate: {
    color: "#89acff",
    fontSize: 13,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  selectorName: { color: "#f1f3fc", fontSize: 14, fontWeight: "600" },
  selectorYear: { color: "#72757d", fontSize: 12, marginTop: 2 },
  selectorCancel: { marginTop: 16, padding: 14, alignItems: "center" },
  selectorCancelText: { color: "#ff7076", fontSize: 16 },
  backBtn: { padding: 16, paddingTop: 60 },
  backBtnText: { color: "#89acff", fontSize: 16 },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  detailIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#20262f",
    justifyContent: "center",
    alignItems: "center",
  },
  detailIconText: { fontSize: 24 },
  detailTitle: { color: "#f1f3fc", fontSize: 22, fontWeight: "bold" },
  detailSubtitle: { color: "#72757d", fontSize: 13, marginTop: 2 },
  costCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#151a21",
    borderRadius: 14,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#89acff",
    borderWidth: 1,
    borderColor: "#20262f",
  },
  costLabel: {
    color: "#72757d",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  costValue: { color: "#f1f3fc", fontSize: 28, fontWeight: "bold" },
  partsSection: { marginHorizontal: 16, marginBottom: 16 },
  partsSectionTitle: {
    color: "#72757d",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  partsTagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gallerySection: { paddingHorizontal: 16, marginBottom: 40 },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  galleryTitle: { color: "#f1f3fc", fontSize: 15, fontWeight: "bold" },
  addPhotoBtn: {
    backgroundColor: "#20262f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#44484f",
  },
  addPhotoBtnText: { color: "#89acff", fontSize: 12, fontWeight: "600" },
  photoGrid: { gap: 8 },
  photoMain: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#20262f",
  },
  photoThumb: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: "#20262f",
  },
  addPhotosEmpty: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#20262f",
    borderStyle: "dashed",
  },
  addPhotosEmptyText: { color: "#72757d", fontSize: 14 },
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
  photoRow: { flexDirection: "row", gap: 8 },
  saveBtn: {
    margin: 16,
    marginTop: 24,
    backgroundColor: "#89acff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 16 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#151a21",
    borderWidth: 1,
    borderColor: "#20262f",
  },
  categoryChipActive: {
    backgroundColor: "rgba(137,172,255,0.15)",
    borderColor: "#89acff",
  },
  categoryChipText: { color: "#72757d", fontSize: 12, fontWeight: "600" },
  categoryChipTextActive: { color: "#89acff" },
});
