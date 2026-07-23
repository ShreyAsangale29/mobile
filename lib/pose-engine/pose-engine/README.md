# Pose Engine

Framework-agnostic TypeScript port of the MediaPipe rule engine from `yoga_poses.py`.
Every file in this folder is **pure logic** — no React, DOM, tfjs, or Expo imports —
so you can drop the entire `pose-engine/` directory into a React Native (Expo)
project unchanged and reuse the same validators.

## What's in here

| File | What it does |
|---|---|
| `math.ts` | `calculateAngle`, `calculateDistance`, `midpoint` — direct ports of the Python helpers. |
| `landmarks.ts` | MediaPipe 33-landmark index map + `fromMoveNet` / `fromMediaPipe` adapters. |
| `result.ts` | `Checker` builder used by every pose to assemble a `PoseResult`. |
| `poses/*.ts` | One validator per pose, thresholds preserved 1:1 from the Python file. |
| `poses/index.ts` | `POSE_REGISTRY` (`Record<PoseId, PoseValidator>`) and `POSE_LIST` metadata. |
| `index.ts` | Public re-exports. |

## Mapping MediaPipe → tfjs MoveNet

The Python rules reference MediaPipe Pose's 33 landmarks. tfjs-models MoveNet only
provides 17 COCO keypoints. The adapter (`fromMoveNet`) maps them as follows
and leaves the rest `undefined`:

| MediaPipe ID | Name | MoveNet name |
|---|---|---|
| 0 | nose | `nose` |
| 2 / 5 | left/right eye | `left_eye` / `right_eye` |
| 7 / 8 | left/right ear | `left_ear` / `right_ear` |
| 11 / 12 | shoulders | `left_shoulder` / `right_shoulder` |
| 13 / 14 | elbows | `left_elbow` / `right_elbow` |
| 15 / 16 | wrists | `left_wrist` / `right_wrist` |
| 23 / 24 | hips | `left_hip` / `right_hip` |
| 25 / 26 | knees | `left_knee` / `right_knee` |
| 27 / 28 | ankles | `left_ankle` / `right_ankle` |
| 17–22, 29–32, 1, 3, 4, 6, 9, 10 | hand mesh, heel, foot index, eye/mouth detail | *not provided* |

All 12 yoga validators in this engine only reference shoulders, elbows, wrists,
hips, knees, ankles, and (for Wind-Relieving) the nose — every one of which
MoveNet provides. The `require()` helper still guards each rule: if any
landmark is missing on a given frame the check is marked `skipped` instead
of throwing.

## Coordinate system

Validators expect **pixel-space** points (matching the Python reference,
which multiplied normalized landmarks by frame width/height). Both adapters
return pixel coords:

- `fromMoveNet` — MoveNet already returns pixel coords, so it's a passthrough.
- `fromMediaPipe` — multiplies normalized `x`/`y` by frame size.

If you ever feed normalized coords directly, scale them yourself first.

## React Native (Expo) integration

Drop the folder into your Expo project, install tfjs for RN, then run
detection in a `cameraWithTensors` loop:

```bash
npx expo install @tensorflow/tfjs @tensorflow/tfjs-react-native \
  @tensorflow-models/pose-detection expo-camera expo-gl
```

```tsx
import { useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import * as poseDetection from "@tensorflow-models/pose-detection";
import {
  POSE_REGISTRY,
  fromMoveNet,
  type PoseId,
  type PoseResult,
} from "./pose-engine";

const TensorCamera = cameraWithTensors(Camera);
const FRAME = { width: 320, height: 240 };

export function PoseTrainer({ poseId }: { poseId: PoseId }) {
  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const processingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const [result, setResult] = useState<PoseResult | null>(null);

  // 1. Load tfjs + MoveNet once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await tf.ready();
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING },
      );
      if (!cancelled) detectorRef.current = detector;
    })();
    return () => {
      cancelled = true;
      detectorRef.current?.dispose();
    };
  }, []);

  // 2. Per-frame handler with back-pressure: drop frames if previous still running.
  const handleCameraStream = (
    images: IterableIterator<tf.Tensor3D>,
  ): void => {
    const loop = async () => {
      const next = images.next();
      if (next.done) return;
      const tensor = next.value;

      if (!processingRef.current && detectorRef.current) {
        processingRef.current = true;
        try {
          const poses = await detectorRef.current.estimatePoses(tensor, {
            maxPoses: 1,
            flipHorizontal: false,
          });
          if (poses[0]?.keypoints) {
            const landmarks = fromMoveNet(poses[0].keypoints);
            setResult(POSE_REGISTRY[poseId](landmarks, FRAME));
          }
        } catch (err) {
          console.warn("pose estimation failed", err);
        } finally {
          processingRef.current = false;
        }
      }

      tf.dispose(tensor); // critical: avoid GPU leak
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <TensorCamera
      // … Expo Camera props …
      cameraTextureWidth={FRAME.width}
      cameraTextureHeight={FRAME.height}
      resizeWidth={FRAME.width}
      resizeHeight={FRAME.height}
      resizeDepth={3}
      onReady={handleCameraStream}
      autorender
    />
  );
}
```

The key performance moves:
- One detector instance for the lifetime of the screen.
- `processingRef` guard: drop frames instead of queuing them; the user sees
  current state, not stale state.
- `tf.dispose(tensor)` every frame — the most common cause of RN tfjs crashes
  is the tensor pool filling up.
- Use **Lightning** MoveNet on mobile (faster), upgrade to Thunder only if
  device perf allows.

## Web reference implementation

See `src/routes/demo.tsx` in this project for a working browser version using
`getUserMedia` + tfjs WebGL backend. The pose-engine modules used there are
the exact same files you copy into your RN app.
