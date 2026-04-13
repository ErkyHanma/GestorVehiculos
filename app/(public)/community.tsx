import { getCommunitySubjects } from "@/services/api";
import { CommunitySubject } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

const Community = () => {
  const [subjects, setSubjects] = useState<CommunitySubject[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const limit = 10;

  useEffect(() => {
    const fetchCommunitySubjects = async () => {
      try {
        setIsLoading(true);
        const data = await getCommunitySubjects({ page, limit });
        setSubjects(data);
        setHasNextPage(Array.isArray(data) && data.length === limit);
      } catch (error) {
        console.error("Error fetching community subjects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommunitySubjects();
  }, [page]);

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
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subTitle}>
          Connect with fellow Pulse owners and tech enthusiasts.
        </Text>

        <View style={styles.videoContainer}>
          {subjects && subjects.length > 0
            ? subjects.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.subjectCard}
                  onPress={() =>
                    router.push({
                      pathname: "/(public)/communityDetails",
                      params: { id: item.id },
                    })
                  }
                >
                  <View style={{ padding: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 16,
                        marginBottom: 6,
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "700",
                            fontSize: 16,
                          }}
                        >
                          {item.autor}
                        </Text>
                        <Text style={{ color: "#aaa", fontSize: 12 }}>
                          {item.vehiculo}
                        </Text>
                      </View>
                      <Text style={{ color: "#89acff", fontWeight: 700 }}>
                        {new Date(item.fecha).toLocaleDateString()}
                      </Text>
                    </View>

                    {item.vehiculoFoto && (
                      <Image
                        source={{ uri: item.vehiculoFoto }}
                        style={styles.vehicleImage}
                      />
                    )}

                    <Text
                      style={{
                        fontSize: 24,
                        color: "#fff",
                        fontWeight: "bold",
                        marginTop: 12,
                      }}
                    >
                      {item.titulo}
                    </Text>
                    <Text style={styles.subTitle}>{item.descripcion}</Text>

                    <View
                      style={{
                        marginTop: 24,
                        justifyContent: "space-between",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View>
                        <Text style={{ color: "#89acff", fontWeight: "bold" }}>
                          {item.totalRespuestas} replies
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          gap: 4,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#89acff", fontWeight: "bold" }}>
                          READ THREAD
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={20}
                          color="#89acff"
                        />
                      </TouchableOpacity>
                    </View>
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
    </ScrollView>
  );
};

export default Community;

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
  },
  videoContainer: {
    marginTop: 20,
    flexDirection: "column",
    gap: 32,
  },
  subjectCard: {
    borderRadius: 8,
    backgroundColor: "#2c323d",
    overflow: "hidden",
  },
  vehicleImage: {
    width: "100%",
    height: 200,
    marginTop: 16,
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
