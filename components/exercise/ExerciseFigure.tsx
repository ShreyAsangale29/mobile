/**
 * ExerciseFigure.tsx
 *
 * Renders the exact stick-figure SVG for each exercise, matching the
 * HTML AuraFit design.  Uses react-native-svg (already in Expo SDK).
 *
 * Usage:
 *   <ExerciseFigure exerciseId="squats" color="#8B5CF6" size={64} />
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Circle,
  Line,
  Rect,
  Polygon,
  RadialGradient,
  Defs,
  Stop,
  G,
} from "react-native-svg";

type Props = {
  exerciseId: string;
  color: string;   // accent colour (border / glow)
  size?: number;   // box size in dp — default 64
};

// ─── shared gradient background ──────────────────────────────────────────────
function BgGradient({ id, color }: { id: string; color: string }) {
  // Parse hex → rgb for stop-color
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return (
    <Defs>
      <RadialGradient id={id} cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0%" stopColor={`rgb(${r},${g},${b})`} stopOpacity={0.2} />
        <Stop offset="100%" stopColor="transparent" stopOpacity={0} />
      </RadialGradient>
    </Defs>
  );
}

// ─── per-exercise figures ─────────────────────────────────────────────────────

function SquatsFigure({ c }: { c: string }) {
  const d = "#7C3AED";
  return (
    <G>
      {/* head */}
      <Circle cx="32" cy="10" r="5.5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* torso leaning fwd */}
      <Line x1="32" y1="16" x2="30" y2="30" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* arms out for balance */}
      <Line x1="30" y1="22" x2="18" y2="26" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="30" y1="22" x2="42" y2="19" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      {/* left leg bent */}
      <Line x1="30" y1="30" x2="22" y2="44" stroke={d} strokeWidth="2" strokeLinecap="round" />
      <Line x1="22" y1="44" x2="20" y2="54" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      {/* right leg bent */}
      <Line x1="30" y1="30" x2="40" y2="44" stroke={d} strokeWidth="2" strokeLinecap="round" />
      <Line x1="40" y1="44" x2="42" y2="54" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      {/* floor */}
      <Line x1="14" y1="55" x2="50" y2="55" stroke={c} strokeWidth="0.8" opacity={0.4} />
    </G>
  );
}

function PushupsFigure({ c }: { c: string }) {
  const d = "#0EA5E9";
  return (
    <G>
      {/* head */}
      <Circle cx="50" cy="22" r="5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* flat body */}
      <Line x1="45" y1="26" x2="14" y2="36" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      {/* left arm down */}
      <Line x1="42" y1="28" x2="46" y2="38" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="46" y1="38" x2="46" y2="43" stroke={d} strokeWidth="1.4" strokeLinecap="round" />
      {/* right arm down */}
      <Line x1="32" y1="31" x2="36" y2="41" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="36" y1="41" x2="36" y2="46" stroke={d} strokeWidth="1.4" strokeLinecap="round" />
      {/* feet */}
      <Line x1="14" y1="36" x2="10" y2="38" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      {/* floor */}
      <Line x1="8" y1="46" x2="56" y2="46" stroke={c} strokeWidth="0.8" opacity={0.3} />
    </G>
  );
}

function PlankFigure({ c }: { c: string }) {
  const d = "#059669";
  return (
    <G>
      {/* head */}
      <Circle cx="52" cy="24" r="5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* perfectly flat body */}
      <Line x1="47" y1="28" x2="12" y2="34" stroke={c} strokeWidth="2.4" strokeLinecap="round" />
      {/* left forearm */}
      <Line x1="38" y1="30" x2="36" y2="40" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="36" y1="40" x2="34" y2="42" stroke={d} strokeWidth="1.4" strokeLinecap="round" />
      {/* right forearm */}
      <Line x1="26" y1="32" x2="24" y2="42" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="24" y1="42" x2="22" y2="44" stroke={d} strokeWidth="1.4" strokeLinecap="round" />
      {/* toes */}
      <Line x1="12" y1="34" x2="8" y2="36" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      {/* floor */}
      <Line x1="6" y1="44" x2="58" y2="44" stroke={c} strokeWidth="0.8" opacity={0.3} />
      {/* core dashed line */}
      <Line x1="26" y1="31" x2="40" y2="29" stroke="#34D399"
        strokeWidth="0.8" strokeDasharray="2,3" opacity={0.6} />
    </G>
  );
}

