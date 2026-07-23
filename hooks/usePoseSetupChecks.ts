import { useEffect, useRef, useState, useCallback } from "react";
import { useCameraDevice, useFrameProcessor } from "react-native-vision-camera";
import { plugin, poseEmitter, isNativeAvailable } from "./mediapipePlugin";
import {
  Landmark,
  deriveChecks,
  computeAccuracy,
  SetupChecks,
} from "../utils/poseAnalysis";


const JITTER_WINDOW = 6;
const EMPTY_CHECKS: SetupChecks = {
  faceVisible: false,
  bodyVisible: false,
  goodLighting: false,
  stablePosition: false,
  properDistance: false,
  postureDetected: false,
};

export interface UsePoseSetupChecksResult {
  checks: SetupChecks;
  accuracy: number;
  landmarks: Landmark[] | null;
  isNativeAvailable: boolean;
  frameProcessor: unknown;
  cameraDevice: unknown;
  cameraViewLayoutChangeHandler: unknown;
}

export function usePoseSetupChecks(stage: "front" | "side" = "front"): UsePoseSetupChecksResult {
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [checks, setChecks] = useState<SetupChecks>(EMPTY_CHECKS);
  const [accuracy, setAccuracy] = useState(0);

  const noseHistory = useRef<{ x: number; y: number }[]>([]);

  const handleResults = useCallback((pose: Landmark[] | null) => {
    if (!pose || pose.length === 0) {
      setLandmarks(null);
      setChecks(EMPTY_CHECKS);
      setAccuracy(0);
      return;
    }

    setLandmarks(pose);

    const nose = pose[0];
    if (nose) {
      noseHistory.current.push({ x: nose.x, y: nose.y });
      if (noseHistory.current.length > JITTER_WINDOW) {
        noseHistory.current.shift();
      }
    }
    let jitter = 0;
    if (noseHistory.current.length > 1) {
      let total = 0;
      for (let i = 1; i < noseHistory.current.length; i++) {
        const a = noseHistory.current[i - 1];
        const b = noseHistory.current[i];
        total += Math.hypot(b.x - a.x, b.y - a.y);
      }
      jitter = total / (noseHistory.current.length - 1);
    }

    const nextChecks = deriveChecks(pose, jitter, undefined, stage);
    setChecks(nextChecks);
    setAccuracy(computeAccuracy(nextChecks));
  }, [stage]);

  // Listen for landmark events emitted from the native MediapipePose module
  useEffect(() => {
    if (!poseEmitter) return;
    const sub = poseEmitter.addListener("onPoseResult", (event: { landmarks: string; }) => {
      try {
        const parsed: Landmark[] = JSON.parse(event.landmarks);
        handleResults(parsed);
      } catch (e) {
        console.warn("[usePoseSetupChecks] Failed to parse landmarks:", e);
      }
    });
    const errSub = poseEmitter.addListener("onPoseError", (event: any) => {
      console.warn("[usePoseSetupChecks] MediaPipe error:", event);
    });
    return () => {
      sub.remove();
      errSub.remove();
    };
  }, [handleResults]);

  const cameraDevice = useCameraDevice("front");

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
    if (plugin) {
      plugin.call(frame);
    }
  }, []);

  // Fallback: simulate a "ready" state only if the native module isn't built yet
  useEffect(() => {
    if (isNativeAvailable) return;
    const timer = setTimeout(() => {
      const simulated: SetupChecks = {
        faceVisible: true,
        bodyVisible: true,
        goodLighting: true,
        stablePosition: true,
        properDistance: true,
        postureDetected: true,
      };
      setChecks(simulated);
      setAccuracy(computeAccuracy(simulated));
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  return {
    checks,
    accuracy,
    landmarks,
    isNativeAvailable,
    frameProcessor: isNativeAvailable ? frameProcessor : null,
    cameraDevice,
    cameraViewLayoutChangeHandler: null,
  };
}