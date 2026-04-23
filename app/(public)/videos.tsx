import { getVideos } from "@/services/api";
import { VideoItem } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const Videos = () => {
  const [videos, setVideos] = useState<VideoItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const data = await getVideos();
        setVideos(data);
      } catch (error) {
        console.error("Error fetching videos:", error);
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
        <Text style={styles.title}>Knowledge Base</Text>
        <Text style={styles.subTitle}>
          Master your vehicles performance with engineering insights and
          maintenance walkthroughs.
        </Text>

        <View style={styles.videoContainer}>
          {videos && videos.length > 0
            ? videos.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.videCard}
                  onPress={() => Linking.openURL(item.url)}
                >
                  <YoutubePlayer
                    height={260}
                    play={true}
                    videoId={item.youtubeId}
                  />

                  <View style={{ padding: 16 }}>
                    <Text
                      style={{
                        fontSize: 24,
                        color: "#fff",
                        fontWeight: "bold",
                        marginBottom: 12,
                      }}
                    >
                      {item.titulo}
                    </Text>
                    <Text style={styles.subTitle}>{item.descripcion}</Text>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(item.url)}
                      style={{
                        marginTop: 12,
                        justifyContent: "flex-end",
                        alignItems: "center",
                        alignSelf: "flex-end",
                        flexDirection: "row",
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name="arrow-up-right-box"
                        size={20}
                        color="#89acff"
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            : null}
        </View>
      </View>
    </ScrollView>
  );
};

export default Videos;

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
  videCard: {
    borderRadius: 8,
    backgroundColor: "#2c323d",
    overflow: "hidden",
  },
});