function DeadliftFigure({ c }: { c: string }) {
  const d = "#EA580C";
  return (
    <G>
      {/* head */}
      <Circle cx="32" cy="9" r="5.5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* torso bent */}
      <Line x1="32" y1="15" x2="32" y2="32" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      {/* arms gripping bar */}
      <Line x1="32" y1="24" x2="20" y2="38" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="32" y1="24" x2="44" y2="38" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      {/* barbell */}
      <Line x1="12" y1="40" x2="52" y2="40" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <Rect x="10" y="36" width="5" height="8" rx="2" fill={d} />
      <Rect x="49" y="36" width="5" height="8" rx="2" fill={d} />
      {/* straight legs */}
      <Line x1="32" y1="32" x2="26" y2="52" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="32" y1="32" x2="38" y2="52" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* floor */}
      <Line x1="8" y1="54" x2="56" y2="54" stroke={c} strokeWidth="0.8" opacity={0.3} />
    </G>
  );
}

function LungesFigure({ c }: { c: string }) {
  const d = "#DB2777";
  return (
    <G>
      {/* head */}
      <Circle cx="34" cy="10" r="5.5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* upright torso */}
      <Line x1="34" y1="16" x2="34" y2="32" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* arms for balance */}
      <Line x1="34" y1="24" x2="22" y2="28" stroke={d} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="34" y1="24" x2="46" y2="20" stroke={d} strokeWidth="1.6" strokeLinecap="round" />
      {/* front leg bent 90° */}
      <Line x1="34" y1="32" x2="42" y2="44" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="42" y1="44" x2="44" y2="54" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      {/* back leg stretched */}
      <Line x1="34" y1="32" x2="22" y2="38" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="22" y1="38" x2="18" y2="52" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      {/* floor */}
      <Line x1="8" y1="55" x2="56" y2="55" stroke={c} strokeWidth="0.8" opacity={0.3} />
    </G>
  );
}

function PullupsFigure({ c }: { c: string }) {
  const d = "#7C3AED";
  return (
    <G>
      {/* bar at top */}
      <Rect x="10" y="10" width="44" height="4" rx="2" fill={d} opacity={0.6} />
      {/* grip hands */}
      <Circle cx="22" cy="12" r="3" fill="#C4B5FD" opacity={0.6} />
      <Circle cx="42" cy="12" r="3" fill="#C4B5FD" opacity={0.6} />
      {/* arms */}
      <Line x1="22" y1="14" x2="26" y2="26" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="42" y1="14" x2="38" y2="26" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      {/* head */}
      <Circle cx="32" cy="22" r="5.5" stroke="#C4B5FD" strokeWidth="1.5" fill="none" />
      {/* torso */}
      <Line x1="32" y1="28" x2="32" y2="46" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      {/* hanging legs */}
      <Line x1="32" y1="46" x2="27" y2="58" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="32" y1="46" x2="37" y2="58" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
    </G>
  );
}

function WallSitFigure({ c }: { c: string }) {
  const d = "#059669";
  return (
    <G>
      {/* wall */}
      <Line x1="54" y1="8" x2="54" y2="56" stroke={c} strokeWidth="1.5" strokeDasharray="3,3" opacity={0.4} />
      {/* head */}
      <Circle cx="46" cy="12" r="5.5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* torso against wall */}
      <Line x1="50" y1="17" x2="50" y2="36" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      {/* arms resting */}
      <Line x1="50" y1="24" x2="38" y2="26" stroke={d} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="50" y1="24" x2="54" y2="24" stroke={d} strokeWidth="1.6" strokeLinecap="round" />
      {/* thighs horizontal (90° sit) */}
      <Line x1="50" y1="36" x2="24" y2="36" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      <Line x1="50" y1="40" x2="24" y2="40" stroke={c} strokeWidth="1.4" strokeLinecap="round" opacity={0.4} />
      {/* shins vertical */}
      <Line x1="24" y1="36" x2="24" y2="56" stroke={d} strokeWidth="2" strokeLinecap="round" />
      {/* floor */}
      <Line x1="8" y1="56" x2="56" y2="56" stroke={c} strokeWidth="0.8" opacity={0.3} />
    </G>
  );
}

