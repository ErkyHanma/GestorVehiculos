import { getNewsById } from "@/services/api";
import { NewsItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const NewsDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewsById = async () => {
      try {
        setIsLoading(true);
        const data = await getNewsById(Number(params.id));
        setNews(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNewsById();
  }, [params.id]);

  const handleOpenLink = async () => {
    if (news?.link) {
      try {
        await Linking.openURL(news.link);
      } catch (error) {
        console.error("Error opening link:", error);
      }
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

  if (!news) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>News not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: news.imagenUrl }}
        style={styles.featuredImage}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{news.titulo}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={16} color="#89acff" />
            <Text style={styles.metaText}>
              {new Date(news.fecha).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="globe" size={16} color="#89acff" />
            <Text style={styles.metaText}>{news.fuente}</Text>
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.summaryText}>{news.resumen}</Text>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.primaryCTA} onPress={handleOpenLink}>
            <Ionicons name="open" size={20} color="#fff" />
            <Text style={styles.primaryCTAText}>Read Full Article</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#89acff" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Source Information</Text>
            <Text style={styles.infoDescription}>
              This article is sourced from {news.fuente}. Click the button above
              to read the complete article.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default NewsDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e14",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#1a2332",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a3d4d",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(79, 195, 247, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#89acff",
  },
  featuredImage: {
    width: "100%",
    height: 300,
    marginBottom: 20,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
    lineHeight: 34,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2332",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2a3d4d",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: "#aaa",
    fontWeight: "500",
  },
  metaDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#2a3d4d",
    marginHorizontal: 12,
  },
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: "#bbb",
    lineHeight: 26,
  },
  ctaContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  primaryCTA: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#89acff",
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#89acff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primaryCTAText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#1a2332",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: "#2a3d4d",
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: "#aaa",
    lineHeight: 18,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#89acff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
