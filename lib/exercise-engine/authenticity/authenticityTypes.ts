export type Landmark = {
    x: number;
    y: number;
    z?: number;
    visibility?: number;
};

export type PoseFrame = {
    landmarks: Landmark[];
    timestamp: number;
    poseCount?: number;
};

export type AuthenticityStatus =
    | "LIVE_USER"
    | "STATIC_IMAGE_SUSPECTED"
    | "NO_POSE"
    | "PARTIAL_POSE"
    | "LOW_CONFIDENCE"
    | "MULTIPLE_PERSONS"
    | "CAMERA_OBSTRUCTED"
    | "WARMING_UP"
    | "DIFFERENT_USER_SUSPECTED";

export type AuthenticityResult = {
    status: AuthenticityStatus;
    isValidUser: boolean;
    isLive: boolean;
    confidence: number;
    reason: string;
    feedbackMessage: string;
    motionScore: number;
    visibleLandmarkCount: number;
};