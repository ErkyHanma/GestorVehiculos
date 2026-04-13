import { getVehicleId } from "@/services/api";
import { VehicleDetailsType } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const VehicleDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [vehicle, setVehicle] = useState<VehicleDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getVehicleId(Number(id));
        setVehicle(data);
      } catch (fetchError) {
        console.error("Error fetching vehicle details:", fetchError);
        setError("Could not load vehicle details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#89acff" />
      </View>
    );
  }

  if (error || !vehicle) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={42} color="#89acff" />
        <Text style={styles.errorText}>{error ?? "Vehicle not found"}</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => router.push("/catalog")}
      >
        <Ionicons name="chevron-back" size={20} color="#89acff" />
        <Text style={styles.backText}>Back to catalog</Text>
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <Text style={styles.brandModel}>
          {vehicle.marca} {vehicle.modelo}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Year: {vehicle.anio}</Text>
          <Text style={styles.priceText}>
            {vehicle.precio.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            })}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagesRow}
      >
        {vehicle.imagenes.map((image, index) => (
          <Image
            key={`${vehicle.id}-image-${index}`}
            source={{ uri: image }}
            style={styles.image}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{vehicle.descripcion}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Specifications</Text>
        <View style={styles.specList}>
          {Object.entries(vehicle.especificaciones).map(([key, value]) => (
            <View key={key} style={styles.specRow}>
              <Text style={styles.specKey}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
              <Text style={styles.specValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default VehicleDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e14",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0e14",
    paddingHorizontal: 24,
    gap: 14,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#89acff",
    backgroundColor: "#1d2430",
    marginBottom: 8,
  },
  backText: {
    color: "#89acff",
    fontWeight: "700",
    fontSize: 13,
  },
  headerCard: {
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginTop: 6,
  },
  brandModel: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    color: "#aaa",
    fontSize: 14,
  },
  priceText: {
    color: "#89acff",
    fontWeight: "700",
    fontSize: 16,
  },
  imagesRow: {
    gap: 10,
  },
  image: {
    width: 300,
    height: 220,
    borderRadius: 10,
  },
  sectionCard: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  description: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 24,
  },
  specList: {
    gap: 10,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#3a4350",
    paddingBottom: 8,
  },
  specKey: {
    color: "#89acff",
    fontWeight: "700",
    fontSize: 14,
  },
  specValue: {
    color: "#fff",
    fontSize: 14,
    maxWidth: "60%",
    textAlign: "right",
  },
  primaryButton: {
    backgroundColor: "#89acff",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "#0a0e14",
    fontWeight: "700",
    fontSize: 14,
  },
});
