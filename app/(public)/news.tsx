import { getNews } from "@/services/api";
import { NewsItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

const News = () => {
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const data = await getNews();
        setNews(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, []);

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
        <Text style={styles.title}>Latest News</Text>
        <Text style={styles.subTitle}>
          Stay updated with the latest shifts in the Dominican and global
          automotive landscape.
        </Text>

        <View style={styles.newContainer}>
          {news && news.length > 0
            ? news.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.newsCard}
                  onPress={() =>
                    router.push({
                      pathname: "/newsDetails",
                      params: { id: item.id },
                    })
                  }
                >
                  <Image
                    source={{ uri: item.imagenUrl }}
                    style={styles.newsImage}
                  />
                  <View style={{ padding: 16 }}>
                    <Text style={styles.title}>{item.titulo}</Text>
                    <Text style={styles.subTitle}>{item.resumen}</Text>
                    <View
                      style={{
                        marginTop: 18,
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={styles.subTitle}>
                        Published on:{" "}
                        <Text style={{ color: "#89acff", fontWeight: 700 }}>
                          {new Date(item.fecha).toLocaleDateString()}
                        </Text>
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#89acff"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            : null}
        </View>
      </View>
    </ScrollView>
  );
};

export default News;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e14",
  },
  content: {
    paddingTop: 42,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 14,
    color: "#aaa",
    lineHeight: 24,
  },
  newContainer: {
    marginTop: 20,
    flexDirection: "column",
    gap: 32,
  },
  newsCard: {
    borderRadius: 8,
    backgroundColor: "#2c323d",
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    position: "relative",
  },
});