function JumpingJacksFigure({ c }: { c: string }) {
  return (
    <G>
      {/* head */}
      <Circle cx="32" cy="10" r="5.5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* torso */}
      <Line x1="32" y1="16" x2="32" y2="34" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      {/* arms up wide V */}
      <Line x1="32" y1="22" x2="14" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="32" y1="22" x2="50" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      {/* legs wide apart */}
      <Line x1="32" y1="34" x2="18" y2="52" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="18" y1="52" x2="14" y2="58" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="32" y1="34" x2="46" y2="52" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="46" y1="52" x2="50" y2="58" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      {/* energy sparks */}
      <Circle cx="12" cy="10" r="1.8" fill={c} opacity={0.6} />
      <Circle cx="52" cy="10" r="1.8" fill={c} opacity={0.6} />
    </G>
  );
}

function MountainClimbersFigure({ c }: { c: string }) {
  const d = "#0EA5E9";
  return (
    <G>
      {/* head */}
      <Circle cx="50" cy="20" r="5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* flat plank body */}
      <Line x1="45" y1="24" x2="12" y2="32" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      {/* arms propped */}
      <Line x1="40" y1="26" x2="44" y2="36" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="44" y1="36" x2="44" y2="42" stroke={d} strokeWidth="1.4" strokeLinecap="round" />
      <Line x1="30" y1="29" x2="34" y2="39" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="34" y1="39" x2="34" y2="44" stroke={d} strokeWidth="1.4" strokeLinecap="round" />
      {/* right leg straight back */}
      <Line x1="12" y1="32" x2="8" y2="40" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      {/* left knee driven forward */}
      <Line x1="12" y1="32" x2="22" y2="38" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="22" y1="38" x2="28" y2="44" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      {/* floor */}
      <Line x1="4" y1="44" x2="58" y2="44" stroke={c} strokeWidth="0.8" opacity={0.3} />
    </G>
  );
}

function TricepDipsFigure({ c }: { c: string }) {
  const d = "#7C3AED";
  return (
    <G>
      {/* bench/chair */}
      <Rect x="6" y="28" width="52" height="5" rx="2" fill={d} opacity={0.35} />
      <Line x1="12" y1="33" x2="12" y2="52" stroke={d} strokeWidth="1.6" strokeLinecap="round" opacity={0.4} />
      <Line x1="52" y1="33" x2="52" y2="52" stroke={d} strokeWidth="1.6" strokeLinecap="round" opacity={0.4} />
      {/* head */}
      <Circle cx="32" cy="10" r="5.5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* torso slightly lowered */}
      <Line x1="32" y1="16" x2="32" y2="30" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      {/* arms on bench */}
      <Line x1="32" y1="22" x2="14" y2="26" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="14" y1="26" x2="10" y2="30" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="32" y1="22" x2="50" y2="26" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="50" y1="26" x2="54" y2="30" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      {/* legs extended */}
      <Line x1="32" y1="30" x2="20" y2="48" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="20" y1="48" x2="18" y2="56" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="32" y1="30" x2="44" y2="48" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="44" y1="48" x2="46" y2="56" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      {/* floor */}
      <Line x1="8" y1="56" x2="56" y2="56" stroke={c} strokeWidth="0.8" opacity={0.3} />
    </G>
  );
}

function PistolSquatFigure({ c }: { c: string }) {
  const d = "#BE185D";
  return (
    <G>
      {/* head */}
      <Circle cx="34" cy="9" r="5.5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* torso */}
      <Line x1="34" y1="15" x2="32" y2="32" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      {/* arms out front for balance */}
      <Line x1="32" y1="22" x2="14" y2="24" stroke={d} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="32" y1="22" x2="44" y2="20" stroke={d} strokeWidth="1.6" strokeLinecap="round" />
      {/* standing leg deep squat */}
      <Line x1="32" y1="32" x2="26" y2="46" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      <Line x1="26" y1="46" x2="28" y2="56" stroke={c} strokeWidth="2" strokeLinecap="round" />
      {/* extended leg straight out */}
      <Line x1="32" y1="32" x2="48" y2="40" stroke={d} strokeWidth="2" strokeLinecap="round" />
      <Line x1="48" y1="40" x2="58" y2="40" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      {/* floor */}
      <Line x1="10" y1="56" x2="54" y2="56" stroke={c} strokeWidth="0.8" opacity={0.3} />
    </G>
  );
}

