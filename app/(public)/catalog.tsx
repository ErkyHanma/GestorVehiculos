import { getVehicles } from "@/services/api";
import { Vehicle } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import
  {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
  } from "react-native";



const Catalog = () => {
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [anioInput, setAnioInput] = useState<string>("");
  const [precioMinInput, setPrecioMinInput] = useState<string>("");
  const [precioMaxInput, setPrecioMaxInput] = useState<string>("");
  const [anio, setAnio] = useState<number | undefined>();
  const [page, setPage] = useState<number>(1);
  const [precioMin, setPrecioMin] = useState<number | undefined>();
  const [precioMax, setPrecioMax] = useState<number | undefined>();
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [isFiltersModalVisible, setIsFiltersModalVisible] =
    useState<boolean>(false);
  const limit = 10;

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        const data = await getVehicles({
          marca: searchQuery,
          modelo: searchQuery,
          anio,
          precioMin,
          precioMax,
          page,
          limit,
        });
        setVehicles(data);
        setHasNextPage(Array.isArray(data) && data.length === limit);
      } catch (error) {
        console.error("Error fetching community vehicles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicles();
  }, [page, searchQuery, anio, precioMin, precioMax]);

  const parseOptionalNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const handleApplyFilters = () => {
    setAnio(parseOptionalNumber(anioInput));
    setPrecioMin(parseOptionalNumber(precioMinInput));
    setPrecioMax(parseOptionalNumber(precioMaxInput));
    setPage(1);
    setIsFiltersModalVisible(false);
  };

  const handleClearFilters = () => {
    setAnioInput("");
    setPrecioMinInput("");
    setPrecioMaxInput("");
    setAnio(undefined);
    setPrecioMin(undefined);
    setPrecioMax(undefined);
    setPage(1);
    setIsFiltersModalVisible(false);
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a0e14",
        }}
      >
        <ActivityIndicator size="large" color="#89acff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 12,
            paddingVertical: 16,
            backgroundColor: "#1a1f28",
            borderRadius: 8,
          }}
        >
          <Ionicons name="search" size={20} color="#aaa" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicle by model or brand"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.openFiltersButton}
          onPress={() => setIsFiltersModalVisible(true)}
        >
          <Ionicons name="options-outline" size={18} color="#89acff" />
          <Text style={styles.openFiltersText}>Open Filters</Text>
        </TouchableOpacity>

        <View style={styles.vehicleContainer}>
          {vehicles && vehicles.length > 0
            ? vehicles.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.vehicleCard}
                  onPress={() =>
                    router.push({
                      pathname: "/(public)/vehicleDetails",
                      params: { id: item.id },
                    })
                  }
                >
                  {item.imagenUrl && (
                    <Image
                      source={{ uri: item.imagenUrl }}
                      style={styles.vehicleImage}
                    />
                  )}

                  <View style={{ padding: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 16,
                        marginBottom: 6,
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: 20,
                        }}
                      >
                        {item.marca} {item.modelo}
                      </Text>

                      <Text
                        style={{
                          color: "#89acff",
                          fontWeight: 700,
                          fontSize: 20,
                        }}
                      >
                        {`$${item.precio.toLocaleString()}`}
                      </Text>
                    </View>

                    <Text style={styles.subTitle}>{item.descripcionCorta}</Text>

                    <View
                      style={{
                        marginTop: 24,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <View>
                        <Ionicons name="calendar" size={16} color="#aaa" />
                      </View>
                      <View>
                        <Text style={{ color: "#aaa", fontWeight: "bold" }}>
                          {item.anio}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={{
                        backgroundColor: "#89acff",
                        marginTop: 24,
                        padding: 14,
                        borderRadius: 6,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() =>
                        router.push({
                          pathname: "/(public)/vehicleDetails",
                          params: { id: item.id },
                        })
                      }
                    >
                      <Text style={{ color: "#0a0e14", fontWeight: "700" }}>
                        View Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            : null}
        </View>

        <View style={styles.paginationContainer}>
          <TouchableOpacity
            onPress={handlePrevPage}
            disabled={page === 1}
            style={[
              styles.paginationButton,
              page === 1 && styles.paginationButtonDisabled,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={page === 1 ? "#666" : "#89acff"}
            />
            <Text
              style={[
                styles.paginationButtonText,
                page === 1 && styles.paginationButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.pageBadge}>
            <Text style={styles.pageBadgeText}>Page {page}</Text>
          </View>

          <TouchableOpacity
            onPress={handleNextPage}
            disabled={!hasNextPage}
            style={[
              styles.paginationButton,
              !hasNextPage && styles.paginationButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.paginationButtonText,
                !hasNextPage && styles.paginationButtonTextDisabled,
              ]}
            >
              Next
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={!hasNextPage ? "#666" : "#89acff"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isFiltersModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFiltersModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => setIsFiltersModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={18} color="#89acff" />
              </TouchableOpacity>
            </View>

            <View style={styles.filtersContainer}>
              <TextInput
                style={styles.filterInput}
                placeholder="Año"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={anioInput}
                onChangeText={setAnioInput}
              />
              <TextInput
                style={styles.filterInput}
                placeholder="Precio Min"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={precioMinInput}
                onChangeText={setPrecioMinInput}
              />
              <TextInput
                style={styles.filterInput}
                placeholder="Precio Max"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={precioMaxInput}
                onChangeText={setPrecioMaxInput}
              />
              <View style={styles.filterButtonsRow}>
                <TouchableOpacity
                  style={styles.applyFilterButton}
                  onPress={handleApplyFilters}
                >
                  <Text style={styles.applyFilterButtonText}>Apply Filters</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clearFilterButton}
                  onPress={handleClearFilters}
                >
                  <Text style={styles.clearFilterButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Catalog;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e14",
  },
  content: {
    paddingTop: 42,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: "#aaa",
    lineHeight: 24,
    marginTop: 4,
  },
  vehicleContainer: {
    marginTop: 20,
    flexDirection: "column",
    gap: 32,
  },
  searchInput: {
    fontSize: 16,
    color: "#fff",
    flex: 1,
  },
  openFiltersButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#89acff",
    borderRadius: 8,
    backgroundColor: "#1a1f28",
    paddingVertical: 10,
  },
  openFiltersText: {
    color: "#89acff",
    fontWeight: "700",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: "#1a1f28",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#89acff",
    padding: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#89acff",
    alignItems: "center",
    justifyContent: "center",
  },
  filtersContainer: {
    gap: 10,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: "#3a4350",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
    backgroundColor: "#11161f",
  },
  filterButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  applyFilterButton: {
    flex: 1,
    backgroundColor: "#89acff",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  applyFilterButtonText: {
    color: "#0a0e14",
    fontWeight: "700",
  },
  clearFilterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#89acff",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#1a1f28",
  },
  clearFilterButtonText: {
    color: "#89acff",
    fontWeight: "700",
  },
  vehicleCard: {
    borderRadius: 8,
    backgroundColor: "#2c323d",
    overflow: "hidden",
  },
  vehicleImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  paginationContainer: {
    marginTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#89acff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#1a1f28",
  },
  paginationButtonDisabled: {
    borderColor: "#444",
    backgroundColor: "#222831",
  },
  paginationButtonText: {
    color: "#89acff",
    fontWeight: "700",
    fontSize: 13,
  },
  paginationButtonTextDisabled: {
    color: "#666",
  },
  pageBadge: {
    borderWidth: 1,
    borderColor: "#89acff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#1a1f28",
  },
  pageBadgeText: {
    color: "#89acff",
    fontWeight: "700",
    fontSize: 13,
  },
});
