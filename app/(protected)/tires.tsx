import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

type Tire = {
  id: number;
  vehiculo_id: number;
  posicion: string;
  eje: number;
  estado: "buena" | "regular" | "mala" | "reemplazada";
  totalPinchazos: number;
};

type TireData = {
  cantidadRuedas: number;
  gomas: Tire[];
};

const ESTADOS = ["buena", "regular", "mala", "reemplazada"] as const;

const estadoColor: Record<string, string> = {
  buena: "#89acff",
  regular: "#ffb7fc",
  mala: "#ff7076",
  reemplazada: "#72757d",
};

const estadoLabel: Record<string, string> = {
  buena: "Good",
  regular: "Fair",
  mala: "Poor",
  reemplazada: "Replaced",
};

// ─── Main Screen ─────────────────────────────────────────
export default function TiresScreen() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [tireData, setTireData] = useState<TireData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPunctureModal, setShowPunctureModal] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [vehicles]);

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

  const fetchTires = async (vId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/gomas?vehiculo_id=${vId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTireData(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setShowVehicleSelector(false);
    setTireData(null);
    fetchTires(v.id);
  };

  const handleTirePress = (tire: Tire) => {
    setSelectedTire(tire);
    setShowStatusModal(true);
  };

  const handlePuncturePress = (tire: Tire) => {
    setSelectedTire(tire);
    setShowPunctureModal(true);
  };

  // Agrupar gomas por eje
  const groupedByAxle = tireData?.gomas.reduce(
    (acc, tire) => {
      const key = `Axle ${tire.eje}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(tire);
      return acc;
    },
    {} as Record<string, Tire[]>,
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tire Monitor</Text>
          <Text style={styles.subtitle}>Real-time health telemetry</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator color="#89acff" size="large" />
          </View>
        )}

        {/* Visual diagram */}
        {tireData && !loading && (
          <>
            <View style={styles.diagramCard}>
              <View style={styles.diagramHeader}>
                <Text style={styles.diagramTitle}>TIRE MONITOR</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>Live Diagnostic</Text>
                </View>
              </View>

              {/* Vehicle diagram */}
              <View style={styles.vehicleDiagram}>
                <View style={styles.vehicleBody}>
                  {tireData.gomas.map((tire) => {
                    const isLeft =
                      tire.posicion.toLowerCase().includes("izq") ||
                      tire.posicion.toLowerCase().includes("left") ||
                      tire.posicion.toLowerCase().includes("i");
                    const isFront = tire.eje === 1;
                    const color = estadoColor[tire.estado];

                    return (
                      <TouchableOpacity
                        key={tire.id}
                        style={[
                          styles.tireDiagram,
                          isLeft
                            ? styles.tireDiagramLeft
                            : styles.tireDiagramRight,
                          isFront
                            ? styles.tireDiagramFront
                            : styles.tireDiagramRear,
                          { borderColor: color },
                        ]}
                        onPress={() => handleTirePress(tire)}
                      >
                        <Text style={[styles.tireDiagramLabel, { color }]}>
                          {tire.posicion.substring(0, 2).toUpperCase()}
                        </Text>
                        <Text style={styles.tireDiagramPinchazos}>
                          {tire.totalPinchazos}p
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={styles.axleLine1} />
                  <View style={styles.axleLine2} />
                </View>
              </View>

              {/* Legend */}
              <View style={styles.legend}>
                {Object.entries(estadoLabel).map(([key, label]) => (
                  <View key={key} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: estadoColor[key] },
                      ]}
                    />
                    <Text style={styles.legendText}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tire list */}
            <Text style={styles.sectionLabel}>Manual Condition Overrides</Text>
            {Object.entries(groupedByAxle ?? {}).map(([axle, tires]) => (
              <View key={axle} style={styles.axleGroup}>
                <Text style={styles.axleLabel}>{axle}</Text>
                {tires.map((tire) => {
                  const color = estadoColor[tire.estado];
                  return (
                    <View
                      key={tire.id}
                      style={[styles.tireCard, { borderLeftColor: color }]}
                    >
                      <View style={styles.tireCardLeft}>
                        <View
                          style={[
                            styles.tirePositionBadge,
                            { borderColor: color },
                          ]}
                        >
                          <Text style={[styles.tirePositionText, { color }]}>
                            {tire.posicion.substring(0, 2).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.tirePositionFull}>
                            {tire.posicion}
                          </Text>
                          <Text style={[styles.tireStatus, { color }]}>
                            Status: {estadoLabel[tire.estado]}
                          </Text>
                          {tire.totalPinchazos > 0 && (
                            <View style={styles.tireStats}>
                              <Ionicons
                                name="warning-outline"
                                size={11}
                                color="#ff7076"
                              />
                              <Text style={styles.tirePinchazos}>
                                {tire.totalPinchazos} puncture
                                {tire.totalPinchazos > 1 ? "s" : ""}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.tireCardActions}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { borderColor: color }]}
                          onPress={() => handleTirePress(tire)}
                        >
                          <Text style={[styles.actionBtnText, { color }]}>
                            Update
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.punctureBtn}
                          onPress={() => handlePuncturePress(tire)}
                        >
                          <Ionicons
                            name="alert-circle-outline"
                            size={14}
                            color="#ff7076"
                          />
                          <Text style={styles.punctureBtnText}>Puncture</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}

            <View style={{ height: 40 }} />
          </>
        )}

        {!loading && !tireData && (
          <Text style={styles.emptyText}>
            Select a vehicle to view tire status.
          </Text>
        )}
      </ScrollView>

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

      {/* Status Update Modal */}
      {selectedTire && (
        <Modal visible={showStatusModal} animationType="slide" transparent>
          <StatusUpdateModal
            tire={selectedTire}
            token={token!}
            onClose={() => setShowStatusModal(false)}
            onSuccess={() => {
              setShowStatusModal(false);
              if (selectedVehicle) fetchTires(selectedVehicle.id);
            }}
          />
        </Modal>
      )}

      {/* Puncture Modal */}
      {selectedTire && (
        <Modal visible={showPunctureModal} animationType="slide" transparent>
          <PunctureModal
            tire={selectedTire}
            token={token!}
            onClose={() => setShowPunctureModal(false)}
            onSuccess={() => {
              setShowPunctureModal(false);
              if (selectedVehicle) fetchTires(selectedVehicle.id);
            }}
          />
        </Modal>
      )}
    </View>
  );
}

// ─── Status Update Modal ──────────────────────────────────
function StatusUpdateModal({
  tire,
  token,
  onClose,
  onSuccess,
}: {
  tire: Tire;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [estado, setEstado] = useState(tire.estado);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = new URLSearchParams();
      body.append("datax", JSON.stringify({ goma_id: tire.id, estado }));
      const res = await fetch(`${API_BASE}/gomas/actualizar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const data = await res.json();
      if (data.success) onSuccess();
      else Alert.alert("Error", data.message ?? "Could not update status.");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.selectorOverlay}>
      <View style={styles.selectorSheet}>
        <Text style={styles.selectorTitle}>
          Update Status — {tire.posicion}
        </Text>
        <View style={styles.statusGrid}>
          {ESTADOS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[
                styles.statusOption,
                { borderColor: estadoColor[e] },
                estado === e && { backgroundColor: `${estadoColor[e]}20` },
              ]}
              onPress={() => setEstado(e)}
            >
              <View
                style={[styles.statusDot, { backgroundColor: estadoColor[e] }]}
              />
              <Text
                style={[styles.statusOptionText, { color: estadoColor[e] }]}
              >
                {estadoLabel[e]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.selectorCancel} onPress={onClose}>
          <Text style={styles.selectorCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Puncture Modal ───────────────────────────────────────
function PunctureModal({
  tire,
  token,
  onClose,
  onSuccess,
}: {
  tire: Tire;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    descripcion: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);

  const isValidDate = (dateStr: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime())) return false;

    if (
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      return false;
    }

    if (date > today) return false;

    if (year < 2000) return false;

    return true;
  };

  const handleSave = async () => {
    if (!form.descripcion) {
      Alert.alert("Error", "Description is required.");
      return;
    }

    if (!isValidDate(form.fecha)) {
      Alert.alert(
        "Error",
        "Invalid date. Use YYYY-MM-DD and a valid past date.",
      );
      return;
    }

    setSaving(true);
    try {
      const body = new URLSearchParams();
      body.append(
        "datax",
        JSON.stringify({
          goma_id: tire.id,
          descripcion: form.descripcion,
          fecha: form.fecha,
        }),
      );
      const res = await fetch(`${API_BASE}/gomas/pinchazos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const data = await res.json();
      if (data.success) onSuccess();
      else Alert.alert("Error", data.message ?? "Could not register puncture.");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.selectorOverlay}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={-40}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ width: "100%" }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.selectorSheet}>
            <Text style={styles.selectorTitle}>
              Register Puncture — {tire.posicion}
            </Text>
            <Text style={styles.punctureSubtitle}>
              Log tire incidents to track safety and service intervals.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>INCIDENT DESCRIPTION</Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  { height: 80, textAlignVertical: "top" },
                ]}
                placeholder="Describe the damage or incident location..."
                placeholderTextColor="#72757d"
                multiline
                value={form.descripcion}
                onChangeText={(text) => setForm({ ...form, descripcion: text })}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>INCIDENT DATE</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#72757d"
                value={form.fecha}
                onChangeText={(text) => setForm({ ...form, fecha: text })}
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

            <TouchableOpacity
              style={[styles.punctureSaveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons name="warning-outline" size={16} color="#0a0e14" />
              <Text style={styles.saveBtnText}>
                {saving ? "Saving..." : "Submit Incident Report"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.selectorCancel} onPress={onClose}>
              <Text style={styles.selectorCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0e14" },
  centered: { padding: 40, alignItems: "center" },
  header: { padding: 16, paddingTop: 60 },
  title: { color: "#f1f3fc", fontSize: 26, fontWeight: "bold" },
  subtitle: { color: "#72757d", fontSize: 12, marginTop: 2 },

  // Vehicle selector
  vehicleSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
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

  // Diagram card
  diagramCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#151a21",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  diagramHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  diagramTitle: {
    color: "#f1f3fc",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,112,118,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,112,118,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ff7076" },
  liveBadgeText: {
    color: "#ff7076",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Vehicle diagram
  vehicleDiagram: { alignItems: "center", marginBottom: 20 },
  vehicleBody: {
    width: 120,
    height: 220,
    borderWidth: 2,
    borderColor: "#20262f",
    borderRadius: 30,
    position: "relative",
    backgroundColor: "#0a0e14",
  },
  axleLine1: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#20262f",
  },
  axleLine2: {
    position: "absolute",
    bottom: "30%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#20262f",
  },
  tireDiagram: {
    position: "absolute",
    width: 32,
    height: 52,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: "#151a21",
    justifyContent: "center",
    alignItems: "center",
  },
  tireDiagramLeft: { left: -18 },
  tireDiagramRight: { right: -18 },
  tireDiagramFront: { top: 30 },
  tireDiagramRear: { bottom: 30 },
  tireDiagramLabel: { fontSize: 9, fontWeight: "700" },
  tireDiagramPinchazos: { color: "#72757d", fontSize: 8 },

  // Legend
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: "#72757d", fontSize: 11 },

  // Tire list
  sectionLabel: {
    color: "#89acff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  axleGroup: { marginHorizontal: 16, marginBottom: 16 },
  axleLabel: {
    color: "#72757d",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  tireCard: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#20262f",
    borderLeftWidth: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tireCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  tirePositionBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#0a0e14",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tirePositionText: { fontSize: 13, fontWeight: "700" },
  tirePositionFull: { color: "#f1f3fc", fontSize: 14, fontWeight: "600" },
  tireStatus: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  tireStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  tirePinchazos: { color: "#ff7076", fontSize: 11 },
  tireCardActions: { alignItems: "flex-end", gap: 6 },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  punctureBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,112,118,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,112,118,0.2)",
  },
  punctureBtnText: { color: "#ff7076", fontSize: 10, fontWeight: "600" },
  emptyText: {
    color: "#72757d",
    textAlign: "center",
    marginTop: 60,
    padding: 16,
  },

  // Modals
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

  // Status update
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "#0a0e14",
    width: "47%",
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusOptionText: { fontSize: 13, fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#89acff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 15 },

  // Puncture
  punctureSubtitle: {
    color: "#72757d",
    fontSize: 13,
    marginBottom: 16,
    marginTop: -10,
  },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: {
    color: "#72757d",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: "#0a0e14",
    borderRadius: 12,
    padding: 14,
    color: "#f1f3fc",
    borderWidth: 1,
    borderColor: "#20262f",
    fontSize: 15,
  },
  punctureSaveBtn: {
    backgroundColor: "#ff7076",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 4,
  },
});
