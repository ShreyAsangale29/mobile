import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function AIInsights() {
  return (
    <>
      <View style={styles.header}>
        <View style={styles.dot} />

        <Text style={styles.headerText}>
          AI Insights
        </Text>

        <View style={styles.line} />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            3 Tips
          </Text>
        </View>
      </View>

      <InsightCard
        icon="✅"
        color="#10B981"
        title="Perfect depth on every rep"
        text="Your squat depth hit parallel or below on 23 out of 25 reps."
      />

      <InsightCard
        icon="⚠️"
        color="#F97316"
        title="Right knee caved inward twice"
        text="Push your knees outward at the bottom of the squat."
      />

      <InsightCard
        icon="🚀"
        color="#8B5CF6"
        title="Ready to level up"
        text="Try adding resistance in your next session."
      />
    </>
  );
}

function InsightCard({
  icon,
  title,
  text,
  color,
}: {
  icon: string;
  title: string;
  text: string;
  color: string;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          borderLeftColor: color,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          {
            borderColor: color,
          },
        ]}
      >
        <Text>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Text style={styles.text}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 6,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#8B5CF6",
  },

  headerText: {
    color: "#FFF",
    fontWeight: "700",
    marginLeft: 8,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor:
      "rgba(139,92,246,0.15)",
    marginHorizontal: 10,
  },

  badge: {
    backgroundColor:
      "rgba(139,92,246,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    color: "#B59BFF",
    fontSize: 10,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    backgroundColor:
      "rgba(18,13,38,0.75)",
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
  },

  title: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },

  text: {
    color: "#8A84AD",
    fontSize: 11,
    lineHeight: 16,
  },
});