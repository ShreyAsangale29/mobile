// components/progress-story/TransformationSlider.tsx

import React, { useRef, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  Text,
} from "react-native";

type Props = {
  beforeImage: any;
  afterImage: any;
};

export default function TransformationSlider({
  beforeImage,
  afterImage,
}: Props) {
  const [containerWidth, setContainerWidth] =
    useState(300);

  const sliderX = useRef(
    new Animated.Value(150)
  ).current;

  const currentX = useRef(150);

  const onLayout = (
    event: LayoutChangeEvent
  ) => {
    const width =
      event.nativeEvent.layout.width;

    setContainerWidth(width);

    currentX.current = width / 2;

    sliderX.setValue(width / 2);
  };

  const panResponder =
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        let newX =
          currentX.current + gesture.dx;

        if (newX < 0) newX = 0;
        if (newX > containerWidth)
          newX = containerWidth;

        sliderX.setValue(newX);
      },

      onPanResponderRelease: (_, gesture) => {
        let newX =
          currentX.current + gesture.dx;

        if (newX < 0) newX = 0;
        if (newX > containerWidth)
          newX = containerWidth;

        currentX.current = newX;
      },
    });

  return (
    <View
      style={styles.container}
      onLayout={onLayout}
    >
      {/* BEFORE */}
      <Image
        source={beforeImage}
        style={styles.image}
      />

      {/* AFTER */}
      <Animated.View
        style={[
          styles.afterWrapper,
          {
            width: sliderX,
          },
        ]}
      >
        <Image
          source={afterImage}
          style={styles.image}
        />
      </Animated.View>

      {/* Divider */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.divider,
          {
            left: sliderX,
          },
        ]}
      >
        <View style={styles.handle}>
          <Text style={styles.handleText}>
            ↔
          </Text>
        </View>
      </Animated.View>

      {/* Labels */}
      <View style={styles.labels}>
        <Text style={styles.label}>
          Week 1
        </Text>

        <Text style={styles.label}>
          Current
        </Text>
      </View>
      <View style={styles.beforeBadge}>
        <Text style={styles.badgeText}>BEFORE</Text>
        </View>

        <View style={styles.afterBadge}>
        <Text style={styles.badgeText}>AFTER</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 380,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#141029",
    marginTop: 16,
  },

  image: {
    width: "100%",
    height: 380,
    position: "absolute",
  },

  afterWrapper: {
    height: "100%",
    overflow: "hidden",
  },

  divider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#FFFFFF",
  },

  handle: {
  position: "absolute",
  top: "45%",
  left: -22,
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "#8B5CF6",
  justifyContent: "center",
  alignItems: "center",
},

  handleText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  labels: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    color: "#FFFFFF",
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  beforeBadge: {
  position: "absolute",
  top: 12,
  left: 12,
  backgroundColor: "rgba(0,0,0,0.7)",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 12,
},

afterBadge: {
  position: "absolute",
  top: 12,
  right: 12,
  backgroundColor: "rgba(139,92,246,0.9)",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 12,
},

badgeText: {
  color: "#FFFFFF",
  fontWeight: "700",
  fontSize: 12,
},
});