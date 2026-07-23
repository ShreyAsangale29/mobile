# Exercise Buddy — Project Handover Guide

This document is a start-to-end guide for picking up development on this app. It covers environment setup, how the pose-detection pipeline works, the file structure, known issues, and what's left to build.

---

## 1. What this app does

A React Native (Expo) fitness app that uses the phone's camera and Google MediaPipe to detect body pose in real time, then:
- Counts reps and scores form for workout exercises (push-ups, squats, planks, lunges, deadlifts)
- Checks yoga pose alignment against a reference (Tree Pose, Warrior I, etc.)
- Gives spoken audio coaching based on live detection

The pose detection itself runs entirely on-device via a custom native Android module — no server calls, no internet dependency for the core feature.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| App framework | Expo SDK 54, React Native 0.81.5, New Architecture enabled |
| Navigation | expo-router (file-based routing under `app/`) |
| Camera | react-native-vision-camera 4.7.2 (classic Frame Processor API, not the newer Nitro/HybridObject API) |
| Pose detection | Google MediaPipe Tasks Vision (`tasks-vision:0.10.21`), PoseLandmarker, LIVE_STREAM mode |
| Native bridge | Custom Expo Module (Kotlin) — `modules/mediapipe-pose` |
| Worklets | react-native-worklets-core (for VisionCamera frame processors) + react-native-reanimated/react-native-worklets (separate, for UI-thread animations) |
| Rep counting / form scoring | Custom TypeScript exercise-engine (`lib/exercise-engine`) |
| Yoga pose scoring | Custom TypeScript pose-engine (`lib/pose-engine`) |
| Audio | expo-speech (text-to-speech) |

---

## 3. Prerequisites (fresh machine setup)

1. **Node.js** (LTS) and npm
2. **Android Studio** with:
   - Android SDK, compileSdk 36, buildTools 36.0.0
   - NDK version `27.1.12297006` specifically (must match — mismatched NDK versions cause CMake/prefab build errors)
