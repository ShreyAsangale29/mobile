import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";

import SummaryBackground from "../components/summary/SummaryBackground";
import GradeCard from "../components/summary/GradeCard";
import StatsGrid from "../components/summary/StatsGrid";
import XPCard from "../components/summary/XPCard";
import AIInsights from "../components/summary/AIInsights";
import NextWorkoutCard from "../components/summary/NextWorkoutCard";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";

export default function SessionSummaryScreen() {
  const router = useRouter();

  return (
    <SummaryBackground>
        <SafeAreaView style={styles.container}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >


            <GradeCard />

            <StatsGrid />

            <XPCard />



            <AIInsights />

            <NextWorkoutCard />
            <TouchableOpacity
            style={styles.finishButton}
            onPress={() => router.push("/progress-story")}
          >
            <Text style={styles.finishButtonText}>
              View Progress Story
            </Text>
          </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </SummaryBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  finishButton: {
    marginTop: 20,
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});