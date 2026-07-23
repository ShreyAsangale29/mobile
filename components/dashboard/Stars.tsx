import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  View,
  StyleSheet,
} from "react-native";

const { width } = Dimensions.get("window");

const symbols = ["✦", "✧", "•"];

const stars = Array.from({ length: 120 }, () => ({
  top: Math.random() * 1800,
  left: Math.random() * width,
  size: Math.random() * 4 + 1,
  symbol: symbols[Math.floor(Math.random() * symbols.length)],
}));

function Star({ top, left, size, symbol }: any) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        top,
        left,
        opacity,
        fontSize: size * 3,
        color: "#FFF",
        textShadowColor: "#FFF",
        textShadowRadius: 8,
      }}
    >
      {symbol}
    </Animated.Text>
  );
}

export default function Stars() {
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      {stars.map((star, i) => (
        <Star key={i} {...star} />
      ))}
    </View>
  );
}