import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Speech from "expo-speech";

const SARVAM_API_KEY = "sk_94j9mw05_oFB769TblKb9OMFvWtNL9ETh";
const STT_WS_URL = "wss://api.sarvam.ai/speech-to-text/ws?language_code=en-IN&model=saaras:v3";
const TTS_WS_URL = "wss://api.sarvam.ai/text-to-speech/ws?model=bulbul:v3";

// Bypass expo-file-system type resolution issues using dynamic properties
const fsCacheDirectory = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || "";
const fsDeleteAsync = (FileSystem as any).deleteAsync;
const fsReadAsStringAsync = (FileSystem as any).readAsStringAsync;
const fsWriteAsStringAsync = (FileSystem as any).writeAsStringAsync;

export interface STTCallback {
  onTranscription: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
}

export interface TTSCallback {
  onAudioChunk: (base64Data: string) => void;
  onPlaybackComplete: () => void;
  onError: (error: string) => void;
}

/**
 * SarvamSTTClient
 * Opens a WebSocket connection to Sarvam's Saaras V3 model and handles
 * base64-encoded audio streaming.
 */
export class SarvamSTTClient {
  private ws: WebSocket | null = null;
  private callbacks: STTCallback;
  private recording: Audio.Recording | null = null;
  private isConnected = false;
  private chunkInterval: NodeJS.Timeout | null = null;

  constructor(callbacks: STTCallback) {
    this.callbacks = callbacks;
  }

  async connect() {
    try {
      // Cast the WebSocket constructor call to any to avoid TypeScript errors in react-native type definitions
      this.ws = new (WebSocket as any)(STT_WS_URL, undefined, {
        headers: {
          "api-subscription-key": SARVAM_API_KEY,
        },
      });

      if (!this.ws) return;

      this.ws.onopen = () => {
        console.log("[SarvamSTTClient] STT WebSocket connected.");
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        try {
          const res = JSON.parse(event.data);
          if (res.type === "data" && res.data?.transcript) {
            this.callbacks.onTranscription(res.data.transcript, true);
          }
        } catch (err: any) {
          console.error("[SarvamSTTClient] Error parsing STT message:", err);
        }
      };

      this.ws.onerror = (e) => {
        console.error("[SarvamSTTClient] STT WS error:", e);
        this.callbacks.onError("STT WebSocket Error");
      };

      this.ws.onclose = () => {
        console.log("[SarvamSTTClient] STT WebSocket closed.");
        this.isConnected = false;
      };
    } catch (e: any) {
      this.callbacks.onError(e.message ?? "STT Connection failed");
    }
  }

  async startStreaming() {
    try {
      // 1. Request microphone permissions
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") {
        this.callbacks.onError("Microphone permission not granted");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 2. Start audio recording in fast 1-second chunks to simulate streaming
      this.startChunkRecording();
    } catch (e: any) {
      this.callbacks.onError(e.message ?? "Failed to start streaming");
    }
  }

  private startChunkRecording() {
    const recordNextChunk = async () => {
      try {
        if (!this.isConnected) return;

        // Stop previous recording if exists and read its content
        if (this.recording) {
          const prevRec = this.recording;
          this.recording = null;
          await prevRec.stopAndUnloadAsync();
          const uri = prevRec.getURI();
          if (uri) {
            const base64 = await fsReadAsStringAsync(uri, {
              encoding: "base64",
            });
            this.sendAudioChunk(base64);
          }
        }

        // Start new 1-second recording
        const newRecording = new Audio.Recording();
        await newRecording.prepareToRecordAsync({
          android: {
            extension: ".wav",
            outputFormat: 2, // MPEG_4
            audioEncoder: 3, // AAC
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: ".wav",
            audioQuality: 127, // HIGH
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {},
        });
        await newRecording.startAsync();
        this.recording = newRecording;
      } catch (err: any) {
        console.error("[SarvamSTTClient] Error recording chunk:", err);
      }
    };

    // Run first record immediately
    recordNextChunk();
    this.chunkInterval = setInterval(recordNextChunk, 1500);
  }

  private sendAudioChunk(base64Data: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const msg = {
      audio: {
        data: base64Data,
        sample_rate: "16000",
        encoding: "audio/wav",
      },
    };
    this.ws.send(JSON.stringify(msg));
  }

  async stopStreaming() {
    if (this.chunkInterval) {
      clearInterval(this.chunkInterval);
      this.chunkInterval = null;
    }

    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch (e) {
        // Safe skip if already unloaded
      }
      this.recording = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export function detectLanguageCode(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN"; // Hindi / Marathi
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN"; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return "te-IN"; // Telugu
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN"; // Kannada
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN"; // Malayalam
  if (/[\u0980-\u09FF]/.test(text)) return "bn-IN"; // Bengali
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu-IN"; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa-IN"; // Punjabi
  if (/[\u0B00-\u0B7F]/.test(text)) return "od-IN"; // Odia
  return "en-IN"; // Default Indian English / Hinglish
}

/**
 * SarvamTTSClient
 * Connects to Bulbul V3 and streams text to generate and play back low-latency audio.
 */
export class SarvamTTSClient {
  private ws: WebSocket | null = null;
  private callbacks: TTSCallback;
  private sound: Audio.Sound | null = null;
  private audioQueue: string[] = [];
  private isPlaying = false;

  constructor(callbacks: TTSCallback) {
    this.callbacks = callbacks;
  }

  async connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      try {
        if (this.ws) {
          try {
            this.ws.close();
          } catch {}
          this.ws = null;
        }

        this.ws = new (WebSocket as any)(TTS_WS_URL, undefined, {
          headers: {
            "api-subscription-key": SARVAM_API_KEY,
          },
        });

        if (!this.ws) {
          reject(new Error("Failed to initialize WebSocket"));
          return;
        }

        let resolved = false;

        this.ws.onopen = () => {
          console.log("[SarvamTTSClient] TTS WebSocket connected.");
          const configMsg = {
            type: "config",
            data: {
              target_language_code: "en-IN",
              speaker: "anushka",
              pace: 1.05,
              temperature: 0.5,
            },
          };
          this.ws?.send(JSON.stringify(configMsg));
          resolved = true;
          resolve();
        };

        this.ws.onmessage = async (event) => {
          try {
            const res = JSON.parse(event.data);
            if (res.type === "audio" && res.data?.audio) {
              this.callbacks.onAudioChunk(res.data.audio);
              this.queueAudioPlayback(res.data.audio);
            }
          } catch (err: any) {
            console.error("[SarvamTTSClient] Error parsing TTS message:", err);
          }
        };

        this.ws.onerror = (e) => {
          console.error("[SarvamTTSClient] TTS WS error:", e);
          this.callbacks.onError("TTS WebSocket Error");
          if (!resolved) {
            resolved = true;
            reject(e);
          }
        };

        this.ws.onclose = () => {
          console.log("[SarvamTTSClient] TTS WebSocket closed.");
          if (!resolved) {
            resolved = true;
            reject(new Error("TTS WebSocket closed before connection completed"));
          }
        };
      } catch (e: any) {
        this.callbacks.onError(e.message ?? "TTS Connection failed");
        reject(e);
      }
    });
  }

