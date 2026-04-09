import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async (marca = "", modelo = "") => {
    try {
      const token = await AsyncStorage.getItem("userToken");
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

  const fetchDetail = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${API_BASE}/vehiculos/detalle?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelected(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    fetchVehicles(text, text);
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#89acff" size="large" />
      </View>
    );

  if (selected)
    return (
      <VehicleDetailView
        vehicle={selected}
        onBack={() => setSelected(null)}
        onRefresh={() => fetchDetail(selected.id)}
      />
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Garage</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.addBtnText}>+ New Vehicle</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by brand or model..."
        placeholderTextColor="#72757d"
        value={search}
        onChangeText={handleSearch}
      />

      {/* List */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.vehicleCard}
            onPress={() => fetchDetail(item.id)}
          >
            <Image
              source={{ uri: item.foto_url }}
              style={styles.vehicleThumb}
            />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {item.marca} {item.modelo}
              </Text>
              <Text style={styles.vehicleYear}>{item.anio}</Text>
              <Text style={styles.vehiclePlate}>{item.placa}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No vehicles registered yet.</Text>
        }
      />

      {/* Modal Formulario */}
      <Modal visible={showForm} animationType="slide">
        <VehicleForm
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

function VehicleDetailView({
  vehicle,
  onBack,
  onRefresh,
}: {
  vehicle: VehicleDetail;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [showEdit, setShowEdit] = useState(false);

  const handleChangePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("datax", JSON.stringify({ id: vehicle.id }));
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

      onRefresh();
    }
  };

  const r = vehicle.resumen;

  return (
    <ScrollView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>

      {/* Vehicle photo */}
      <View style={styles.detailPhotoContainer}>
        <Image source={{ uri: vehicle.foto_url }} style={styles.detailPhoto} />
        <TouchableOpacity
          style={styles.changePhotoBtn}
          onPress={handleChangePhoto}
        >
          <Text style={styles.changePhotoBtnText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle info */}
      <View style={styles.detailHeader}>
        <Text style={styles.detailTitle}>
          {vehicle.marca} {vehicle.modelo}
        </Text>
        <Text style={styles.detailSubtitle}>
          {vehicle.anio} · {vehicle.placa}
        </Text>
      </View>

      {/* Edit button */}
      <TouchableOpacity
        style={styles.editVehicleBtn}
        onPress={() => setShowEdit(true)}
      >
        <Text style={styles.editVehicleBtnText}>✎ Edit Vehicle</Text>
      </TouchableOpacity>

      {/* Financial summary */}
      <View style={styles.financialGrid}>
        <FinancialCard
          label="Balance"
          value={r.balance}
          color="#89acff"
          positive={r.balance >= 0}
        />
        <FinancialCard
          label="Maintenance"
          value={-r.totalMantenimientos}
          color="#ff7076"
        />
        <FinancialCard
          label="Fuel"
          value={-r.totalCombustible}
          color="#ff7076"
        />
        <FinancialCard
          label="Expenses"
          value={-r.totalGastos}
          color="#ff7076"
        />
        <FinancialCard
          label="Income"
          value={r.totalIngresos}
          color="#ffb7fc"
          positive
        />
        <FinancialCard
          label="Total Invested"
          value={-r.totalInvertido}
          color="#72757d"
        />
      </View>

      {/* Edit Modal */}
      <Modal visible={showEdit} animationType="slide">
        <VehicleEditForm
          vehicle={vehicle}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            setShowEdit(false);
            onRefresh();
          }}
        />
      </Modal>
    </ScrollView>
  );
}

function FinancialCard({
  label,
  value,
  color,
  positive = false,
}: {
  label: string;
  value: number;
  color: string;
  positive?: boolean;
}) {
  const formatted = `${positive ? "+" : ""}RD$ ${Math.abs(value).toLocaleString("es-DO", { minimumFractionDigits: 2 })}`;
  return (
    <View style={[styles.financialCard, { borderLeftColor: color }]}>
      <Text style={styles.financialLabel}>{label}</Text>
      <Text style={[styles.financialValue, { color }]}>{formatted}</Text>
    </View>
  );
}

function VehicleForm({
  onClose,
  onSuccess,
}: {
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
    if (!form.placa || !form.marca || !form.modelo) {
      Alert.alert("Error", "Plate, brand and model are required.");
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();
      formData.append(
        "datax",
        JSON.stringify({
          ...form,
          anio: Number(form.anio),
          cantidadRuedas: Number(form.cantidadRuedas),
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
        {
          key: "cantidadRuedas",
          placeholder: "Number of wheels",
          keyboard: "numeric",
        },
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

      <TouchableOpacity style={styles.photoPickerBtn} onPress={pickPhoto}>
        {photo ? (
          <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoPickerText}>📷 Add Vehicle Photo</Text>
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

function VehicleEditForm({
  vehicle,
  onClose,
  onSuccess,
}: {
  vehicle: VehicleDetail;
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
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${API_BASE}/vehiculos/editar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `datax=${encodeURIComponent(
          JSON.stringify({
            id: vehicle.id,
            placa: form.placa,
            chasis: form.chasis,
            marca: form.marca,
            modelo: form.modelo,
            anio: Number(form.anio),
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
  searchInput: {
    margin: 16,
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 14,
    color: "#f1f3fc",
    borderWidth: 1,
    borderColor: "#20262f",
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
  vehicleName: { color: "#f1f3fc", fontSize: 16, fontWeight: "bold" },
  vehicleYear: { color: "#72757d", fontSize: 13, marginTop: 2 },
  vehiclePlate: {
    color: "#89acff",
    fontSize: 12,
    fontFamily: "monospace",
    marginTop: 6,
    letterSpacing: 2,
  },
  emptyText: { color: "#72757d", textAlign: "center", marginTop: 40 },
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
  },
  changePhotoBtnText: { color: "#f1f3fc", fontSize: 12 },
  detailHeader: { paddingHorizontal: 16, marginBottom: 12 },
  detailTitle: { color: "#f1f3fc", fontSize: 24, fontWeight: "bold" },
  detailSubtitle: { color: "#72757d", fontSize: 14, marginTop: 4 },
  editVehicleBtn: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#20262f",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#44484f",
  },
  editVehicleBtnText: { color: "#89acff", fontWeight: "600", fontSize: 14 },
  financialGrid: { padding: 16, gap: 12 },
  financialCard: {
    backgroundColor: "#151a21",
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: "#20262f",
  },
  financialLabel: {
    color: "#72757d",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  financialValue: { fontSize: 22, fontWeight: "bold" },
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
