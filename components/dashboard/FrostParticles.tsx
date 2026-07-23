import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const snowflakes = ["❄", "❅", "❆"];

function Snowflake() {
  const startX = Math.random() * width;

  const translateY = useRef(
    new Animated.Value(-100)
  ).current;

  const translateX = useRef(
    new Animated.Value(startX)
  ).current;

  const rotate = useRef(
    new Animated.Value(0)
  ).current;

  const size = Math.random() * 12 + 10;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height + 150,
          duration: 10000 + Math.random() * 10000,
          useNativeDriver: true,
        }),

        Animated.sequence([
          Animated.timing(translateX, {
            toValue: startX + 30,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: startX - 30,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]),

        Animated.timing(rotate, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotate, startX, translateX, translateY]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        transform: [
          { translateX },
          { translateY },
          { rotate: spin },
        ],
      }}
    >
      <Text
        style={{
          fontSize: size,
          color: "rgba(255,255,255,0.6)",
          textShadowColor: "#FFF",
          textShadowRadius: 8,
        }}
      >
        {
          snowflakes[
            Math.floor(Math.random() * snowflakes.length)
          ]
        }
      </Text>
    </Animated.View>
  );
}

export default function FrostParticles() {
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      {Array.from({ length: 20 }).map((_, i) => (
        <Snowflake key={i} />
      ))}
    </View>
  );
}