  async speak(text: string, languageCode?: string) {
    if (!text || !text.trim()) return;

    await this.stop();

    const targetLang = languageCode || detectLanguageCode(text);

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (e) {
      // safe fallback
    }

    // 1. Try Sarvam REST TTS API (supports HTTP headers in React Native)
    try {
      console.log(`[SarvamTTSClient] Requesting Sarvam REST TTS API (${targetLang})...`);
      const res = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "api-subscription-key": SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: targetLang,
          speaker: "meera",
          pitch: 0,
          pace: 1.0,
          loudness: 1.5,
          speech_sample_rate: 16000,
          enable_preprocessing: true,
          model: "bulbul:v1",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const base64Audio = data.audios?.[0];

        if (base64Audio) {
          console.log("[SarvamTTSClient] Playing Sarvam TTS audio response...");
          const tempUri = `${fsCacheDirectory}tts_${Date.now()}.wav`;
          await fsWriteAsStringAsync(tempUri, base64Audio, {
            encoding: "base64",
          });

          const { sound } = await Audio.Sound.createAsync(
            { uri: tempUri },
            { shouldPlay: true }
          );

          this.sound = sound;
          this.callbacks.onAudioChunk(base64Audio);

          sound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.isLoaded && status.didJustFinish) {
              await sound.unloadAsync();
              await fsDeleteAsync(tempUri, { idempotent: true });
              this.callbacks.onPlaybackComplete();
            }
          });

          return;
        }
      } else {
        const errorBody = await res.text();
        console.warn(`[SarvamTTSClient] Sarvam REST API HTTP error ${res.status}:`, errorBody);
      }
    } catch (err: any) {
      console.warn("[SarvamTTSClient] Sarvam REST API call failed:", err);
    }

    // 2. Fallback to native expo-speech engine
    console.log(`[SarvamTTSClient] Playing TTS using device Speech fallback (${targetLang})...`);
    this.callbacks.onAudioChunk("fallback");
    Speech.stop();
    Speech.speak(text, {
      language: targetLang,
      rate: 1.0,
      onDone: () => this.callbacks.onPlaybackComplete(),
      onError: (err) => {
        console.error("[SarvamTTSClient] expo-speech error:", err);
        this.callbacks.onPlaybackComplete();
      },
    });
  }

  private async queueAudioPlayback(base64Chunk: string) {
    this.audioQueue.push(base64Chunk);
    if (!this.isPlaying) {
      this.playNextChunk();
    }
  }

  private async playNextChunk() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.callbacks.onPlaybackComplete();
      return;
    }

    this.isPlaying = true;
    const chunk = this.audioQueue.shift();
    if (!chunk) return;

    try {
      // Write base64 audio to a temporary file
      const tempUri = `${fsCacheDirectory}tts_chunk_${Date.now()}.wav`;
      await fsWriteAsStringAsync(tempUri, chunk, {
        encoding: "base64",
      });

      // Initialize Sound and play
      const { sound } = await Audio.Sound.createAsync(
        { uri: tempUri },
        { shouldPlay: true }
      );

      this.sound = sound;

      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
          // Clean up temp file
          await fsDeleteAsync(tempUri, { idempotent: true });
          this.playNextChunk();
        }
      });
    } catch (err: any) {
      console.error("[SarvamTTSClient] Error playing audio chunk:", err);
      this.playNextChunk(); // Skip chunk on error
    }
  }

  async stop() {
    this.audioQueue = [];
    this.isPlaying = false;

    Speech.stop();

    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (e) {
        // Safe skip
      }
      this.sound = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
  }
}
