import { Canvas } from "@react-three/fiber/native";
import { Sparkles } from "@react-three/drei/native";
import { Suspense } from "react";
import { StyleSheet, View } from "react-native";
import AvatarModel from "./AvatarModel";
import { useUIStore } from "../../src/state/uiStore";

type Phase = "warmup" | "countdown" | "active" | "rest" | "cooldown";
type Mode = "workout" | "yoga";

type Props = {
  phase: Phase;
  mode: Mode;
  exerciseType?: string | null;
  stage?: string;
  isHoldBased?: boolean;
  poseId?: string | null;
  formOk?: boolean;
  warmupMoveId?: string | null;
  warmupStage?: string;

  // Live continuous metrics from the exercise engine (EngineResult.metrics),
  // passed straight through from camera.tsx. Used to derive a 0-1 progress
  // value for exercises with a "cycle" clip (see SYNC_CONFIG below), so the
  // avatar's position tracks the user's actual joint angle every frame
  // instead of snapping between two fixed endpoints on stage change.
  kneeAngle?: number | null;
  baselineKneeAngle?: number | null;
  elbowAngle?: number | null;
  baselineElbowAngle?: number | null;
  style?: any;
};

// ─────────────────────────────────────────────────────────────────────────
// ANIMATION MAP — maps app-level exercise/pose ids to clip names baked
// into assets/avatar/coach.glb. Add a line here every time you merge a
// new Mixamo animation into the GLB. Anything not listed (or not present
// in the GLB yet) safely falls back to "Idle" instead of crashing.
// ─────────────────────────────────────────────────────────────────────────

type ClipEntry = string | { up: string; down: string };

const ANIMATION_MAP: Record<string, ClipEntry> = {
  jumpingjacks: "JumpingJacks", // no live sync yet — see chat notes
  squat: { up: "SquatCycle", down: "SquatCycle" }, // same clip both ways; SYNC_CONFIG drives it via progress instead
  pushup: { up: "PushUpCycle", down: "PushUpCycle" },
  plank: "Plank",

  mountain: "MountainX", // TODO: still unconfirmed which axis variant is correct
  tree: "Tree",
  "warrior-1": "WarriorI",
  "warrior-2": "WarriorII",
  "warrior-3": "WarriorIII",
  cobra: "Cobra",
  bow: "Bow",
  archer: "Archer",
  camel: "Camel",
  "shoulder-stand": "ShoulderStand",
  thunderbolt: "Thunderbolt",
  "wind-relieving": "WindRelieving",
};

// ─────────────────────────────────────────────────────────────────────────
// VOICE COACH OVERRIDES (Team 3's Voice Coach Engine) — when a voice
// command sets uiState.aiCoachAction, it takes priority over the normal
// exercise/pose-driven animation resolution below, including overriding
// Idle during warmup/rest/countdown. These play the plain full-motion clip
// (not the scrubbable *Cycle variant), since a voice-triggered demo should
// just play through once, not track the user's live joint angle.
// ─────────────────────────────────────────────────────────────────────────

const AI_COACH_ACTION_CLIPS: Record<string, string> = {
  play_squat_anim: "AirSquat",
  flex_shoulders: "PushUp",
};

// ─────────────────────────────────────────────────────────────────────────
// SYNC CONFIG — for exercises with a scrubbable "cycle" clip, maps the
// engine's live angle metric to a 0-1 progress value along that clip's
// timeline (0 = clip's "up" keyframe, 1 = clip's "down" keyframe — see
// build_cycle_clip.py). angleAtUp/angleAtDown come from the SAME reference
// values the engine itself uses for stage transitions (baseline angle and
// the configured deep/down angle), not guessed numbers.
// ─────────────────────────────────────────────────────────────────────────

type SyncSpec = {
  clip: string;
  angleKey: "kneeAngle" | "elbowAngle";
  baselineKey: "baselineKneeAngle" | "baselineElbowAngle";
  // Fallback deep-angle reference if baseline isn't available yet (e.g.
  // before the engine has locked in a standing/up baseline this session).
  fallbackDownAngle: number;
};

