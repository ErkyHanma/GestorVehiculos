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
  chasis: string;
  marca: string;
  modelo: string;
  anio: number;
  cantidad_ruedas: number;
  foto_url: string;
  fecha_registro: string;
};

type VehicleDetail = Vehicle & {
  resumen: {
    totalMantenimientos: number;
    totalCombustible: number;
    totalGastos: number;
    totalIngresos: number;
    totalInvertido: number;
    balance: number;
  };
};

export default function VehiclesScreen() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async (marca = "", modelo = "") => {
    try {
      const res = await fetch(
        `${API_BASE}/vehiculos?marca=${marca}&modelo=${modelo}&page=1&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setVehicles(data.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    fetchVehicles(text, "");
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#89acff" size="large" />
      </View>
    );

  if (selectedId)
    return (
      <VehicleDetailView
        vehicleId={selectedId}
        token={token!}
        onBack={() => {
          setSelectedId(null);
          fetchVehicles();
        }}
      />
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Garage</Text>
          <Text style={styles.subtitle}>Manage your fleet</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.addBtnText}>+ New Vehicle</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#72757d"
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by brand or model..."
          placeholderTextColor="#72757d"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {/* Section label */}
      <Text style={styles.sectionLabel}>Active Vehicles</Text>

      {/* List */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.vehicleCard}
            onPress={() => setSelectedId(item.id)}
          >
            <Image
              source={{ uri: item.foto_url }}
              style={styles.vehicleThumb}
            />
            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleNameRow}>
                <Text style={styles.vehicleName}>{item.modelo}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>
              <Text style={styles.vehicleBrand}>
                {item.marca} · {item.anio}
              </Text>
              <View style={styles.plateTag}>
                <Text style={styles.vehiclePlate}>{item.placa}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No vehicles registered yet.</Text>
        }
      />

      <Modal visible={showForm} animationType="slide">
        <VehicleForm
          token={token!}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchVehicles();
          }}
        />
      </Modal>
    </View>
  );
}

// ─── Vehicle Detail View ──────────────────────────────────
function VehicleDetailView({
  vehicleId,
  token,
  onBack,
}: {
  vehicleId: number;
  token: string;
  onBack: () => void;
}) {
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`${API_BASE}/vehiculos/detalle?id=${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setVehicle(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();

    const interval = setInterval(() => {
      fetchDetail();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleChangePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const formData = new FormData();

      formData.append("datax", JSON.stringify({ id: vehicleId }));
      formData.append("foto", {
        uri: result.assets[0].uri,
        name: "vehicle.jpg",
        type: "image/jpeg",
      } as any);

      await fetch(`${API_BASE}/vehiculos/foto`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      fetchDetail();
    }
  };

  if (loading || !vehicle)
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#89acff" size="large" />
      </View>
    );

  const r = vehicle.resumen;
  const fotoUri = (vehicle as any).fotoUrl ?? vehicle.foto_url;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      {/* Photo */}
      <View style={styles.detailPhotoContainer}>
        <Image source={{ uri: fotoUri }} style={styles.detailPhoto} />

        <TouchableOpacity
          style={styles.changePhotoBtn}
          onPress={handleChangePhoto}
        >
          <Ionicons name="camera-outline" size={14} color="#f1f3fc" />
          <Text style={styles.changePhotoBtnText}> Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Title row */}
      <View style={styles.detailTitleRow}>
        <View>
          <Text style={styles.detailInsightsLabel}>Vehicle Insights</Text>

          <Text style={styles.detailTitle}>
            {vehicle.marca} {vehicle.modelo}
          </Text>

          <Text style={styles.detailSubtitle}>
            {vehicle.anio} · {vehicle.placa}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.editIconBtn}
          onPress={() => setShowEdit(true)}
        >
          <Ionicons name="create-outline" size={18} color="#89acff" />
        </TouchableOpacity>
      </View>

      {/* Balance */}
      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>Overall Balance</Text>

          <Text style={styles.balanceValue}>
            RD${" "}
            {Math.abs(r.balance).toLocaleString("es-DO", {
              minimumFractionDigits: 2,
            })}
          </Text>

          <Text
            style={[
              styles.balanceTrend,
              { color: r.balance >= 0 ? "#89acff" : "#ff7076" },
            ]}
          >
            {r.balance >= 0 ? "▲ Positive balance" : "▼ Negative balance"}
          </Text>
        </View>
      </View>

      {/* Financial cards */}
      <View style={styles.financialGrid}>
        <FinancialCard
          icon="build-outline"
          label="Maintenance"
          value={r.totalMantenimientos}
          negative
        />

        <FinancialCard
          icon="car-outline"
          label="Fuel"
          value={r.totalCombustible}
          negative
        />

        <FinancialCard
          icon="cash-outline"
          label="Income"
          value={r.totalIngresos}
          positive
        />

        <FinancialCard
          icon="document-text-outline"
          label="Other Expenses"
          value={r.totalGastos}
          negative
        />
      </View>

      {/* Vehicle specs */}
      <View style={styles.specsCard}>
        <Text style={styles.specsTitle}>Vehicle Details</Text>

        <View style={styles.specsRow}>
          <SpecItem label="Chassis" value={vehicle.chasis} />

          <SpecItem
            label="Wheels"
            value={`${(vehicle as any).cantidadRuedas ?? vehicle.cantidad_ruedas}`}
          />
        </View>

        <View style={styles.specsRow}>
          <SpecItem
            label="Total Invested"
            value={`RD$ ${r.totalInvertido.toLocaleString("es-DO")}`}
          />

          <SpecItem
            label="Registered"
            value={
              ((vehicle as any).fechaRegistro ?? vehicle.fecha_registro)?.split(
                "T",
              )[0] ?? "—"
            }
          />
        </View>
      </View>

      <Modal visible={showEdit} animationType="slide">
        <VehicleEditForm
          vehicle={vehicle}
          token={token}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            fetchDetail();
          }}
        />
      </Modal>
    </ScrollView>
  );
}

