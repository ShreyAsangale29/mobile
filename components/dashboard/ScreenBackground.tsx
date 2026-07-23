// components/dashboard/ScreenBackground.tsx
//
// Shared page background for the dashboard — now uses the exact same
// AuroraBackground (SVG aurora bands + drifting crystal sparkles) that
// powers the Yoga and Exercise selection screens, so the whole app shares
// one consistent dark-aurora theme instead of the dashboard having its own
// black/neon-purple star field.
//
// NOTE: the previous version auto-cycled `mood` every 3s via useUIStore
// purely for the background tint (with console.log calls left in) — that
// looked like temporary debug scaffolding rather than an intentional
// feature, and it doesn't exist on the other screens, so it's been
// removed here for visual consistency. useUIStore/palettes/AuroraCanvas/
// Stars/FrostParticles are untouched and still available if you want mood
// theming somewhere else later.

import React, { ReactNode } from "react";
import { Dimensions, View } from "react-native";

import AuroraBackground from "../yoga/AuroraBackground";

const { height: SCREEN_H } = Dimensions.get("window");

interface ScreenBackgroundProps {
  children: ReactNode;
}

export default function ScreenBackground({ children }: ScreenBackgroundProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "#0B081A" }}>
      <AuroraBackground height={SCREEN_H} />
      {children}
    </View>
  );
}