function MuscleUpFigure({ c }: { c: string }) {
  const d = "#7C3AED";
  return (
    <G>
      {/* bar */}
      <Rect x="10" y="8" width="44" height="4" rx="2" fill={d} opacity={0.6} />
      {/* hands */}
      <Circle cx="22" cy="10" r="3" fill="#C4B5FD" opacity={0.6} />
      <Circle cx="42" cy="10" r="3" fill="#C4B5FD" opacity={0.6} />
      {/* arms fully extended above bar */}
      <Line x1="22" y1="10" x2="26" y2="18" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="42" y1="10" x2="38" y2="18" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      {/* chest ABOVE bar — transition position */}
      <Circle cx="32" cy="18" r="5.5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* torso */}
      <Line x1="32" y1="24" x2="32" y2="40" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      {/* elbows bent pushing down */}
      <Line x1="26" y1="18" x2="20" y2="28" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="38" y1="18" x2="44" y2="28" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      {/* legs */}
      <Line x1="32" y1="40" x2="26" y2="54" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="32" y1="40" x2="38" y2="54" stroke={d} strokeWidth="1.8" strokeLinecap="round" />
      {/* energy sparks */}
      <Circle cx="14" cy="6"  r="1.5" fill="#FFD700" opacity={0.7} />
      <Circle cx="50" cy="6"  r="1.5" fill="#FFD700" opacity={0.7} />
      <Circle cx="32" cy="4"  r="1.8" fill={c}       opacity={0.5} />
    </G>
  );
}

function FullBodyFigure({ c }: { c: string }) {
  return (
    <G>
      {/* head */}
      <Circle cx="32" cy="9" r="5.5" stroke={c} strokeWidth="1.5" fill="none" />
      {/* torso */}
      <Line x1="32" y1="15" x2="32" y2="34" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
      {/* arms raised V — burpee/jump */}
      <Line x1="32" y1="22" x2="16" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="32" y1="22" x2="48" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      {/* legs wide jumping */}
      <Line x1="32" y1="34" x2="18" y2="50" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="18" y1="50" x2="14" y2="58" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <Line x1="32" y1="34" x2="46" y2="50" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <Line x1="46" y1="50" x2="50" y2="58" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      {/* energy burst lines above head */}
      <Line x1="32" y1="6" x2="32" y2="2" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" opacity={0.7} />
      <Line x1="36" y1="7" x2="38" y2="3" stroke="#FFD700" strokeWidth="1"   strokeLinecap="round" opacity={0.5} />
      <Line x1="28" y1="7" x2="26" y2="3" stroke="#FFD700" strokeWidth="1"   strokeLinecap="round" opacity={0.5} />
    </G>
  );
}

// ─── figure map ───────────────────────────────────────────────────────────────
const FIGURE_MAP: Record<string, React.ComponentType<{ c: string }>> = {
  squats:            SquatsFigure,
  pushups:           PushupsFigure,
  plank:             PlankFigure,
  wall_sit:          WallSitFigure,
  jumping_jacks:     JumpingJacksFigure,
  deadlift:          DeadliftFigure,
  lunges:            LungesFigure,
  pullups:           PullupsFigure,
  mountain_climbers: MountainClimbersFigure,
  dips:              TricepDipsFigure,
  pistol_squat:      PistolSquatFigure,
  muscle_up:         MuscleUpFigure,
  fullbody:          FullBodyFigure,
};

// ─── public component ─────────────────────────────────────────────────────────
export default function ExerciseFigure({ exerciseId, color, size = 64 }: Props) {
  const FigureComp = FIGURE_MAP[exerciseId] ?? SquatsFigure;

  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size * 0.22,
          borderColor: color + "55",
          backgroundColor: color + "10",
        },
      ]}
    >
      <Svg viewBox="0 0 64 64" width={size - 4} height={size - 4}>
        <BgGradient id={`bg_${exerciseId}`} color={color} />
        <Rect
          width="64"
          height="64"
          fill={`url(#bg_${exerciseId})`}
          rx="14"
        />
        <FigureComp c={color} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    overflow: "hidden",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
