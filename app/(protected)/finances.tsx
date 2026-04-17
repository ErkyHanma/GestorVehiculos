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

type Category = {
  id: number;
  nombre: string;
};

type Expense = {
  id: number;
  vehiculo_id: number;
  categoria_id: number;
  categoriaNombre: string;
  monto: number;
  descripcion: string;
  fecha: string;
};

type Income = {
  id: number;
  vehiculo_id: number;
  monto: number;
  concepto: string;
  fecha: string;
};

// ─── Category Translation ──────────────────────────────
const categoryTranslations: Record<string, string> = {
  seguro: "Insurance",
  parking: "Parking",
  multas: "Fines",
  peaje: "Tolls",
  lavado: "Car Wash",
  accesorios: "Accessories",
  otros: "Other",
  reparaciones: "Repairs",
  impuestos: "Taxes",
  parqueo: "Parking",
  combustible: "Fuel",
};

const translateCategory = (nombre: string) =>
  categoryTranslations[nombre.toLowerCase()] ?? nombre;

// ─── Helpers ─────────────────────────────────────────────
const formatDate = (fecha: string) =>
  new Date(fecha).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const validateDate = (text: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [y, m, d] = text.split("-").map(Number);
  if (y < 2000 || y > new Date().getFullYear() + 1) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  return true;
};

const validateAmount = (text: string): number | null => {
  const val = parseFloat(text.replace(",", "."));
  if (isNaN(val) || val <= 0 || val > 9999999) return null;
  return val;
};

