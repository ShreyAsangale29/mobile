import React from "react";
import { ScrollView, StatusBar, StyleSheet } from "react-native";

import ScreenBackground from "@/components/dashboard/ScreenBackground";

import ChallengeSection from "@/components/dashboard/ChallengeSection";
import HeroCard from "@/components/dashboard/HeroCard";
import ProgressSummaryCard from "@/components/dashboard/ProgressSummaryCard";
import StartWorkoutButton from "@/components/dashboard/StartWorkoutButton";
import JourneyRoadmap from "@/components/dashboard/JourneyRoadmap";

export default function DashboardScreen() {
  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="#0B081A" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeroCard />

        <StartWorkoutButton />

        <ProgressSummaryCard />

        <ChallengeSection />

        <JourneyRoadmap />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
});