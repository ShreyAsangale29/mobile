import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useUIStore } from "../src/state/uiStore";
import CoachAvatar from "@/components/Avatar/CoachAvatar";
import {
  SarvamSTTClient,
  SarvamTTSClient,
} from "../utils/sarvamSpeech";
import { Team3RoutingClient, WorkoutContext } from "../utils/team3Routing";

export default function AICoachScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    exercise?: string;
    reps?: string;
    postureScore?: string;
    errors?: string;
    stage?: string;
  }>();

  // Phase 1: Intercept workout context passed from camera session
  const workoutContext: WorkoutContext = {
    exercise: params.exercise ?? "squat",
    reps: params.reps ? parseInt(params.reps, 10) : 0,
    postureScore: params.postureScore ? parseInt(params.postureScore, 10) : 100,
    errors: params.errors ? params.errors.split(",").filter(Boolean) : [],
    stage: params.stage ?? "active",
  };

  const { state: uiState, setAICoachMessage, setAICoachAction } = useUIStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);

  const sttClientRef = useRef<SarvamSTTClient | null>(null);
  const ttsClientRef = useRef<SarvamTTSClient | null>(null);
  const routingClientRef = useRef<Team3RoutingClient>(new Team3RoutingClient());

  // Initialize clients on mount
  useEffect(() => {
    sttClientRef.current = new SarvamSTTClient({
      onTranscription: (text, isFinal) => {
        if (text) {
          setTranscription(text);
        }
      },
      onError: (err) => {
        console.error("STT Error:", err);
        setSttError(err);
        setIsRecording(false);
      },
    });

    ttsClientRef.current = new SarvamTTSClient({
      onAudioChunk: () => {
        setTtsPlaying(true);
      },
      onPlaybackComplete: () => {
        setTtsPlaying(false);
      },
      onError: (err) => {
        console.error("TTS Error:", err);
        setTtsPlaying(false);
      },
    });

    // Speak initial greeting based on workout state
    const speakInitialMessage = async () => {
      try {
        const initialText = `I see you have completed ${workoutContext.reps} reps of ${workoutContext.exercise}. ${
          workoutContext.errors.length > 0
            ? `Let's focus on: ${workoutContext.errors.join(", ")}.`
            : "Your form looks solid. Keep it up! What can I help you with?"
        }`;
        setAICoachMessage(initialText);
        await ttsClientRef.current?.speak(initialText);
      } catch (err) {
        console.error("TTS initial greeting failed:", err);
      }
    };

    speakInitialMessage();

    return () => {
      sttClientRef.current?.stopStreaming();
      ttsClientRef.current?.stop();
    };
  }, []);

  const handleMicPress = async () => {
    if (isRecording) {
      // Phase 2: Stop STT Streaming & finalize transcription
      setIsRecording(false);
      setIsProcessing(true);
      await sttClientRef.current?.stopStreaming();

      // Give a tiny timeout for final transcripts to arrive
      setTimeout(async () => {
        const queryText = transcription || "How is my posture?";
        console.log("[AICoach] User Query:", queryText);

        try {
          // Phase 3: Route user text + workout context to Team 3 engine
          const response = await routingClientRef.current.sendQuery(
            queryText,
            workoutContext
          );

          // Update Zustand store with Team 3 outputs
          setAICoachMessage(response.conversationalText);
          
          if (response.actionableJson) {
            setAICoachAction(response.actionableJson.action);
          } else {
            setAICoachAction(null);
          }

          // Phase 4: Stream text chunk to Bulbul TTS WebSocket for playback
          await ttsClientRef.current?.speak(response.conversationalText);
        } catch (err) {
          console.error("Failed routing Team 3 engine:", err);
        } finally {
          setIsProcessing(false);
        }
      }, 500);
    } else {
      // Start recording & streaming
      setTranscription("");
      setSttError(null);
      setIsRecording(true);
      await ttsClientRef.current?.stop(); // stop any current speech
      await sttClientRef.current?.connect();
      await sttClientRef.current?.startStreaming();
    }
  };

  // Derive form correctness for avatar outline glows
  const formOk = uiState.aiCoachAction === "glow_amber" ? false : true;

  return (
    <LinearGradient colors={["#0D0B21", "#1E133A", "#0D0B21"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Voice Coach</Text>
          <View style={{ width: 40 }} /> {/* Spacer */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Workout Context Panel */}
          <BlurView intensity={35} style={styles.contextPanel}>
            <View style={styles.contextHeader}>
              <Ionicons name="fitness-outline" size={20} color="#8B5CF6" />
              <Text style={styles.contextTitle}>Active Session Context</Text>
            </View>
            <View style={styles.contextGrid}>
              <View style={styles.contextItem}>
                <Text style={styles.contextLabel}>EXERCISE</Text>
                <Text style={styles.contextValue}>{workoutContext.exercise.toUpperCase()}</Text>
              </View>
              <View style={styles.contextItem}>
                <Text style={styles.contextLabel}>REPS</Text>
                <Text style={styles.contextValue}>{workoutContext.reps}</Text>
              </View>
              <View style={styles.contextItem}>
                <Text style={styles.contextLabel}>FORM SCORE</Text>
                <Text style={[styles.contextValue, { color: formOk ? "#34D399" : "#FBBF24" }]}>
                  {workoutContext.postureScore}%
                </Text>
              </View>
            </View>
            {workoutContext.errors.length > 0 && (
              <View style={styles.errorsContainer}>
                <Text style={styles.errorLabel}>Detected Issues:</Text>
                <Text style={styles.errorText}>{workoutContext.errors.join(", ")}</Text>
              </View>
            )}
          </BlurView>

          {/* 3D Coach Avatar Rendering Box */}
          <View style={styles.avatarContainer}>
            <CoachAvatar
              phase="active"
              mode="workout"
              exerciseType={workoutContext.exercise}
              formOk={formOk}
              style={styles.inlineAvatar}
            />
            {!!uiState.aiCoachAction && (
              <BlurView intensity={30} style={styles.actionOverlay}>
                <Text style={styles.actionText}>
                  🎯 COACH ACTION: {uiState.aiCoachAction.toUpperCase()}
                </Text>
              </BlurView>
            )}
          </View>

          {/* Conversation Bubble */}
          <View style={styles.bubbleContainer}>
            {!!uiState.aiCoachMessage && (
              <BlurView intensity={30} style={styles.coachBubble}>
                <Text style={styles.bubbleTitle}>Coach Anushka</Text>
                <Text style={styles.coachText}>{uiState.aiCoachMessage}</Text>
                {ttsPlaying && (
                  <View style={styles.audioWaveContainer}>
                    <ActivityIndicator size="small" color="#5EEAD4" />
                    <Text style={styles.audioWaveText}>Streaming Bulbul V3 Audio...</Text>
                  </View>
                )}
              </BlurView>
            )}

            {!!transcription && (
              <View style={styles.userBubble}>
                <Text style={styles.bubbleTitleUser}>You</Text>
                <Text style={styles.userText}>{transcription}</Text>
              </View>
            )}

            {isProcessing && (
              <View style={styles.processingIndicator}>
                <ActivityIndicator size="small" color="#8B5CF6" />
                <Text style={styles.processingText}>Routing query to Team 3 AI...</Text>
              </View>
            )}

            {!!sttError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>⚠️ {sttError}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Microphone Panel */}
        <BlurView intensity={40} style={styles.micPanel}>
          <Text style={styles.micInstruction}>
            {isRecording ? "Listening... Tap mic again to send query" : "Tap microphone to speak to your Coach"}
          </Text>

          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording ? styles.micButtonRecording : null,
            ]}
            onPress={handleMicPress}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={32}
              color="#FFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.resumeButtonText}>Resume Workout</Text>
          </TouchableOpacity>
        </BlurView>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 150,
  },
  contextPanel: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 20,
    overflow: "hidden",
  },
  contextHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contextTitle: {
    color: "#D7CFE2",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  contextGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contextItem: {
    flex: 1,
    alignItems: "center",
  },
  contextLabel: {
    color: "#6B6490",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  contextValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  errorsContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  errorLabel: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  errorText: {
    color: "#D1D5DB",
    fontSize: 12,
  },
  avatarContainer: {
    height: 250,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  inlineAvatar: {
    position: "relative",
    top: 0,
    right: 0,
    width: "100%",
    height: "100%",
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  actionOverlay: {
    position: "absolute",
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.4)",
    overflow: "hidden",
  },
  actionText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  bubbleContainer: {
    marginBottom: 20,
  },
  coachBubble: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    marginBottom: 14,
    overflow: "hidden",
  },
  bubbleTitle: {
    color: "#A78BFA",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
  },
  coachText: {
    color: "#FFF",
    fontSize: 15,
    lineHeight: 22,
  },
  audioWaveContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  audioWaveText: {
    color: "#5EEAD4",
    fontSize: 11,
    marginLeft: 6,
    fontWeight: "600",
  },
  userBubble: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignSelf: "flex-end",
    maxWidth: "85%",
    marginBottom: 14,
  },
  bubbleTitleUser: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "right",
  },
  userText: {
    color: "#FFF",
    fontSize: 15,
    lineHeight: 22,
  },
  processingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  processingText: {
    color: "#8B5CF6",
    fontSize: 13,
    marginLeft: 8,
    fontWeight: "500",
  },
  errorBox: {
    padding: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 14,
    marginTop: 10,
  },
  errorBoxText: {
    color: "#FCA5A5",
    fontSize: 13,
  },
  micPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "rgba(13, 11, 33, 0.8)",
    borderTopWidth: 1.5,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  micInstruction: {
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    // shadow
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  micButtonRecording: {
    backgroundColor: "#EF4444",
    transform: [{ scale: 1.05 }],
  },
  resumeButton: {
    marginTop: 16,
  },
  resumeButtonText: {
    color: "#6B6490",
    fontSize: 14,
    fontWeight: "600",
  },
});
