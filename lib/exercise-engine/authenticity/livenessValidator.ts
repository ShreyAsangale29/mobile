import {
    AuthenticityResult,
    Landmark,
    PoseFrame,
} from "./authenticityTypes";

type LivenessConfig = {
    minVisibleLandmarks: number;
    minVisibility: number;
    minMotionScore: number;
    staticFrameLimit: number;
    warmupFrames: number;
};

const DEFAULT_CONFIG: LivenessConfig = {
    minVisibleLandmarks: 12,
    minVisibility: 0.45,
    minMotionScore: 0.004,
    staticFrameLimit: 35,
    warmupFrames: 10,
};

const IMPORTANT_LANDMARKS = [
    0, // nose
    11, 12, // shoulders
    13, 14, // elbows
    15, 16, // wrists
    23, 24, // hips
    25, 26, // knees
    27, 28, // ankles
];

export class LivenessValidator {
    private previousFrame: PoseFrame | null = null;
    private staticFrameCount = 0;
    private totalFrames = 0;
    private config: LivenessConfig;

    constructor(config?: Partial<LivenessConfig>) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
        };
    }

    reset() {
        this.previousFrame = null;
        this.staticFrameCount = 0;
        this.totalFrames = 0;
    }

    validate(currentFrame: PoseFrame | null): AuthenticityResult {
        this.totalFrames += 1;

        if (!currentFrame || !currentFrame.landmarks || currentFrame.landmarks.length === 0) {
            return this.createResult(
                "NO_POSE",
                false,
                false,
                0,
                "No body pose detected.",
                "Please stand fully visible in front of the camera.",
                0,
                0
            );
        }

        if (currentFrame.poseCount && currentFrame.poseCount > 1) {
            return this.createResult(
                "MULTIPLE_PERSONS",
                false,
                false,
                0.3,
                "Multiple people detected in the camera frame.",
                "Only one person should be visible during the workout.",
                0,
                this.countVisibleLandmarks(currentFrame.landmarks)
            );
        }

        const visibleLandmarkCount = this.countVisibleLandmarks(currentFrame.landmarks);

        if (visibleLandmarkCount < this.config.minVisibleLandmarks) {
            return this.createResult(
                "PARTIAL_POSE",
                false,
                false,
                0.35,
                "Only partial body landmarks are visible.",
                "Please move back and keep your full body visible.",
                0,
                visibleLandmarkCount
            );
        }

        const averageConfidence = this.calculateAverageConfidence(currentFrame.landmarks);

        if (averageConfidence < this.config.minVisibility) {
            return this.createResult(
                "LOW_CONFIDENCE",
                false,
                false,
                averageConfidence,
                "Pose confidence is too low.",
                "Please improve lighting and face the camera clearly.",
                0,
                visibleLandmarkCount
            );
        }

        if (!this.previousFrame) {
            this.previousFrame = currentFrame;

            return this.createResult(
                "WARMING_UP",
                false,
                false,
                averageConfidence,
                "Collecting initial movement frames.",
                "Start moving naturally so I can verify you.",
                0,
                visibleLandmarkCount
            );
        }

        const motionScore = this.calculateMotionScore(
            this.previousFrame.landmarks,
            currentFrame.landmarks
        );

        this.previousFrame = currentFrame;

        if (this.totalFrames <= this.config.warmupFrames) {
            return this.createResult(
                "WARMING_UP",
                false,
                false,
                averageConfidence,
                "Warming up liveness validation.",
                "Keep your body visible and move naturally.",
                motionScore,
                visibleLandmarkCount
            );
        }

        if (motionScore < this.config.minMotionScore) {
            this.staticFrameCount += 1;
        } else {
            this.staticFrameCount = 0;
        }

        if (this.staticFrameCount >= this.config.staticFrameLimit) {
            return this.createResult(
                "STATIC_IMAGE_SUSPECTED",
                false,
                false,
                averageConfidence,
                "Very low movement detected for many frames. Static image or screenshot may be used.",
                "Please move naturally. Static photos will not be counted.",
                motionScore,
                visibleLandmarkCount
            );
        }

        return this.createResult(
            "LIVE_USER",
            true,
            true,
            averageConfidence,
            "Live user movement verified.",
            "User verified. Continue your workout.",
            motionScore,
            visibleLandmarkCount
        );
    }

    private countVisibleLandmarks(landmarks: Landmark[]): number {
        return landmarks.filter((lm) => {
            return lm && typeof lm.x === "number" && typeof lm.y === "number" &&
                (lm.visibility === undefined || lm.visibility >= this.config.minVisibility);
        }).length;
    }

    private calculateAverageConfidence(landmarks: Landmark[]): number {
        const validLandmarks = landmarks.filter((lm) => lm.visibility !== undefined);

        if (validLandmarks.length === 0) {
            return 0.7;
        }

        const total = validLandmarks.reduce((sum, lm) => {
            return sum + (lm.visibility || 0);
        }, 0);

        return total / validLandmarks.length;
    }

    private calculateMotionScore(previous: Landmark[], current: Landmark[]): number {
        let totalMovement = 0;
        let validPairs = 0;

        for (const index of IMPORTANT_LANDMARKS) {
            const prev = previous[index];
            const curr = current[index];

            if (!prev || !curr) continue;

            const prevVisible = prev.visibility === undefined || prev.visibility >= this.config.minVisibility;
            const currVisible = curr.visibility === undefined || curr.visibility >= this.config.minVisibility;

            if (!prevVisible || !currVisible) continue;

            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            const dz = (curr.z || 0) - (prev.z || 0);

            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            totalMovement += distance;
            validPairs += 1;
        }

        if (validPairs === 0) {
            return 0;
        }

        return totalMovement / validPairs;
    }

    private createResult(
        status: AuthenticityResult["status"],
        isValidUser: boolean,
        isLive: boolean,
        confidence: number,
        reason: string,
        feedbackMessage: string,
        motionScore: number,
        visibleLandmarkCount: number
    ): AuthenticityResult {
        return {
            status,
            isValidUser,
            isLive,
            confidence,
            reason,
            feedbackMessage,
            motionScore,
            visibleLandmarkCount,
        };
    }
}
