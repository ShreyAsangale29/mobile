import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
// eslint-disable-next-line import/no-duplicates
} from "react-native";

import { Stack } from "expo-router";
// eslint-disable-next-line import/no-duplicates
import { View, Text } from "react-native";
import RewardCard from "../components/reward/RewardCard";
import { rewards } from "../components/reward/rewardData";
import RewardHeader from "../components/reward/RewardHeader";
import XPWalletCard from "../components/reward/XPWalletCard";
import RewardFilterTabs from "../components/reward/RewardFilterTabs";
import MysteryBoxCard from "../components/reward/MysteryBoxCard";
import StreakRewards from "../components/reward/StreakRewards";
import SpecialDrops from "../components/reward/SpecialDrops";
import RewardPopup from "../components/reward/RewardPopup";
import JourneyBackground from "../components/backgrounds/JourneyBackground";
export default function RewardCenter() {
  const [showReward, setShowReward] =
    useState(false);
  return (
    <>
      <JourneyBackground />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 40,
        }}
      >
        <RewardHeader />

        <XPWalletCard />

        <RewardFilterTabs />
        <Text style={styles.sectionTitle}>
        Unlocked Rewards
        </Text>

        <View style={styles.grid}>
        {rewards.map((reward) => (
            <RewardCard
            key={reward.id}
            title={reward.title}
            icon={reward.icon}
            rarity={reward.rarity}
            unlocked={reward.unlocked}
            color={reward.color}
            />
        ))}
        </View>
        <MysteryBoxCard />

        <StreakRewards />

        <SpecialDrops />
        <RewardPopup
        visible={showReward}
        onClose={() =>
            setShowReward(false)
        }
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    },

    grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    },
});