const SYNC_CONFIG: Record<string, SyncSpec> = {
  squat: {
    clip: "SquatCycle",
    angleKey: "kneeAngle",
    baselineKey: "baselineKneeAngle",
    fallbackDownAngle: 90, // matches typical squatDeepAngle thresholds
  },
  pushup: {
    clip: "PushUpCycle",
    angleKey: "elbowAngle",
    baselineKey: "baselineElbowAngle",
    fallbackDownAngle: 90, // matches typical pushupDownAngle thresholds
  },
};

function computeProgress(props: Props, aiCoachAction: string | null): number | null {
  // A voice-coach override plays a plain clip, not a scrubbed one.
  if (aiCoachAction && AI_COACH_ACTION_CLIPS[aiCoachAction]) return null;

  if (props.mode !== "workout" || !props.exerciseType) return null;
  const spec = SYNC_CONFIG[props.exerciseType];
  if (!spec) return null;

  const angle = props[spec.angleKey];
  if (typeof angle !== "number") return null;

  const baseline = props[spec.baselineKey];
  const upAngle = typeof baseline === "number" ? baseline : angle; // best-effort if no baseline yet
  const downAngle = spec.fallbackDownAngle;

  if (upAngle === downAngle) return 0;

  // angle counts DOWN as the user descends (both kneeAngle and elbowAngle
  // shrink toward the bent/down position), so progress rises 0->1 as angle
  // falls from upAngle toward downAngle.
  const raw = (upAngle - angle) / (upAngle - downAngle);
  return Math.min(1, Math.max(0, raw));
}

function resolveClipEntry(props: Props): ClipEntry | string | undefined {
  const rawKey = props.mode === "yoga" ? props.poseId : props.exerciseType;
  if (!rawKey) return undefined;

  const normalized = rawKey.toLowerCase().replace(/[-_]?pose$/, "").trim();
  return (
    ANIMATION_MAP[rawKey] ||
    ANIMATION_MAP[normalized] ||
    ANIMATION_MAP[rawKey.toLowerCase()] ||
    normalized
  );
}

function resolveAnimationName(props: Props, aiCoachAction: string | null): string {
  // Voice-coach override takes priority over everything, including
  // warmup/rest/countdown's usual Idle fallback.
  if (aiCoachAction && AI_COACH_ACTION_CLIPS[aiCoachAction]) {
    return AI_COACH_ACTION_CLIPS[aiCoachAction];
  }

  if (props.phase === "warmup" || props.phase === "rest" || props.phase === "countdown") {
    return "Idle";
  }

  const entry = resolveClipEntry(props);
  if (!entry) return "Idle";

  if (typeof entry === "string") return entry;

  // {up, down} pair: if this exercise has live sync (SYNC_CONFIG), both
  // sides point at the same scrubbable clip and `progress` (passed
  // separately to AvatarModel) does the actual positioning. Exercises
  // without sync config fall back to a simple stage-based pick.
  const key = props.exerciseType;
  if (key && SYNC_CONFIG[key]) return entry.down; // clip name is the same either way here
  return props.stage === "up" ? entry.up : entry.down;
}

export default function CoachAvatar(props: Props) {
  const { state: uiState } = useUIStore();
  const aiCoachAction = uiState.aiCoachAction ?? null;

  const animationName = resolveAnimationName(props, aiCoachAction);
  const progress = computeProgress(props, aiCoachAction);

  return (
    <View style={[styles.frame, props.style]} pointerEvents="none">
      <Canvas camera={{ position: [0, 1.2, 3], fov: 35 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 4, 3]} intensity={1.1} />
        <Suspense fallback={null}>
          <AvatarModel
            animationName={animationName}
            progress={progress}
            auraOk={props.formOk ?? true}
          />
          <Sparkles
            count={30}
            scale={[1.4, 2.2, 1.4]}
            size={3}
            speed={0.3}
            color={props.formOk === false ? "#D97706" : "#5EEAD4"}
          />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: "absolute",
    top: 195,
    right: 15,
    width: 110,
    height: 190,
    zIndex: 25,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(10,10,20,0.35)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});