import { HomeFeatures } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const SLIDER_WIDTH = width;
const SLIDE_HEIGHT = 250;

const sliderImages = [
  require("@/assets/images/high-performance-luxury-lease-rental-cars-demand-rent-has-increased-drivers-becoming-more-attractive-to-57339615.webp"),
  require("@/assets/images/sports-car-on-coastal-road.webp"),
  require("@/assets/images/360_F_781287102_NdygxNSfjeZShVCWW5luxcDMysvgQzMV.webp"),
  require("@/assets/images/black-sports-car.webp"),
];

const Index = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / SLIDER_WIDTH);
    setActiveSlide(currentIndex);
  };

  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SLIDER_WIDTH,
      animated: true,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.sliderContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {sliderImages.map((image, index) => (
            <Image key={index} source={image} style={styles.sliderImage} />
          ))}
        </ScrollView>

        <View style={styles.dotsContainer}>
          {sliderImages.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dot, activeSlide === index && styles.activeDot]}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Your Premium Vehicle Awaits</Text>
        <Text style={styles.heroSubtitle}>
          Experience luxury and comfort with our exclusive fleet
        </Text>
      </View>

      <View style={styles.ctaSection}>
        <Link href="/catalog" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Browse Catalog</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/about" asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="information-circle" size={20} color="#89acff" />
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Choose Us</Text>
        <FlatList
          data={HomeFeatures}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={item.icon} size={32} color="#89acff" />
              </View>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDescription}>{item.description}</Text>
            </View>
          )}
        />
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>Vehicles</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>10K+</Text>
          <Text style={styles.statLabel}>Happy Clients</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8★</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Community Section */}
      <View style={styles.communitySection}>
        <Text style={styles.sectionTitle}>Join Our Community</Text>
        <Text style={styles.communityDescription}>
          Connect with other car enthusiasts and share your experiences
        </Text>
        <Link href="/community" asChild>
          <TouchableOpacity style={styles.communityButton}>
            <Text style={styles.communityButtonText}>Visit Community</Text>
            <Ionicons name="arrow-forward" size={18} color="#111" />
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e14",
  },
  sliderContainer: {
    height: SLIDE_HEIGHT,
    overflow: "hidden",
    marginBottom: 20,
  },
  sliderImage: {
    width: SLIDER_WIDTH,
    height: SLIDE_HEIGHT,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(10, 14, 20, 0.8)",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#444",
  },
  activeDot: {
    backgroundColor: "#89acff",
    width: 24,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "linear-gradient(135deg, #1a2332 0%, #0f1419 100%)",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#aaa",
    lineHeight: 24,
  },
  ctaSection: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#89acff ",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#89acff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#89acff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    color: "#89acff",
    fontSize: 14,
    fontWeight: "600",
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#1a2332",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a3d4d",
    margin: 8,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(79, 195, 247, 0.1)",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 6,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 18,
  },
  statsSection: {
    flexDirection: "row",
    backgroundColor: "#1a2332",
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a3d4d",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#89acff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#aaa",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#2a3d4d",
    marginHorizontal: 8,
  },
  communitySection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#1a2332",
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#2a3d4d",
  },
  communityDescription: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 16,
    lineHeight: 20,
  },
  communityButton: {
    flexDirection: "row",
    backgroundColor: "#89acff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  communityButtonText: {
    color: "#111",
    fontSize: 14,
    fontWeight: "600",
  },
});