3. **JDK 17** (the project's Kotlin/Gradle config targets this)
4. A physical Android device (Redmi/Xiaomi/HyperOS devices need an extra step — see §7) or an emulator with a reasonably fast CPU

### Windows-specific: increase the page file (virtual memory)

This project's native build (MediaPipe + VisionCamera + Nitro modules, all compiled as C++ via CMake/ninja) is memory-hungry. On a fresh Windows machine, **do this before your first build** or you will hit `insufficient memory for the Java Runtime Environment` / `mmap failed` errors partway through:

1. `Win + R` → `sysdm.cpl` → **Advanced** tab → **Performance → Settings** → **Advanced** tab → **Virtual memory → Change**
2. Uncheck "Automatically manage paging file size for all drives"
3. Select the drive with the most free space (needs ~16GB free), choose **Custom size**: Initial = 8192 MB, Maximum = 16384 MB → **Set** → **OK**
4. **Restart the computer** — required for the change to apply

---

## 4. First-time project setup

```powershell
git clone <repo-url>
cd mobile
npm install
```

### Critical: `android/gradle.properties` must be single-architecture

Expo's `npx expo run:android` always passes `-PreactNativeArchitectures=arm64-v8a,armeabi-v7a` on the command line, which **overrides** whatever is in `gradle.properties`. Building for both architectures at once doubles the native C++ compilation load and is the single most common cause of out-of-memory build failures on this project.

**Recommended workaround** — build via Gradle directly instead of `npx expo run:android`, forcing single-arch explicitly:

```powershell
cd android
gradlew.bat app:assembleDebug -PreactNativeArchitectures=arm64-v8a -x lint -x test
```

Then install and start Metro separately:
```powershell
adb install -r app\build\outputs\apk\debug\app-debug.apk
cd ..
npx expo start --dev-client
```

Also ensure `android/gradle.properties` has (check there's no *duplicate* `reactNativeArchitectures` line further down the file overriding this — `expo prebuild --clean` sometimes reintroduces one):
```properties
reactNativeArchitectures=arm64-v8a
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
org.gradle.workers.max=2
org.gradle.parallel=false
```

### If you ever need a full clean rebuild

```powershell
npx expo prebuild --platform android --clean --no-install
```
This regenerates the `android/` folder from scratch. **After running this, always re-check `gradle.properties` for the single-arch settings above** — prebuild resets them to Expo's defaults.

---

## 5. Native pose-detection pipeline — how it works

This is the most complex part of the codebase. Read this section before touching anything under `modules/mediapipe-pose/`.

### Files and responsibilities

```
modules/mediapipe-pose/
├── expo-module.config.json          # registers the module for Expo autolinking
├── package.json
└── android/
    ├── build.gradle                  # dependencies: expo-modules-core, MediaPipe tasks-vision,
    │                                  # compileOnly react-native-vision-camera (for Frame types)
    └── src/main/
        ├── assets/
        │   └── pose_landmarker_lite.task   # the MediaPipe model file (~5.5MB, must be committed)
        └── java/.../mediapipePose/
            ├── MediapipePoseModule.kt              # Expo Module entry point
            ├── PoseBridge.kt                        # singleton glue: MediaPipe <-> Expo event emitter
            ├── PoseLandmarkerHelper.kt               # wraps MediaPipe's PoseLandmarker API
            └── MediapipePoseFrameProcessorPlugin.kt   # VisionCamera Frame Processor Plugin
```

### The pipeline, frame by frame

1. **VisionCamera** captures a camera frame (YUV format — the `<Camera>` component must have `pixelFormat="yuv"` set)
2. **`MediapipePoseFrameProcessorPlugin.kt`** receives the frame via its `callback()`, converts YUV → Bitmap, and **applies rotation correction** based on `frame.orientation` (sensor frames come in landscape; this rotates them upright — a real bug we hit and fixed, don't remove this)
3. It calls `PoseBridge.processFrame(bitmap, timestamp)`
4. **`PoseBridge`** (a Kotlin `object`, i.e. singleton) forwards the bitmap to **`PoseLandmarkerHelper`**, which wraps it as an `MPImage` and calls MediaPipe's `detectAsync()` (LIVE_STREAM mode — results come back async via a listener, not a return value)
5. When MediaPipe's result listener fires, `PoseBridge.serialize()` converts the 33 landmarks into a JSON string (`x`, `y`, `z`, `visibility` per point) and invokes a callback
6. **`MediapipePoseModule.kt`**'s `OnCreate` block registered that callback to call `sendEvent("onPoseResult", {...})` — this is what makes the data visible to JavaScript
7. On the JS side, `hooks/mediapipePlugin.ts` holds a **singleton** reference to the native module, event emitter, and the registered frame processor plugin

### Why `hooks/mediapipePlugin.ts` exists (important — do not skip this)

Early on, we had `usePoseDetection.ts` and `usePoseSetupChecks.ts` each independently calling `VisionCameraProxy.initFrameProcessorPlugin("mediapipePose", {})`. VisionCamera throws a hard runtime error if you register a plugin with the same name twice:

```
Tried to add a Frame Processor Plugin with a name that already exists!
```

**The fix**: `hooks/mediapipePlugin.ts` does the native module loading and plugin registration exactly once, at module-load time, and every hook that needs pose detection imports `plugin`, `poseEmitter`, `isNativeAvailable` from that single file instead of doing its own `requireNativeModule`/`initFrameProcessorPlugin` calls. **If you add a new hook that needs pose detection, import from `mediapipePlugin.ts` — never call `initFrameProcessorPlugin` a second time anywhere.**

### Why `requireNativeModule`, not `NativeModules`

Under React Native's New Architecture (`newArchEnabled=true` in `gradle.properties`), the old bridge-based `NativeModules.MediapipePose` from `react-native` does **not** work — it silently returns `undefined`/null with no error, which cost significant debugging time. Expo Modules under New Architecture must be accessed via:

```typescript
import { requireNativeModule, EventEmitter } from "expo-modules-core";
const nativeModule = requireNativeModule("MediapipePose");
const poseEmitter = new EventEmitter(nativeModule);
```

If you ever see landmarks silently not arriving with no errors in Logcat, check this first.

### Debugging the native side

Logcat filter that shows the whole pipeline:
```powershell
adb logcat | findstr /C:"PoseBridge" /C:"MediapipePosePlugin" /C:"MediapipePose"
```
Expected healthy output: `Module OnCreate`, `attach() called, context=true`, then repeating `Frame received: WxH` / `processFrame called, helper is null: false` pairs as the camera runs.

---

## 6. JS/TS architecture

```
hooks/
├── mediapipePlugin.ts       # singleton native module + plugin registration (see §5)
├── usePoseDetection.ts       # general-purpose landmark stream, used by workout screens
│                              # includes EMA smoothing + outlier rejection (see below)
├── usePoseSetupChecks.ts     # used by CameraCheckScreen — checklist-style setup validation
├── useExerciseEngine.ts      # wraps lib/exercise-engine's rep-counter classes per exercise
├── exerciseMapping.ts        # keyword matcher: exercise id/name -> engine type
├── exerciseFeedback.ts       # turns an EngineResult into one spoken/displayed coaching line
└── usePoseValidation.ts      # (yoga) wraps lib/pose-engine's POSE_REGISTRY checks

lib/
├── exercise-engine/           # workout rep counting + form scoring (squat, pushup, plank,
│                                lunge, deadlift) — see its own README/index.ts for the API
└── pose-engine/                # yoga pose alignment scoring (tree, warrior-1, etc.)

app/
├── exercise-selection.tsx      # pick workout exercises -> passes ids via ?exercises= param
├── CameraCheckScreen.tsx        # photo capture + setup checklist -> forwards params to /camera
├── camera.tsx                   # the main live session screen (workout OR yoga mode)
└── workout/
    ├── WorkoutCamera.tsx         # workout-mode overlay UI (reps, form, stats, coach)
    ├── YogaPoseOverlay.tsx        # yoga-mode overlay UI
    ├── PoseOverlay.tsx             # SVG skeleton drawn over the camera feed
    └── AudioCoachCard.tsx           # displays + speaks live coaching messages
```

### Landmark smoothing (`usePoseDetection.ts`)

Raw MediaPipe output is noisy — we saw real cases of a single landmark's x-coordinate jumping from 0.34 to 0.90 between consecutive frames, and values briefly going outside the valid 0–1 range. Two mitigations are in place:

1. **Confidence thresholds** raised in `PoseLandmarkerHelper.kt` from the defaults (0.5) to `0.75f`/`0.75f`/`0.7f` — makes MediaPipe report "no pose" rather than a low-confidence guess.
2. **Exponential moving average smoothing** in `usePoseDetection.ts` (`smoothLandmarks()`) — blends each new landmark 35% toward the raw value, rejects single-frame jumps larger than 0.35 (treated as misdetections), and tolerates a few consecutive "no pose" frames before clearing the skeleton (avoids flicker).

If tracking still looks unstable, the tuning knobs are `SMOOTHING_ALPHA`, `MIN_VISIBILITY_TO_UPDATE`, `MAX_JUMP_PER_FRAME` at the top of that file.

### Navigation / data flow for a workout session

```
exercise-selection.tsx
  (user picks exercise ids, e.g. ["pushups", "squats"])
        │  router.push(`/CameraCheckScreen?exercises=pushups,squats`)
        ▼
CameraCheckScreen.tsx
  (captures front/side photos, runs setup checklist)
        │  router.push(`/camera?mode=workout&exercises=pushups,squats`)
        ▼
camera.tsx
  - parses `exercises` param -> looks up each id in data/exercises.ts
  - matchExerciseType(id) -> maps to one of the engine's 5 supported types
    (unmapped exercises get unsupported=true, shown as "manual tracking")
  - useExerciseEngine(landmarks, {exercise, level}) runs the live rep counter
  - auto-advances to the next exercise once goal reps are hit
  - after the last exercise -> router.push("/achievement")
```

---

## 7. Known issues / gotchas (read before debugging something we already hit)

- **MIUI/HyperOS "MIUI optimization" blocks camera for sideloaded/dev builds.** Symptom: `system/camera-is-restricted` error even though the Camera permission shows Allowed. Fix: `Settings → Additional settings → Developer options → turn OFF "MIUI optimization"`, then reboot the phone.
- **`adb` shows device as `offline`.** Run `adb kill-server && adb start-server`, replug the USB cable, and re-approve the debugging prompt on the phone if it appears.
- **Frame processor plugin "already exists" error.** See §5 — always import from `hooks/mediapipePlugin.ts`, never call `initFrameProcessorPlugin` in a new file.
- **Gradle OOM during native build.** See §3 (page file) and §4 (single-architecture build). If it still fails, check `Available Physical Memory` via `systeminfo | findstr "Available Physical Memory"` — close Chrome/Android Studio/stray `java.exe` processes (`tasklist /fi "imagename eq java.exe"` to check for orphaned Gradle daemons; `taskkill /f /im java.exe` to clear them).
- **`expo-module.config.json` is required** for a local Expo module to autolink at all — without it, the native code compiles fine but is invisible to the JS runtime (no crash, just silently never loads).

---

## 8. What's left to build / known gaps

- **Unsupported exercises** (`wall_sit`, `jumping_jacks`, `pullups`, `mountain_climbers`, `dips`, `fullbody`, `muscle_up`) have no engine mapping — they show "Manual tracking — live count unavailable" with a manual Finish button, no rep counting, no audio coaching. Either build engines for these or design a lighter manual-tap-to-count fallback.
- **KCAL is a placeholder** (`reps * 0.5`) — needs a real formula (exercise type + duration + user weight) or removal.
- **BPM is hardcoded (`136`)** — needs a wearable/heart-rate sensor integration, or should be removed/hidden until one exists.
- **No session persistence** — finishing a workout just navigates to `/achievement`; nothing is saved (completed exercises, rep counts, streaks, history).
- **Yoga mode** (`ModeSwitcher`, `YogaPoseOverlay`, `lib/pose-engine`) is built and was working as of the last test pass, but hasn't been re-verified since the most recent smoothing/threshold changes — worth a regression check.
- **Frame size passed to the engines is the screen's view size, not the true camera sensor frame size** — fine for angle-based checks (angle math is scale-invariant) but can skew distance-ratio checks (e.g. some yoga pose checks). For pixel-perfect accuracy, have the native module emit the actual frame width/height alongside the landmarks JSON.

---

## 9. Building a release APK (for sharing with others, not Play Store)

```powershell
cd android
gradlew.bat assembleRelease -x lint -x test
```
Output: `android/app/build/outputs/apk/release/app-release.apk`. Install with `adb install -r <path>` and test with Metro **closed** to confirm it runs standalone.

---

## 10. Quick command reference

| Task | Command |
|---|---|
| Install deps | `npm install` |
| Debug build (single arch, avoids OOM) | `cd android && gradlew.bat app:assembleDebug -PreactNativeArchitectures=arm64-v8a -x lint -x test` |
| Install APK | `adb install -r android\app\build\outputs\apk\debug\app-debug.apk` |
| Start Metro | `npx expo start --dev-client` |
| Full clean native rebuild | `npx expo prebuild --platform android --clean --no-install` (then re-check gradle.properties) |
| Watch native pose pipeline logs | `adb logcat \| findstr /C:"PoseBridge" /C:"MediapipePosePlugin" /C:"MediapipePose"` |
| Release APK | `cd android && gradlew.bat assembleRelease -x lint -x test` |
