import { getCommunitySubjectById } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import
  {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from "react-native";

export interface CommunitySubjectDetail {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  vehiculo: string;
  vehiculoFoto: string;
  autor: string;
  totalRespuestas: number;
  respuestas: CommunityResponse[];
}

export interface CommunityResponse {
  id: number;
  contenido: string;
  fecha: string;
  autor: string;
}

const CommunityDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [subject, setSubject] = useState<CommunitySubjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getCommunitySubjectById(Number(id));
        setSubject(data);
      } catch (fetchError) {
        console.error("Error fetching community subject detail:", fetchError);
        setError("Could not load topic details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubject();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#89acff" />
      </View>
    );
  }

  if (error || !subject) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="alert-circle-outline" size={42} color="#89acff" />
        <Text style={styles.errorText}>{error ?? "Topic not found"}</Text>
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
        onPress={() => router.push("/community")}
      >
        <Ionicons name="chevron-back" size={20} color="#89acff" />
        <Text style={styles.backText}>Back to community</Text>
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.author}>{subject.autor}</Text>
            <Text style={styles.vehicle}>{subject.vehiculo}</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(subject.fecha).toLocaleDateString()}
          </Text>
        </View>

        {subject.vehiculoFoto ? (
          <Image source={{ uri: subject.vehiculoFoto }} style={styles.image} />
        ) : (
          <View
            style={{
              height: 1,
              backgroundColor: "#818a97",
              marginBottom: 24,
              width: "100%",
            }}
          ></View>
        )}

        <Text style={styles.title}>{subject.titulo}</Text>
        <Text style={styles.description}>{subject.descripcion}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={18}
          color="#89acff"
        />
        <Text style={styles.infoText}>
          {(
            subject.totalRespuestas ??
            subject.respuestas?.length ??
            0
          ).toString()}{" "}
          replies
        </Text>
      </View>

      <View style={styles.repliesContainer}>
        <Text style={styles.sectionTitle}>Replies</Text>

        {subject.respuestas && subject.respuestas.length > 0 ? (
          subject.respuestas.map((reply) => (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.replyHeader}>
                <Text style={styles.replyAuthor}>
                  {reply.autor ?? "Anonymous"}
                </Text>
                <Text style={styles.replyDate}>
                  {reply.fecha
                    ? new Date(reply.fecha).toLocaleDateString()
                    : "No date"}
                </Text>
              </View>
              <Text style={styles.replyText}>
                {reply.contenido ?? "No content"}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyRepliesCard}>
            <Ionicons name="chatbubble-outline" size={24} color="#89acff" />
            <Text style={styles.emptyRepliesText}>No replies yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default CommunityDetails;

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
    gap: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  author: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  vehicle: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
  dateText: {
    color: "#89acff",
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
    lineHeight: 24,
  },
  description: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 20,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1d2430",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#89acff",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoText: {
    color: "#89acff",
    fontWeight: "700",
    fontSize: 14,
  },
  repliesContainer: {
    gap: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  replyCard: {
    backgroundColor: "#2c323d",
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#89acff",
    gap: 8,
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  replyAuthor: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  replyDate: {
    color: "#89acff",
    fontSize: 12,
    fontWeight: "600",
  },
  replyText: {
    color: "#bbb",
    fontSize: 14,
    lineHeight: 22,
  },
  emptyRepliesCard: {
    backgroundColor: "#1d2430",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#89acff",
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  emptyRepliesText: {
    color: "#89acff",
    fontWeight: "600",
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
