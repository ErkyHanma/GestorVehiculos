import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
};

type FuelRecord = {
  id: number;
  vehiculo_id: number;
  tipo: string;
  cantidad: number;
  unidad: string;
  monto: number;
  fecha: string;
};

const formatDate = (fecha: string) => {
  const date = new Date(fecha);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Main Screen ─────────────────────────────────────────
export default function FuelScreen() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [filterTipo, setFilterTipo] = useState("");
  const [showForm, setShowForm] = useState(false);

  const totalMonto = records.reduce((sum, r) => sum + Number(r.monto), 0);

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
        `${API_BASE}/combustibles?vehiculo_id=${id}&tipo=${tipo}&page=1&limit=20`,
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

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setShowVehicleSelector(false);
    setRecords([]);
    setFilterTipo("");
    loadRecords("", v.id);
  };

  const handleFilter = (tipo: string) => {
    setFilterTipo(tipo);
    loadRecords(tipo);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Fuel & Oil</Text>
          <Text style={styles.subtitle}>Refill & fluid change logs</Text>
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
          <Text style={styles.addBtnText}>+ Log Refill</Text>
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

        {/* Total stat */}
        {records.length > 0 && (
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>
              RD${" "}
              {totalMonto.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {[
            { key: "", label: "All", icon: null },
            { key: "combustible", label: "Fuel", icon: "water-outline" },
            { key: "aceite", label: "Oil", icon: "flask-outline" },
          ].map(({ key, label, icon }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterTab,
                filterTipo === key && styles.filterTabActive,
              ]}
              onPress={() => handleFilter(key)}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                {icon && (
                  <Ionicons
                    name={icon as any}
                    size={14}
                    color={filterTipo === key ? "#89acff" : "#72757d"}
                  />
                )}
                <Text
                  style={[
                    styles.filterTabText,
                    filterTipo === key && styles.filterTabTextActive,
                  ]}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
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
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.cardIcon,
                    {
                      backgroundColor:
                        item.tipo === "combustible"
                          ? "rgba(137,172,255,0.1)"
                          : "rgba(255,183,252,0.1)",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      item.tipo === "combustible"
                        ? "water-outline"
                        : "flask-outline"
                    }
                    size={22}
                    color={item.tipo === "combustible" ? "#89acff" : "#ffb7fc"}
                  />
                </View>
                <View>
                  <Text style={styles.cardType}>
                    {item.tipo === "combustible" ? "Fuel" : "Oil"}
                  </Text>
                  <Text style={styles.cardDate}>{formatDate(item.fecha)}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardQtyLabel}>Quantity</Text>
                <Text style={styles.cardQty}>
                  {item.cantidad} {item.unidad}
                </Text>
                <Text style={styles.cardAmountLabel}>Amount</Text>
                <Text
                  style={[
                    styles.cardMonto,
                    {
                      color:
                        item.tipo === "combustible" ? "#89acff" : "#ffb7fc",
                    },
                  ]}
                >
                  RD$ {Number(item.monto).toLocaleString("en-US")}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {selectedVehicle
                ? "No records found."
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
        <FuelForm
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

// ─── Fuel Form ────────────────────────────────────────────
function FuelForm({
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
    tipo: "combustible",
    cantidad: "",
    unidad: "gallons",
    monto: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const cantidad = Number(form.cantidad.replace(",", "."));
    const monto = Number(form.monto.replace(",", "."));

    if (!form.cantidad || !form.monto) {
      Alert.alert("Error", "Quantity and amount are required.");
      return;
    }

    if (isNaN(cantidad) || isNaN(monto)) {
      Alert.alert("Error", "Invalid number format.");
      return;
    }

    if (cantidad <= 0 || monto <= 0) {
      Alert.alert("Error", "Values must be greater than 0.");
      return;
    }

    setSaving(true);
    try {
      const body = new URLSearchParams();

      const unidadMap: Record<string, string> = {
        gallons: "galones",
        liters: "litros",
        qt: "qt",
      };

      body.append(
        "datax",
        JSON.stringify({
          vehiculo_id: Number(vehiculoId),
          tipo: form.tipo,
          cantidad,
          unidad: unidadMap[form.unidad],
          monto,
        }),
      );

      const res = await fetch(`${API_BASE}/combustibles`, {
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
          <Text style={styles.title}>New Record</Text>
          <Text style={styles.subtitle}>Quick refill registration</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>TYPE</Text>
        <View style={styles.toggleRow}>
          {[
            { key: "combustible", label: "Fuel", icon: "water-outline" },
            { key: "aceite", label: "Oil", icon: "flask-outline" },
          ].map(
            (
              { key, label, icon }, // ← agrega "icon" aquí
            ) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.toggleBtn,
                  form.tipo === key && styles.toggleBtnActive,
                ]}
                onPress={() => setForm({ ...form, tipo: key })}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Ionicons
                    name={icon as any}
                    size={16}
                    color={form.tipo === key ? "#89acff" : "#72757d"}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      form.tipo === key && styles.toggleBtnTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>QUANTITY</Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="e.g. 15.5"
          placeholderTextColor="#72757d"
          keyboardType="decimal-pad"
          value={form.cantidad}
          onChangeText={(text) => setForm({ ...form, cantidad: text })}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>UNIT</Text>
        <View style={styles.unitRow}>
          {["gallons", "liters", "qt"].map((u) => (
            <TouchableOpacity
              key={u}
              style={[
                styles.unitBtn,
                form.unidad === u && styles.unitBtnActive,
              ]}
              onPress={() => setForm({ ...form, unidad: u })}
            >
              <Text
                style={[
                  styles.unitBtnText,
                  form.unidad === u && styles.unitBtnTextActive,
                ]}
              >
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>COST (RD$)</Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="RD$ 0.00"
          placeholderTextColor="#72757d"
          keyboardType="numeric"
          value={form.monto}
          onChangeText={(text) => setForm({ ...form, monto: text })}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>
          {saving ? "Saving..." : "Submit Log"}
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

  // Vehicle selector
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

  // Stat
  statCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#89acff",
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
  statValue: { color: "#89acff", fontSize: 22, fontWeight: "bold" },

  // Filters
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#151a21",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#20262f",
    height: 40,
    justifyContent: "center",
  },
  filterTabActive: {
    backgroundColor: "rgba(137,172,255,0.15)",
    borderColor: "#89acff",
  },
  filterTabText: { color: "#72757d", fontSize: 13, fontWeight: "600" },
  filterTabTextActive: { color: "#89acff" },

  // Cards
  card: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#20262f",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardRight: { alignItems: "flex-end" },
  cardQtyLabel: {
    color: "#72757d",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardQty: { color: "#a8abb3", fontSize: 13, fontWeight: "500" },
  cardAmountLabel: {
    color: "#72757d",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  cardMonto: { fontSize: 16, fontWeight: "bold" },
  emptyText: {
    color: "#72757d",
    textAlign: "center",
    marginTop: 40,
    padding: 16,
  },

  // Vehicle selector modal
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

  // Form
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
  toggleRow: { flexDirection: "row", gap: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#151a21",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#20262f",
  },
  toggleBtnActive: {
    backgroundColor: "rgba(137,172,255,0.15)",
    borderColor: "#89acff",
  },
  toggleBtnText: { color: "#72757d", fontWeight: "600", fontSize: 14 },
  toggleBtnTextActive: { color: "#89acff" },
  unitRow: { flexDirection: "row", gap: 8 },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#151a21",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#20262f",
  },
  unitBtnActive: {
    backgroundColor: "rgba(137,172,255,0.15)",
    borderColor: "#89acff",
  },
  unitBtnText: { color: "#72757d", fontSize: 13, fontWeight: "600" },
  unitBtnTextActive: { color: "#89acff" },
  saveBtn: {
    margin: 16,
    marginTop: 8,
    backgroundColor: "#89acff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 16 },
  cardType: { color: "#f1f3fc", fontSize: 15, fontWeight: "bold" },
  cardDate: {
    color: "#72757d",
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
