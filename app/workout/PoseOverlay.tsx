import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { Landmark } from "@/hooks/usePoseDetection";

const CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
];

type Props = {
  landmarks: Landmark[];
  mirror?: boolean;
};

export default function PoseOverlay({ landmarks, mirror = true }: Props) {
  const { width, height } = useWindowDimensions();

  const toScreen = (lm: Landmark) => ({
    x: (mirror ? 1 - lm.x : lm.x) * width,
    y: lm.y * height,
  });

  return (
    <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
      {CONNECTIONS.map(([startIdx, endIdx], i) => {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];
        if (!start || !end) return null;
        const p1 = toScreen(start);
        const p2 = toScreen(end);
        return (
          <Line
            key={`line-${i}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#8B5CF6"
            strokeWidth={3}
          />
        );
      })}
      {landmarks.map((lm, i) => {
        const p = toScreen(lm);
        return (
          <Circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#FFFFFF"
          />
        );
      })}
    </Svg>
  );
}