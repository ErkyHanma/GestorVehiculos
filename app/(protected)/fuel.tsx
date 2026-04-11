import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
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
type FuelRecord = {
  id: number;
  vehiculo_id: number;
  tipo: string;
  cantidad: number;
  unidad: string;
  monto: number;
  fecha: string;
};

// ─── Main Screen ─────────────────────────────────────────
export default function FuelScreen() {
  const { token } = useAuth();
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTipo, setFilterTipo] = useState("");
  const [vehiculoId, setVehiculoId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadRecords = async (tipo = "") => {
    if (!vehiculoId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/combustibles?vehiculo_id=${vehiculoId}&tipo=${tipo}&page=1&limit=20`,
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

  const handleFilter = (tipo: string) => {
    setFilterTipo(tipo);
    loadRecords(tipo);
  };

  const totalMonto = records.reduce((sum, r) => sum + r.monto, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fuel & Oil</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.addBtnText}>+ Log Refill</Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle ID input */}
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

      {/* Total stat */}
      {records.length > 0 && (
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Spent</Text>
          <Text style={styles.statValue}>
            RD${" "}
            {totalMonto.toLocaleString("es-DO", { minimumFractionDigits: 2 })}
          </Text>
        </View>
      )}

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {[
          { key: "", label: "All" },
          { key: "combustible", label: "⛽ Fuel" },
          { key: "aceite", label: "🛢 Oil" },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterTab,
              filterTipo === key && styles.filterTabActive,
            ]}
            onPress={() => handleFilter(key)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterTipo === key && styles.filterTabTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
                  <Text style={styles.cardIconText}>
                    {item.tipo === "combustible" ? "⛽" : "🛢"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.cardType}>
                    {item.tipo === "combustible" ? "Fuel" : "Oil"}
                  </Text>
                  <Text style={styles.cardDate}>{item.fecha}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.cardQty}>
                  {item.cantidad} {item.unidad}
                </Text>
                <Text
                  style={[
                    styles.cardMonto,
                    {
                      color:
                        item.tipo === "combustible" ? "#89acff" : "#ffb7fc",
                    },
                  ]}
                >
                  RD$ {item.monto.toLocaleString("es-DO")}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {vehiculoId
                ? "No records found."
                : "Enter a vehicle ID to load records."}
            </Text>
          }
        />
      )}

      {/* Form Modal */}
      <Modal visible={showForm} animationType="slide">
        <FuelForm
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
    vehiculo_id: vehiculoId,
    tipo: "combustible",
    cantidad: "",
    unidad: "galones",
    monto: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.vehiculo_id || !form.cantidad || !form.monto) {
      Alert.alert("Error", "Vehicle ID, quantity and amount are required.");
      return;
    }
    setSaving(true);
    try {
      const body = new URLSearchParams();
      body.append(
        "datax",
        JSON.stringify({
          vehiculo_id: Number(form.vehiculo_id),
          tipo: form.tipo,
          cantidad: Number(form.cantidad),
          unidad: form.unidad,
          monto: Number(form.monto),
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
        <Text style={styles.title}>New Record</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Tipo toggle */}
      <View style={styles.toggleRow}>
        {["combustible", "aceite"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.toggleBtn,
              form.tipo === t && styles.toggleBtnActive,
            ]}
            onPress={() => setForm({ ...form, tipo: t })}
          >
            <Text
              style={[
                styles.toggleBtnText,
                form.tipo === t && styles.toggleBtnTextActive,
              ]}
            >
              {t === "combustible" ? "⛽ Fuel" : "🛢 Oil"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Vehicle ID"
        placeholderTextColor="#72757d"
        keyboardType="numeric"
        value={form.vehiculo_id}
        onChangeText={(text) => setForm({ ...form, vehiculo_id: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Quantity (e.g. 15.5)"
        placeholderTextColor="#72757d"
        keyboardType="decimal-pad"
        value={form.cantidad}
        onChangeText={(text) => setForm({ ...form, cantidad: text })}
      />

      {/* Unidad selector */}
      <View style={styles.unitRow}>
        {["galones", "litros", "qt"].map((u) => (
          <TouchableOpacity
            key={u}
            style={[styles.unitBtn, form.unidad === u && styles.unitBtnActive]}
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

      <TextInput
        style={styles.input}
        placeholder="Amount (RD$)"
        placeholderTextColor="#72757d"
        keyboardType="numeric"
        value={form.monto}
        onChangeText={(text) => setForm({ ...form, monto: text })}
      />

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
    marginBottom: 12,
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
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: { color: "#89acff", fontSize: 24, fontWeight: "bold" },
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
  },
  filterTabActive: {
    backgroundColor: "rgba(137,172,255,0.15)",
    borderColor: "#89acff",
  },
  filterTabText: { color: "#72757d", fontSize: 13, fontWeight: "600" },
  filterTabTextActive: { color: "#89acff" },
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
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIconText: { fontSize: 20 },
  cardType: { color: "#f1f3fc", fontSize: 15, fontWeight: "bold" },
  cardDate: { color: "#72757d", fontSize: 12, marginTop: 2 },
  cardRight: { alignItems: "flex-end" },
  cardQty: { color: "#a8abb3", fontSize: 13 },
  cardMonto: { fontSize: 16, fontWeight: "bold", marginTop: 2 },
  emptyText: {
    color: "#72757d",
    textAlign: "center",
    marginTop: 40,
    padding: 16,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
  },
  cancelText: { color: "#ff7076", fontSize: 16 },
  toggleRow: { flexDirection: "row", margin: 16, gap: 8 },
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
  unitRow: { flexDirection: "row", margin: 16, marginBottom: 0, gap: 8 },
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
    backgroundColor: "#89acff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
  },
  saveBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 16 },
});
