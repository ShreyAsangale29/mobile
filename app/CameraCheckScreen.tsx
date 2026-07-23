// CameraCheckScreen.tsx
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import AccuracyBanner from "@/components/camera-check/AccuracyBanner";
import CameraBackground from "@/components/camera-check/CameraBackground";
import CameraHeader from "@/components/camera-check/CameraHeader";
import QuickTips from "@/components/camera-check/QuickTips";
import SetupChecklist from "@/components/camera-check/SetupChecklist";
import StartSessionButton from "@/components/camera-check/StartSessionButton";
import { usePoseSetupChecks } from "@/hooks/usePoseSetupChecks";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  useCameraPermission,
} from "react-native-vision-camera";

import { saveSessionUserProfileFromLandmarks } from "../lib/exercise-engine/authenticity";

const AUTO_CAPTURE_HOLD_MS = 1500;

export default function CameraCheckScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ poses?: string; exercises?: string }>();

  const isYogaFlow = !!params.poses;

  // Routes through WorkoutPreviewScreen (shows selected poses/exercises with
  // photos, info, and steps) before landing on the live session camera,
  // rather than jumping straight to /camera.
  const destination = isYogaFlow
    ? `/WorkoutPreviewScreen?mode=yoga&poses=${encodeURIComponent(params.poses!)}`
    : params.exercises
      ? `/WorkoutPreviewScreen?mode=workout&exercises=${encodeURIComponent(params.exercises)}`
      : "/camera";

  const [captureStage, setCaptureStage] = useState<"front" | "side">("front");

  const {
    hasPermission,
    requestPermission,
  } = useCameraPermission();

  const cameraRef = useRef<Camera>(null);

  const progressFolder = useMemo(
    () => new Directory(Paths.document, "progressPhotos"),
    []
  );

  const [frontPhoto, setFrontPhoto] = useState<string | null>(null);
  const [sidePhoto, setSidePhoto] = useState<string | null>(null);

  const {
    checks,
    accuracy,
    landmarks,
    frameProcessor,
    cameraDevice,
  } = usePoseSetupChecks(captureStage);

  const isReady = Object.values(checks).every(Boolean);

  const currentPhoto = captureStage === "front" ? frontPhoto : sidePhoto;

  useEffect(() => {
    if (!progressFolder.exists) {
      progressFolder.create();
    }
  }, [progressFolder]);

  useEffect(() => {
    const createFolder = async () => {
      if (!progressFolder.exists) {
        await progressFolder.create();
      }
    };

    createFolder();
  }, [progressFolder]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const validateAndSaveFrontUserProfile = async (): Promise<boolean> => {
    if (!landmarks || landmarks.length === 0) {
      Alert.alert(
        "Full body not detected",
        "Please stand 2–3 meters away from the camera and keep your full body visible from head to toe."
      );
      return false;
    }

    const saveResult = await saveSessionUserProfileFromLandmarks(landmarks);

    if (!saveResult.success) {
      Alert.alert("User verification failed", saveResult.message);
      return false;
    }

    return true;
  };

  const capturePhoto = async () => {
    try {
      if (captureStage === "front") {
        const isUserProfileSaved = await validateAndSaveFrontUserProfile();

        if (!isUserProfileSaved) {
          return;
        }
      }

      const photo = await cameraRef.current?.takePhoto({
        flash: "off",
      });

      if (!photo) return;

      const fileName =
        captureStage === "front"
          ? `front_${Date.now()}.jpg`
          : `side_${Date.now()}.jpg`;

      const destinationFile = new File(progressFolder, fileName);

      console.log("Captured photo:", photo);
      console.log("Target file:", destinationFile.uri);

      if (captureStage === "front") {
        setFrontPhoto(photo.path ? `file://${photo.path}` : destinationFile.uri);

        setTimeout(() => {
          setCaptureStage("side");
        }, 1000);
      } else {
        setSidePhoto(photo.path ? `file://${photo.path}` : destinationFile.uri);
      }
    } catch (e) {
      console.log(e);
      Alert.alert(
        "Capture failed",
        "Unable to capture the photo. Please try again."
      );
    }
  };

  const readyStartRef = useRef<number | null>(null);
  const isCapturingRef = useRef(false);

  useEffect(() => {
    if (!isReady || currentPhoto || isCapturingRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      isCapturingRef.current = true;
      capturePhoto().finally(() => {
        isCapturingRef.current = false;
      });
    }, AUTO_CAPTURE_HOLD_MS);

    return () => clearTimeout(timer);
  }, [isReady, currentPhoto, captureStage]);

  if (hasPermission === null || hasPermission === undefined) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={[styles.centeredContainer, { padding: 24 }]}>
        <Text style={styles.permissionText}>
          Camera permission is required to continue
        </Text>

        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <CameraBackground />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CameraHeader />

          <View style={styles.hero}>
            <Text style={styles.heading}>
              {captureStage === "front"
                ? "Capture Full Body Front Photo"
                : "Capture Side Photo"}
            </Text>

            <Text style={styles.subHeading}>
              {captureStage === "front"
                ? "Stand 2–3 meters away from the camera.\nYour full body must be visible from head to toe.\nFace the camera directly.\nThis photo will verify that the same person performs the workout."
                : "Turn sideways.\nKeep your entire body visible.\nStand naturally."}
            </Text>

            <Text style={styles.subHeading}>
              Position yourself so AI can track your posture accurately in real time.
            </Text>

            <Text
              style={[
                styles.statusText,
                isReady && !currentPhoto && styles.statusTextReady,
              ]}
            >
              {currentPhoto
                ? "Captured ✓"
                : isReady
                  ? "Great position! Hold still — capturing automatically..."
                  : "Position your full body in frame to auto-capture"}
            </Text>

            <Text style={styles.stepText}>
              {captureStage === "front" ? "Step 1 of 2" : "Step 2 of 2"}
            </Text>

            <View style={{ marginTop: 24 }}>
              {currentPhoto ? (
                <Image
                  source={{ uri: currentPhoto }}
                  style={styles.cameraPreview}
                  resizeMode="cover"
                />
              ) : cameraDevice ? (
                <Camera
                  ref={cameraRef}
                  style={styles.cameraPreview}
                  device={cameraDevice as any}
                  isActive
                  photo
                  pixelFormat="yuv"
                  frameProcessor={frameProcessor as any}
                />
              ) : (
                <View style={styles.cameraLoadingBox}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
              )}

              <TouchableOpacity
                style={styles.captureButton}
                onPress={capturePhoto}
              >
                <Text style={styles.captureButtonText}>
                  {captureStage === "front"
                    ? "Capture Front Photo Manually"
                    : "Capture Side Photo Manually"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <AccuracyBanner accuracy={accuracy} />

          <SetupChecklist checks={checks} />

          <QuickTips />

          <StartSessionButton
            enabled={!!frontPhoto && !!sidePhoto}
            onPress={() => {
              router.push(destination);
            }}
          />

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Skip camera check?",
                "Skipping setup will disable before-workout user matching for this session.",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Skip",
                    style: "destructive",
                    onPress: () => router.push(destination),
                  },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip camera check</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B081A",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B081A",
  },
  permissionText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 80,
    flexGrow: 1,
  },
  hero: {
    marginTop: 12,
    marginBottom: 14,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 32,
  },
  subHeading: {
    color: "#D7CFE2",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  statusText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  statusTextReady: {
    color: "#22C55E",
  },
  stepText: {
    color: "#8B5CF6",
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 12,
  },
  cameraPreview: {
    width: "100%",
    height: 420,
    borderRadius: 20,
  },
  cameraLoadingBox: {
    width: "100%",
    height: 420,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F1A2D",
  },
  skipText: {
    textAlign: "center",
    color: "#6B6490",
    fontSize: 12,
    marginTop: 12,
  },
  captureButton: {
    backgroundColor: "#8B5CF6",
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  captureButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});