// ─── Financial Card ───────────────────────────────────────
function FinancialCard({
  icon,
  label,
  value,
  negative = false,
  positive = false,
}: {
  icon: string;
  label: string;
  value: number;
  negative?: boolean;
  positive?: boolean;
}) {
  const color = positive ? "#ffb7fc" : negative ? "#ff7076" : "#89acff";
  const sign = positive ? "+" : negative ? "-" : "";
  return (
    <View style={styles.financialCard}>
      <View
        style={[styles.financialIconBox, { backgroundColor: `${color}18` }]}
      >
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.financialLabel}>{label}</Text>
      <Text style={[styles.financialValue, { color }]}>
        {sign}RD${" "}
        {Math.abs(value).toLocaleString("es-DO", { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

// ─── Spec Item ────────────────────────────────────────────
function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specItem}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

// ─── Vehicle Form ─────────────────────────────────────────

const WHEEL_OPTIONS = ["2", "3", "4", "6", "8", "10", "12", "18"];

function VehicleForm({
  token,
  onClose,
  onSuccess,
}: {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    placa: "",
    chasis: "",
    marca: "",
    modelo: "",
    anio: "",
    cantidadRuedas: "4",
  });
  const [photo, setPhoto] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const handleSave = async () => {
    const currentYear = new Date().getFullYear();

    if (!form.placa.trim()) {
      Alert.alert("Error", "Plate is required.");
      return;
    }
    if (!form.chasis.trim()) {
      Alert.alert("Error", "Chassis number is required.");
      return;
    }
    if (!form.marca.trim()) {
      Alert.alert("Error", "Brand is required.");
      return;
    }
    if (!form.modelo.trim()) {
      Alert.alert("Error", "Model is required.");
      return;
    }
    if (!form.anio.trim()) {
      Alert.alert("Error", "Year is required.");
      return;
    }
    if (!/^\d{4}$/.test(form.anio)) {
      Alert.alert("Error", "Year must be a 4-digit number.");
      return;
    }

    const year = Number(form.anio);
    if (isNaN(year) || year < 1886 || year > currentYear) {
      Alert.alert("Error", `Year must be between 1886 and ${currentYear}.`);
      return;
    }

    const wheels = Number(form.cantidadRuedas);
    if (wheels < 2 || wheels > 18) {
      Alert.alert("Error", "Number of wheels must be between 2 and 18.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        "datax",
        JSON.stringify({
          placa: form.placa.trim(),
          chasis: form.chasis.trim(),
          marca: form.marca.trim(),
          modelo: form.modelo.trim(),
          anio: year,
          cantidadRuedas: wheels,
        }),
      );

      if (photo) {
        formData.append("foto", {
          uri: photo.uri,
          name: "vehicle.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await fetch(`${API_BASE}/vehiculos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        Alert.alert("Error", data.message ?? "Could not register vehicle.");
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
        <Text style={styles.title}>New Vehicle</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {[
        { key: "placa", placeholder: "Plate (e.g. A123456)" },
        { key: "chasis", placeholder: "Chassis number" },
        { key: "marca", placeholder: "Brand (e.g. Toyota)" },
        { key: "modelo", placeholder: "Model (e.g. Corolla)" },
        { key: "anio", placeholder: "Year (e.g. 2022)", keyboard: "numeric" },
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

      <Text style={{ color: "#72757d", marginLeft: 16, marginTop: 16 }}>
        Number of wheels
      </Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", margin: 16, gap: 8 }}
      >
        {WHEEL_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: form.cantidadRuedas === opt ? "#89acff" : "#20262f",
              backgroundColor:
                form.cantidadRuedas === opt ? "#89acff22" : "#151a21",
            }}
            onPress={() => setForm({ ...form, cantidadRuedas: opt })}
          >
            <Text
              style={{
                color: form.cantidadRuedas === opt ? "#89acff" : "#f1f3fc",
                fontWeight: "600",
              }}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.photoPickerBtn} onPress={pickPhoto}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="camera-outline" size={18} color="#72757d" />
            <Text style={styles.photoPickerText}>Add Vehicle Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? "Saving..." : "Register Vehicle"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Vehicle Edit Form ────────────────────────────────────
function VehicleEditForm({
  vehicle,
  token,
  onClose,
  onSuccess,
}: {
  vehicle: VehicleDetail;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    placa: vehicle.placa,
    chasis: vehicle.chasis,
    marca: vehicle.marca,
    modelo: vehicle.modelo,
    anio: vehicle.anio.toString(),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const currentYear = new Date().getFullYear();

    if (!form.placa.trim()) {
      Alert.alert("Error", "Plate is required.");
      return;
    }
    if (!form.chasis.trim()) {
      Alert.alert("Error", "Chassis number is required.");
      return;
    }
    if (!form.marca.trim()) {
      Alert.alert("Error", "Brand is required.");
      return;
    }
    if (!form.modelo.trim()) {
      Alert.alert("Error", "Model is required.");
      return;
    }
    if (!form.anio.trim()) {
      Alert.alert("Error", "Year is required.");
      return;
    }
    if (!/^\d{4}$/.test(form.anio)) {
      Alert.alert("Error", "Year must be a 4-digit number.");
      return;
    }

    const year = Number(form.anio);
    if (isNaN(year) || year < 1886 || year > currentYear) {
      Alert.alert("Error", `Year must be between 1886 and ${currentYear}.`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/vehiculos/editar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `datax=${encodeURIComponent(
          JSON.stringify({
            id: vehicle.id,
            placa: form.placa.trim(),
            chasis: form.chasis.trim(),
            marca: form.marca.trim(),
            modelo: form.modelo.trim(),
            anio: year,
          }),
        )}`,
      });

      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        Alert.alert("Error", data.message ?? "Could not update vehicle.");
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
        <Text style={styles.title}>Edit Vehicle</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      {[
        { key: "placa", placeholder: "Plate" },
        { key: "chasis", placeholder: "Chassis number" },
        { key: "marca", placeholder: "Brand" },
        { key: "modelo", placeholder: "Model" },
        { key: "anio", placeholder: "Year", keyboard: "numeric" },
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
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? "Saving..." : "Save Changes"}
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

  // List screen
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 16,
    paddingTop: 60,
  },
  title: { color: "#f1f3fc", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "#72757d", fontSize: 13, marginTop: 2 },
  addBtn: {
    backgroundColor: "#89acff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 13 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    backgroundColor: "#151a21",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, padding: 12, color: "#f1f3fc" },
  sectionLabel: {
    color: "#89acff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  vehicleCard: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  vehicleThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#20262f",
  },
  vehicleInfo: { flex: 1, justifyContent: "center" },
  vehicleNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  vehicleName: { color: "#f1f3fc", fontSize: 16, fontWeight: "bold" },
  activeBadge: {
    backgroundColor: "rgba(255,112,118,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,112,118,0.3)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: "#ff7076",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  vehicleBrand: { color: "#72757d", fontSize: 13, marginBottom: 6 },
  plateTag: {
    backgroundColor: "#0a0e14",
    borderWidth: 1,
    borderColor: "#20262f",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  vehiclePlate: {
    color: "#f1f3fc",
    fontSize: 11,
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  emptyText: { color: "#72757d", textAlign: "center", marginTop: 40 },

  // Detail screen
  backBtn: { padding: 16, paddingTop: 60 },
  backBtnText: { color: "#89acff", fontSize: 16 },
  detailPhotoContainer: { position: "relative", margin: 16 },
  detailPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "#20262f",
  },
  changePhotoBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changePhotoBtnText: { color: "#f1f3fc", fontSize: 12 },
  detailTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  detailInsightsLabel: {
    color: "#89acff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  detailTitle: { color: "#f1f3fc", fontSize: 22, fontWeight: "bold" },
  detailSubtitle: { color: "#72757d", fontSize: 13, marginTop: 2 },
  editIconBtn: {
    backgroundColor: "#20262f",
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#44484f",
  },
  editIconBtnText: { color: "#89acff", fontSize: 16 },

  // Balance card
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#151a21",
    borderRadius: 16,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#89acff",
    borderWidth: 1,
    borderColor: "#20262f",
  },
  balanceLabel: {
    color: "#72757d",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceValue: {
    color: "#f1f3fc",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 6,
  },
  balanceTrend: { fontSize: 12, fontWeight: "600" },

  // Financial grid
  financialGrid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  financialCard: {
    backgroundColor: "#151a21",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#20262f",
    width: "47%",
  },
  financialIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  financialIcon: { fontSize: 18 },
  financialLabel: {
    color: "#72757d",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  financialValue: { fontSize: 16, fontWeight: "bold" },

  // Specs card
  specsCard: {
    marginHorizontal: 16,
    backgroundColor: "#151a21",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  specsTitle: {
    color: "#f1f3fc",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 16,
  },
  specsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  specItem: { flex: 1 },
  specLabel: {
    color: "#72757d",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  specValue: { color: "#f1f3fc", fontSize: 13, fontWeight: "500" },

  // Forms
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
  photoPreview: { width: "100%", height: 160, borderRadius: 10 },
  saveBtn: {
    margin: 16,
    backgroundColor: "#89acff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 16 },
});
