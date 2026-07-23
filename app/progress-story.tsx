// app/progress-story.tsx

import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

import { Stack, useRouter } from "expo-router";

import TransformationSlider from "../components/progress-story/TransformationSlider";

export default function ProgressStoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>
            Progress Story
          </Text>

          <Text style={styles.subtitle}>
            Your Transformation Journey
          </Text>

          {/* Milestone */}
          <View style={styles.card}>
            <Text style={styles.badge}>
              🏆 Posture Champion
            </Text>

            <Text style={styles.badgeText}>
              Your posture improved by 20%
              this week.
            </Text>
          </View>

          {/* Slider */}
          <TransformationSlider
            beforeImage={require("../assets/images/progress/after-side.jpg")}
            afterImage={require("../assets/images/progress/before-side.jpg")}
            />

            <Text style={styles.dragHint}>
            Drag to compare your transformation
            </Text>

            <Text style={styles.progressText}>
            Overall Progress: +27%
            </Text>

          {/* Metrics */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Progress Metrics
            </Text>

            <Text style={styles.metric}>
              Posture Score: 72% → 92%
            </Text>

            <Text style={styles.metric}>
              Workout Streak: 4 → 7 Days
            </Text>

            <Text style={styles.metric}>
              Reps Increased: 120 → 220
            </Text>
          </View>

          {/* AI Insight */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              AI Insight
            </Text>

            <Text style={styles.insight}>
              Excellent improvement in body
              alignment and movement consistency.
              Continue maintaining proper posture
              during workouts.
            </Text>
          </View>

          {/* Share */}
          <TouchableOpacity
            style={styles.shareButton}
          >
            <Text style={styles.shareText}>
              Share Story
            </Text>
          </TouchableOpacity>

          {/* Finish */}
          <TouchableOpacity
            style={styles.finishButton}
            onPress={() =>
              router.push("/ProgressDashboardScreen")
            }
          >
            <Text style={styles.finishText}>
              Finish
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B081A",
  },

  content: {
    padding: 16,
    paddingBottom: 50,
  },

  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    color: "#AAA",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#141029",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  badge: {
    color: "#FBBF24",
    fontSize: 18,
    fontWeight: "700",
  },

  badgeText: {
    color: "#D1D5DB",
    marginTop: 8,
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  metric: {
    color: "#FFF",
    marginBottom: 10,
  },

  insight: {
    color: "#D1D5DB",
    lineHeight: 22,
  },

  shareButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },

  shareText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },

  finishButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#8B5CF6",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },

  finishText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  dragHint: {
    color: "#A78BFA",
    textAlign: "center",
    marginTop: 10,
    fontSize: 12,
    },
    progressText: {
    color: "#10B981",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    },
});