import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { motivationalMessages } from "../../data/motivationalMessages";
import { SarvamTTSClient } from "../../utils/sarvamSpeech";

type Props = {
  liveMessage?: string | null;
  autoSpeakCooldownSeconds?: number;
};

export default function AudioCoachCard({
  liveMessage,
  autoSpeakCooldownSeconds = 4,
}: Props) {
  const [message, setMessage] = useState(motivationalMessages[0]);

  const lastSpokenRef = useRef<string | null>(null);
  const lastSpokenAtRef = useRef<number>(0);
  const ttsClientRef = useRef<SarvamTTSClient | null>(null);

  if (!ttsClientRef.current) {
    ttsClientRef.current = new SarvamTTSClient({
      onAudioChunk: () => {},
      onPlaybackComplete: () => {},
      onError: (err) => console.warn("[AudioCoachCard] TTS error:", err),
    });
  }

  // Configure audio session mode for live camera workout
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});

    return () => {
      ttsClientRef.current?.stop();
      Speech.stop();
    };
  }, []);

  // Fallback: cycle random motivational messages when no live message
  useEffect(() => {
    if (liveMessage) return;

    const interval = setInterval(() => {
      const random =
        motivationalMessages[
          Math.floor(Math.random() * motivationalMessages.length)
        ];
      setMessage(random);
    }, 6000);

    return () => clearInterval(interval);
  }, [liveMessage]);

  // Speak live coaching message or fallback message
  useEffect(() => {
    const textToSpeak = liveMessage || message;
    if (!textToSpeak) return;

    const now = Date.now();
    const sinceLast = (now - lastSpokenAtRef.current) / 1000;
    const isRepMessage = textToSpeak.toLowerCase().includes("rep");

    if (textToSpeak === lastSpokenRef.current && !isRepMessage) return;
    if (!isRepMessage && sinceLast < autoSpeakCooldownSeconds) return;

    lastSpokenRef.current = textToSpeak;
    lastSpokenAtRef.current = now;

    ttsClientRef.current?.speak(textToSpeak).catch(() => {
      Speech.stop();
      Speech.speak(textToSpeak);
    });
  }, [liveMessage, message, autoSpeakCooldownSeconds]);

  const displayedMessage = liveMessage ?? message;

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/avatar.png")}
        style={styles.avatar}
      />

      <View style={styles.messageContainer}>
        <Text style={styles.title}>AI Coach</Text>
        <Text style={styles.message} numberOfLines={2}>
          {displayedMessage}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 130,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "rgba(0,0,0,0.75)",

    padding: 12,
    borderRadius: 20,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  messageContainer: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  message: {
    color: "#CCCCCC",
    fontSize: 13,
    marginTop: 3,
  },
});