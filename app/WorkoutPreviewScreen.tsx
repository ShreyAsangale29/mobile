// WorkoutPreviewScreen.tsx
//
// Sits between CameraCheckScreen and the Live Workout Camera screen.
// Shows the user exactly what they're about to do — each selected exercise
// or yoga pose, with a photo, both English and Sanskrit names (for yoga),
// a short description, and numbered steps — before starting the live session.

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { exercises } from "@/data/exercises";
import { getYogaPoseInfo } from "@/data/yogaPoseInfo";

type PreviewItem = {
  id: string;
  name: string;
  subtitle?: string;
  info: string;
  steps: string[];
  image?: any;
  color: string;
};

export default function WorkoutPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    exercises?: string;
    poses?: string;
  }>();

  const isYoga = params.mode === "yoga";
  const ids = (isYoga ? params.poses : params.exercises)?.split(",").filter(Boolean) ?? [];

  const items: PreviewItem[] = isYoga
    ? ids.map((id) => {
        const pose = getYogaPoseInfo(id);
        return {
          id,
          name: pose.englishName,
          subtitle: pose.sanskritName,
          info: pose.info,
          steps: pose.steps,
          image: pose.image,
          color: "#8B5CF6",
        };
      })
    : ids
        .map((id) => exercises.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => !!e)
        .map((e) => ({
          id: e.id,
          name: e.name,
          subtitle: `${e.difficulty} · ~${e.kcal} kcal`,
          info: e.info,
          steps: e.steps,
          image: e.image,
          color: e.color,
        }));

  const continueParams = isYoga
    ? `mode=yoga&poses=${encodeURIComponent(params.poses ?? "")}`
    : `mode=workout&exercises=${encodeURIComponent(params.exercises ?? "")}`;

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isYoga ? "Your Yoga Session" : "Your Workout Plan"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subheading}>
            {items.length} {isYoga ? "pose" : "exercise"}
            {items.length !== 1 ? "s" : ""} selected — here&apos;s what to expect before you start.
          </Text>

          {items.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No {isYoga ? "poses" : "exercises"} were found for this session.
              </Text>
            </View>
          )}

          {items.map((item, index) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.indexBadge, { backgroundColor: item.color }]}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {!!item.subtitle && (
                    <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>

              {item.image ? (
                <View style={styles.cardImageWrapper}>
                  <Image
                    source={item.image}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={[styles.cardImagePlaceholder, { borderColor: item.color }]}>
                  <Ionicons
                    name={isYoga ? "body-outline" : "barbell-outline"}
                    size={40}
                    color={item.color}
                  />
                  <Text style={styles.placeholderText}>Photo coming soon</Text>
                </View>
              )}

              <Text style={styles.cardInfo}>{item.info}</Text>

              <Text style={styles.stepsHeading}>How to do it</Text>
              {item.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <Text style={styles.stepNumber}>{i + 1}</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.startButton, items.length === 0 && styles.startButtonDisabled]}
            disabled={items.length === 0}
            onPress={() => router.push(`/camera?${continueParams}`)}
          >
            <Text style={styles.startButtonText}>Start Live Session</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B081A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  subheading: {
    color: "#D7CFE2",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 18,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#16112A",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  indexText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
  },
  cardImageWrapper: {
    width: "100%",
    height: 280,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: "#1F1A2D",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 130,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  placeholderText: {
    color: "#6B6490",
    fontSize: 11,
    marginTop: 6,
  },
  cardInfo: {
    color: "#D7CFE2",
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 14,
  },
  stepsHeading: {
    color: "#8B5CF6",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  stepNumber: {
    color: "#8B5CF6",
    fontSize: 13,
    fontWeight: "700",
    width: 20,
  },
  stepText: {
    flex: 1,
    color: "#D7CFE2",
    fontSize: 13.5,
    lineHeight: 19,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  startButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  startButtonDisabled: {
    backgroundColor: "#4B4560",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});