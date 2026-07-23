import { useGLTF, useAnimations, Outlines } from "@react-three/drei/native";
import { Asset } from "expo-asset";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// eslint-disable-next-line import/no-unresolved
import MODEL from "../../assets/avatar/coach.glb";

type Props = {
  animationName: string;
  fallbackAnimationName?: string;
  // When set (0-1), the avatar directly scrubs to this point in
  // `animationName`'s timeline instead of playing/crossfading it — used for
  // continuous rep sync (e.g. progress derived live from kneeAngle/
  // elbowAngle). `animationName` must refer to a scrubbable "cycle" clip
  // (e.g. "SquatCycle") whose own timeline already goes from the up pose
  // (t=0) to the down pose (t=1) — see build_cycle_clip.py.
  progress?: number | null;
  // Drives the aura outline color — teal/purple glow when form is correct,
  // a dimmer amber when it's not. Matches the app's aura/chakra gradient
  // identity. Independent of progress/scrubbing — applies regardless of
  // whether the avatar is crossfading or being scrubbed.
  auraOk?: boolean;
};

// require()/import of a .glb in React Native gives you a numeric asset
// module id, NOT a URL — useGLTF needs an actual URL string. Asset.fromModule
// + downloadAsync() resolves that id into a real local file:// URI. This
// component just waits for that resolution (rendering nothing meanwhile —
// CoachAvatar's <Suspense fallback={null}> covers this gap visually) before
// mounting the part that actually calls useGLTF.
export default function AvatarModel(props: Props) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const asset = Asset.fromModule(MODEL);
    asset
      .downloadAsync()
      .then(() => {
        if (!cancelled) setUri(asset.localUri ?? asset.uri);
      })
      .catch((err) => {
        console.warn("Failed to resolve coach.glb asset:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!uri) return null;

  return <LoadedAvatar {...props} uri={uri} />;
}

function findBestMatchingClip(targetName: string, availableNames: string[], fallback: string): string {
  if (!availableNames || availableNames.length === 0) return fallback;
  if (availableNames.includes(targetName)) return targetName;

  const cleanTarget = targetName.toLowerCase().replace(/[-_]/g, "");

  // 1. Case-insensitive exact match without separators
  const matchCase = availableNames.find(
    (n) => n.toLowerCase().replace(/[-_]/g, "") === cleanTarget
  );
  if (matchCase) return matchCase;

  // 2. Partial substring match
  const matchPartial = availableNames.find(
    (n) =>
      n.toLowerCase().includes(cleanTarget) ||
      cleanTarget.includes(n.toLowerCase().replace(/[-_]/g, ""))
  );
  if (matchPartial) return matchPartial;

  // 3. Fall back
  return availableNames.includes(fallback) ? fallback : availableNames[0] ?? fallback;
}

function LoadedAvatar({
  animationName,
  fallbackAnimationName = "Idle",
  progress,
  auraOk = true,
  uri,
}: Props & { uri: string }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(uri);
  const { actions, names } = useAnimations(animations, group);

  const currentActionName = useRef<string | null>(null);
  const scrubbingActionName = useRef<string | null>(null);

  useEffect(() => {
    if (names.length > 0) {
      console.log("[AvatarModel] Requested:", animationName, "| GLB clips in model:", names);
    }

    const resolvedName = findBestMatchingClip(animationName, names, fallbackAnimationName);
    const nextAction = actions[resolvedName];
    if (!nextAction) return;

    const isScrubbing = typeof progress === "number";

    if (isScrubbing) {
      // Scrub mode: pause the clip and drive its .time directly instead of
      // letting it play. If we're switching INTO scrub mode (or switching
      // which clip we're scrubbing), stop whatever was playing first so it
      // doesn't keep animating underneath our direct time-setting.
      if (scrubbingActionName.current !== resolvedName) {
        if (currentActionName.current && currentActionName.current !== resolvedName) {
          actions[currentActionName.current]?.stop();
        }
        nextAction.reset().play();
        nextAction.paused = true;
        scrubbingActionName.current = resolvedName;
        currentActionName.current = resolvedName;
      }
      const clipDuration = nextAction.getClip().duration || 1;
      nextAction.time = THREE.MathUtils.clamp(progress!, 0, 1) * clipDuration;
      return;
    }

    // Normal crossfade mode — used for Idle, hold-based poses (Plank,
    // Mountain, other yoga holds), voice-coach-triggered clips, and
    // anything without a live progress value.
    scrubbingActionName.current = null;
    if (currentActionName.current === resolvedName) return;

    const prevAction = currentActionName.current ? actions[currentActionName.current] : null;
    nextAction.reset().fadeIn(0.3).play();
    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(0.3);
    }
    currentActionName.current = resolvedName;
  }, [animationName, fallbackAnimationName, progress, actions, names]);

  return (
    <primitive ref={group} object={scene} scale={1} position={[0, -1, 0]}>
      <Outlines thickness={2.5} color={auraOk ? "#5EEAD4" : "#D97706"} transparent opacity={0.85} />
    </primitive>
  );
}