// ─── Main Screen ─────────────────────────────────────────
export default function FinancesScreen() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<"expenses" | "income">("expenses");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [expensePage, setExpensePage] = useState(1);
  const [incomePage, setIncomePage] = useState(1);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.monto), 0);
  const totalIncomes = incomes.reduce((s, i) => s + Number(i.monto), 0);
  const balance = totalIncomes - totalExpenses;

  useEffect(() => {
    fetchVehicles();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/gastos/categorias`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data.data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExpenses = async (vId: number, page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/gastos?vehiculo_id=${vId}&page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setExpenses(data.data ?? []);
      setExpenseTotal(data.total ?? 0);
      setExpensePage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomes = async (vId: number, page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/ingresos?vehiculo_id=${vId}&page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setIncomes(data.data ?? []);
      setIncomeTotal(data.total ?? 0);
      setIncomePage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setShowVehicleSelector(false);
    setExpenses([]);
    setIncomes([]);
    fetchExpenses(v.id, 1);
    fetchIncomes(v.id, 1);
  };

  const handlePrevPage = () => {
    if (!selectedVehicle) return;
    if (activeTab === "expenses" && expensePage > 1) {
      fetchExpenses(selectedVehicle.id, expensePage - 1);
    } else if (activeTab === "income" && incomePage > 1) {
      fetchIncomes(selectedVehicle.id, incomePage - 1);
    }
  };

  const handleNextPage = () => {
    if (!selectedVehicle) return;
    const currentPage = activeTab === "expenses" ? expensePage : incomePage;
    const total = activeTab === "expenses" ? expenseTotal : incomeTotal;
    const items = activeTab === "expenses" ? expenses : incomes;

    if (items.length < total) {
      if (activeTab === "expenses") {
        fetchExpenses(selectedVehicle.id, currentPage + 1);
      } else {
        fetchIncomes(selectedVehicle.id, currentPage + 1);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Financial Dashboard</Text>
          <Text style={styles.subtitle}>
            Vehicle operations & logistics costs
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
          <Text style={styles.addBtnText}>+ New Record</Text>
        </TouchableOpacity>
      </View>

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

      {/* Balance cards */}
      {selectedVehicle && (
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: "#89acff" }]}>
            <Text style={styles.statLabel}>Net Balance</Text>
            <Text
              style={[
                styles.statValue,
                { color: balance >= 0 ? "#89acff" : "#ff7076" },
              ]}
            >
              RD${" "}
              {Math.abs(balance).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </Text>
            <Text
              style={[
                styles.statTrend,
                { color: balance >= 0 ? "#89acff" : "#ff7076" },
              ]}
            >
              {balance >= 0 ? "▲ Positive" : "▼ Negative"}
            </Text>
          </View>
          <View style={{ gap: 8, flex: 1 }}>
            <View
              style={[styles.statCardSmall, { borderLeftColor: "#ff7076" }]}
            >
              <Text style={styles.statLabelSmall}>Expenses</Text>
              <Text style={[styles.statValueSmall, { color: "#ff7076" }]}>
                RD${" "}
                {totalExpenses.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View
              style={[styles.statCardSmall, { borderLeftColor: "#ffb7fc" }]}
            >
              <Text style={styles.statLabelSmall}>Income</Text>
              <Text style={[styles.statValueSmall, { color: "#ffb7fc" }]}>
                RD${" "}
                {totalIncomes.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[
          { key: "expenses", label: "Expenses", icon: "trending-down-outline" },
          { key: "income", label: "Income", icon: "trending-up-outline" },
        ].map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key as any)}
          >
            <Ionicons
              name={icon as any}
              size={14}
              color={activeTab === key ? "#89acff" : "#72757d"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === key && styles.tabTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {loading && expenses.length === 0 && incomes.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#89acff" size="large" />
        </View>
      ) : (
        <FlatList<Expense | Income>
          style={{ flex: 1 }}
          data={activeTab === "expenses" ? expenses : incomes}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {selectedVehicle
                ? "No records found."
                : "Select a vehicle to load records."}
            </Text>
          }
          ListFooterComponent={
            selectedVehicle &&
            (activeTab === "expenses" ? expenseTotal : incomeTotal) > 5 ? (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[
                    styles.pageBtn,
                    (activeTab === "expenses" ? expensePage : incomePage) ===
                      1 && styles.pageBtnDisabled,
                  ]}
                  onPress={handlePrevPage}
                  disabled={
                    (activeTab === "expenses" ? expensePage : incomePage) === 1
                  }
                >
                  <Ionicons
                    name="chevron-back-outline"
                    size={16}
                    color={
                      (activeTab === "expenses" ? expensePage : incomePage) ===
                      1
                        ? "#44484f"
                        : "#89acff"
                    }
                  />
                </TouchableOpacity>

                <Text style={styles.pageInfo}>
                  Page {activeTab === "expenses" ? expensePage : incomePage} ·{" "}
                  {activeTab === "expenses" ? expenseTotal : incomeTotal}{" "}
                  records
                </Text>

                <TouchableOpacity
                  style={[
                    styles.pageBtn,
                    (activeTab === "expenses"
                      ? expenses.length >= expenseTotal
                      : incomes.length >= incomeTotal) &&
                      styles.pageBtnDisabled,
                  ]}
                  onPress={handleNextPage}
                  disabled={
                    activeTab === "expenses"
                      ? expenses.length >= expenseTotal
                      : incomes.length >= incomeTotal
                  }
                >
                  <Ionicons
                    name="chevron-forward-outline"
                    size={16}
                    color={
                      (
                        activeTab === "expenses"
                          ? expenses.length >= expenseTotal
                          : incomes.length >= incomeTotal
                      )
                        ? "#44484f"
                        : "#89acff"
                    }
                  />
                </TouchableOpacity>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isExpense = activeTab === "expenses";
            const color = isExpense ? "#ff7076" : "#ffb7fc";
            const sign = isExpense ? "-" : "+";

            return (
              <View style={styles.recordCard}>
                <View style={styles.recordLeft}>
                  <View
                    style={[
                      styles.recordIcon,
                      { backgroundColor: `${color}18` },
                    ]}
                  >
                    <Ionicons
                      name={isExpense ? "receipt-outline" : "cash-outline"}
                      size={20}
                      color={color}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.recordTitle} numberOfLines={1}>
                      {isExpense
                        ? (item as Expense).descripcion
                        : (item as Income).concepto}
                    </Text>

                    <Text style={styles.recordSub}>
                      {formatDate(item.fecha)}
                      {isExpense
                        ? ` · ${translateCategory((item as Expense).categoriaNombre)}`
                        : ""}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.recordAmount, { color }]}>
                  {sign} RD${" "}
                  {Number(item.monto).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            );
          }}
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
        <FinanceForm
          token={token!}
          vehiculoId={selectedVehicle?.id.toString() ?? ""}
          categories={categories}
          initialTab={activeTab}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            if (selectedVehicle) {
              fetchExpenses(selectedVehicle.id, 1);
              fetchIncomes(selectedVehicle.id, 1);
            }
          }}
        />
      </Modal>
    </View>
  );
}

// ─── Finance Form ─────────────────────────────────────────
function FinanceForm({
  token,
  vehiculoId,
  categories,
  initialTab,
  onClose,
  onSuccess,
}: {
  token: string;
  vehiculoId: string;
  categories: Category[];
  initialTab: "expenses" | "income";
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState<"expenses" | "income">(initialTab);
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [concepto, setConcepto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const amount = validateAmount(monto);
    if (!amount) {
      Alert.alert("Error", "Enter a valid amount between 1 and 9,999,999.");
      return;
    }
    if (!validateDate(fecha)) {
      Alert.alert("Error", "Enter a valid date in YYYY-MM-DD format.");
      return;
    }
    if (tab === "expenses" && !categoriaId) {
      Alert.alert("Error", "Please select a category.");
      return;
    }
    if (tab === "expenses" && !descripcion.trim()) {
      Alert.alert("Error", "Description is required.");
      return;
    }
    if (tab === "income" && !concepto.trim()) {
      Alert.alert("Error", "Concept is required.");
      return;
    }

    setSaving(true);
    try {
      const body = new URLSearchParams();
      if (tab === "expenses") {
        body.append(
          "datax",
          JSON.stringify({
            vehiculo_id: Number(vehiculoId),
            categoriaId,
            monto: amount,
            descripcion: descripcion.trim(),
            fecha,
          }),
        );
      } else {
        body.append(
          "datax",
          JSON.stringify({
            vehiculo_id: Number(vehiculoId),
            monto: amount,
            concepto: concepto.trim(),
            fecha,
          }),
        );
      }

      const endpoint = tab === "expenses" ? "gastos" : "ingresos";
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const data = await res.json();
      if (data.success) onSuccess();
      else Alert.alert("Error", data.message ?? "Could not save record.");
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
          <Text style={styles.subtitle}>Register financial activity</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Tab toggle */}
      <View style={styles.formTabRow}>
        {[
          { key: "expenses", label: "Expense", icon: "trending-down-outline" },
          { key: "income", label: "Income", icon: "trending-up-outline" },
        ].map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.formTab, tab === key && styles.formTabActive]}
            onPress={() => setTab(key as any)}
          >
            <Ionicons
              name={icon as any}
              size={16}
              color={tab === key ? "#89acff" : "#72757d"}
            />
            <Text
              style={[
                styles.formTabText,
                tab === key && styles.formTabTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>AMOUNT (RD$)</Text>
        <TextInput
          style={styles.fieldInput}
          placeholder="e.g. 2500.00"
          placeholderTextColor="#72757d"
          keyboardType="decimal-pad"
          value={monto}
          onChangeText={setMonto}
        />
      </View>

      {/* Category — only for expenses */}
      {tab === "expenses" && (
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    categoriaId === cat.id && styles.categoryChipActive,
                  ]}
                  onPress={() => setCategoriaId(cat.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      categoriaId === cat.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {translateCategory(cat.nombre)}{" "}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Description or Concept */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          {tab === "expenses" ? "DESCRIPTION" : "CONCEPT"}
        </Text>
        <TextInput
          style={styles.fieldInput}
          placeholder={
            tab === "expenses"
              ? "e.g. Annual insurance"
              : "e.g. Weekly transport service"
          }
          placeholderTextColor="#72757d"
          value={tab === "expenses" ? descripcion : concepto}
          onChangeText={tab === "expenses" ? setDescripcion : setConcepto}
        />
      </View>

      {/* Date */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>DATE (YYYY-MM-DD)</Text>
        <TextInput
          style={[
            styles.fieldInput,
            fecha.length === 10 &&
              !validateDate(fecha) &&
              styles.fieldInputError,
          ]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#72757d"
          value={fecha}
          onChangeText={(text) => {
            if (text.length <= 10) setFecha(text);
          }}
          maxLength={10}
        />
        {fecha.length === 10 && !validateDate(fecha) && (
          <Text style={styles.fieldError}>Invalid date</Text>
        )}
      </View>

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
    padding: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 16,
    paddingTop: 60,
  },
  title: { color: "#f1f3fc", fontSize: 24, fontWeight: "bold" },
  subtitle: { color: "#72757d", fontSize: 12, marginTop: 2 },
  addBtn: {
    backgroundColor: "#89acff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 12 },

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
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1.2,
    backgroundColor: "#151a21",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#20262f",
    borderLeftWidth: 3,
    justifyContent: "center",
  },
  statLabel: {
    color: "#72757d",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  statValue: { fontSize: 20, fontWeight: "bold" },
  statTrend: { fontSize: 11, fontWeight: "600", marginTop: 4 },
  statCardSmall: {
    flex: 1,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#20262f",
    borderLeftWidth: 3,
  },
  statLabelSmall: {
    color: "#72757d",
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValueSmall: { fontSize: 13, fontWeight: "bold" },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: { backgroundColor: "rgba(137,172,255,0.15)" },
  tabText: { color: "#72757d", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#89acff" },

  recordCard: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#20262f",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  recordTitle: { color: "#f1f3fc", fontSize: 14, fontWeight: "600" },
  recordSub: { color: "#72757d", fontSize: 11, marginTop: 2 },
  recordAmount: { fontSize: 14, fontWeight: "bold" },
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

  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 16,
    paddingTop: 60,
  },
  cancelText: { color: "#ff7076", fontSize: 16 },
  formTabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  formTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  formTabActive: { backgroundColor: "rgba(137,172,255,0.15)" },
  formTabText: { color: "#72757d", fontSize: 14, fontWeight: "600" },
  formTabTextActive: { color: "#89acff" },
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
  fieldInputError: { borderColor: "#ff7076" },
  fieldError: { color: "#ff7076", fontSize: 11, marginTop: 4 },
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
  saveBtn: {
    margin: 16,
    marginTop: 8,
    backgroundColor: "#89acff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#002b6a", fontWeight: "bold", fontSize: 16 },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 20,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#151a21",
    borderWidth: 1,
    borderColor: "#20262f",
    justifyContent: "center",
    alignItems: "center",
  },
  pageBtnDisabled: {
    borderColor: "#20262f",
    opacity: 0.4,
  },
  pageInfo: {
    color: "#72757d",
    fontSize: 12,
    fontWeight: "600",
  },
});
