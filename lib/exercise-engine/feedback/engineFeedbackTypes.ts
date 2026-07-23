export interface EngineFeedback {
  code: string;
  message: string;
  voiceMessage: string;
  severity: "info" | "warning" | "error" | "success";
  category: "CAMERA" | "AUTHENTICITY" | "POSTURE" | "REP_COUNT" | "SESSION" | "FORM";
  shouldSpeak: boolean;
}

export interface FeedbackInput {
  mode: "squat" | "pushup" | "plank" | "lunge" | "deadlift";
  postureScore?: number;
  repCount?: number;
  validRepCount?: number;
  invalidRepCount?: number;
  feedbackCode?: string;
  feedback?: string;
  canCountRep?: boolean;
  authenticity?: {
    status: string;
    isValidUser: boolean;
    isLive: boolean;
    confidence: number;
    reason: string;
    feedbackMessage: string;
    motionScore: number;
    visibleLandmarkCount: number;
  };
}