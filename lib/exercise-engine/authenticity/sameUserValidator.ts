import {
    Landmark,
    PoseFrame,
} from "./authenticityTypes";

// ─── Landmark indices (MediaPipe Pose) ───────────────────────────────
const NOSE = 0;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;
const LEFT_ANKLE = 27;
const RIGHT_ANKLE = 28;

// ─── Types ───────────────────────────────────────────────────────────

/** Normalised body proportions (scale-invariant ratios relative to bodyHeight). */
export type SameUserProportions = {
    shoulderWidthRatio: number;   // shoulder width / body height
    hipWidthRatio: number;        // hip width / body height
    torsoHeightRatio: number;     // torso height / body height
    leftRightSymmetry: number;    // left shoulder→hip / right shoulder→hip
};

export type SameUserStatus =
    | "SAME_USER"
    | "DIFFERENT_USER_SUSPECTED"
    | "NO_REFERENCE";

export type SameUserResult = {
    status: SameUserStatus;
    isSameUser: boolean;
    confidence: number;
    reason: string;
    feedbackMessage: string;
    deviations: Record<string, number>;
};

// ─── Configuration ───────────────────────────────────────────────────

export type SameUserConfig = {
    /** Max allowed relative deviation per ratio before flagging. */
    shoulderTolerance: number;
    hipTolerance: number;
    torsoTolerance: number;
    symmetryTolerance: number;
    /** How many consecutive "different" frames before we flag. */
    consecutiveFrameThreshold: number;
    /** Minimum landmark visibility to consider a landmark valid. */
    minVisibility: number;
};

const DEFAULT_CONFIG: SameUserConfig = {
    shoulderTolerance: 0.25,
    hipTolerance: 0.25,
    torsoTolerance: 0.20,
    symmetryTolerance: 0.30,
    consecutiveFrameThreshold: 3,
    minVisibility: 0.4,
};

// ─── Helpers ─────────────────────────────────────────────────────────

function dist(a: Landmark, b: Landmark): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function midpoint(a: Landmark, b: Landmark): Landmark {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
    };
}

function isLandmarkVisible(lm: Landmark | undefined, minVis: number): boolean {
    if (!lm) return false;
    return (lm.visibility ?? 1) >= minVis;
}

// ─── Validator ───────────────────────────────────────────────────────

export class SameUserValidator {
    private referenceSignature: SameUserProportions | null = null;
    private consecutiveMismatchCount = 0;
    private config: SameUserConfig;

    constructor(config?: Partial<SameUserConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    // ── Public API ───────────────────────────────────────────────────

    /**
     * Enrol the reference body signature from the daily-progress photo
     * landmarks.  Call this once when the user finishes the camera check.
     */
    enrollReference(landmarks: Landmark[]): boolean {
        const sig = this.extractSignature(landmarks);
        if (!sig) return false;
        this.referenceSignature = sig;
        this.consecutiveMismatchCount = 0;
        return true;
    }

    /**
     * Compare the current frame's body structure against the enrolled
     * reference.  Returns a `SameUserResult` indicating whether the user
     * is the same person.
     */
    validate(frame: PoseFrame): SameUserResult {
        if (!this.referenceSignature) {
            return this.result(
                "NO_REFERENCE",
                true,   // allow workout when no ref
                1,
                "No reference body signature enrolled.",
                "Workout proceeding without identity check.",
                {}
            );
        }

        const currentSig = this.extractSignatureFromFrame(frame);

        if (!currentSig) {
            // Can't compute signature (landmarks missing) — don't punish.
            return this.result(
                "SAME_USER",
                true,
                0.5,
                "Insufficient landmarks for identity check this frame.",
                "Keep your full body visible.",
                {}
            );
        }

        const deviations = this.compareSignatures(
            this.referenceSignature,
            currentSig
        );

        const exceeded = this.anyToleranceExceeded(deviations);

        if (exceeded) {
            this.consecutiveMismatchCount += 1;
        } else {
            this.consecutiveMismatchCount = 0;
        }

        if (this.consecutiveMismatchCount >= this.config.consecutiveFrameThreshold) {
            const confidence = this.deviationsToConfidence(deviations);
            return this.result(
                "DIFFERENT_USER_SUSPECTED",
                false,
                confidence,
                "Body proportions differ significantly from the enrolled reference.",
                "Different person detected. The original user must continue the workout.",
                deviations
            );
        }

        const confidence = this.deviationsToConfidence(deviations);
        return this.result(
            "SAME_USER",
            true,
            confidence,
            "Body proportions match the enrolled reference.",
            "Identity verified. Continue your workout.",
            deviations
        );
    }

    /** Clear the enrolled reference and internal state. */
    reset(): void {
        this.referenceSignature = null;
        this.consecutiveMismatchCount = 0;
    }

    /** Whether a reference has been enrolled. */
    get hasReference(): boolean {
        return this.referenceSignature !== null;
    }

    // ── Signature extraction ─────────────────────────────────────────

    /**
     * Extract a `BodySignature` from a raw `Landmark[]` (as produced by
     * MediaPipe and available from `usePoseSetupChecks` / `usePoseDetection`).
     */
    private extractSignature(landmarks: Landmark[]): SameUserProportions | null {
        const required = [
            NOSE,
            LEFT_SHOULDER, RIGHT_SHOULDER,
            LEFT_HIP, RIGHT_HIP,
            LEFT_ANKLE, RIGHT_ANKLE,
        ];

        for (const idx of required) {
            if (!isLandmarkVisible(landmarks[idx], this.config.minVisibility)) {
                return null;
            }
        }

        const nose = landmarks[NOSE];
        const lShoulder = landmarks[LEFT_SHOULDER];
        const rShoulder = landmarks[RIGHT_SHOULDER];
        const lHip = landmarks[LEFT_HIP];
        const rHip = landmarks[RIGHT_HIP];
        const lAnkle = landmarks[LEFT_ANKLE];
        const rAnkle = landmarks[RIGHT_ANKLE];

        const shoulderWidth = dist(lShoulder, rShoulder);
        const hipWidth = dist(lHip, rHip);

        const midShoulder = midpoint(lShoulder, rShoulder);
        const midHip = midpoint(lHip, rHip);
        const torsoHeight = dist(midShoulder, midHip);

        const midAnkle = midpoint(lAnkle, rAnkle);
        const bodyHeight = dist(nose, midAnkle);

        if (bodyHeight < 0.01) return null; // degenerate

        const leftSide = dist(lShoulder, lHip);
        const rightSide = dist(rShoulder, rHip);
        const leftRightSymmetry = rightSide > 0.001
            ? leftSide / rightSide
            : 1;

        return {
            shoulderWidthRatio: shoulderWidth / bodyHeight,
            hipWidthRatio: hipWidth / bodyHeight,
            torsoHeightRatio: torsoHeight / bodyHeight,
            leftRightSymmetry,
        };
    }

    /**
     * Extract a signature from a `PoseFrame` (which wraps raw landmarks
     * inside `.rawLandmarks` when available, but the authenticity module
     * uses its own `PoseFrame` which has a plain `landmarks` array).
     */
    private extractSignatureFromFrame(frame: PoseFrame): SameUserProportions | null {
        if (!frame.landmarks || frame.landmarks.length === 0) return null;
        return this.extractSignature(frame.landmarks);
    }

    // ── Comparison ───────────────────────────────────────────────────

    private compareSignatures(
        ref: SameUserProportions,
        current: SameUserProportions
    ): Record<string, number> {
        return {
            shoulderWidthRatio: this.relativeDeviation(
                ref.shoulderWidthRatio,
                current.shoulderWidthRatio
            ),
            hipWidthRatio: this.relativeDeviation(
                ref.hipWidthRatio,
                current.hipWidthRatio
            ),
            torsoHeightRatio: this.relativeDeviation(
                ref.torsoHeightRatio,
                current.torsoHeightRatio
            ),
            leftRightSymmetry: this.relativeDeviation(
                ref.leftRightSymmetry,
                current.leftRightSymmetry
            ),
        };
    }

    private relativeDeviation(reference: number, current: number): number {
        if (reference === 0) return current === 0 ? 0 : 1;
        return Math.abs(current - reference) / Math.abs(reference);
    }

    private anyToleranceExceeded(deviations: Record<string, number>): boolean {
        const { shoulderTolerance, hipTolerance, torsoTolerance, symmetryTolerance } = this.config;

        return (
            deviations.shoulderWidthRatio > shoulderTolerance ||
            deviations.hipWidthRatio > hipTolerance ||
            deviations.torsoHeightRatio > torsoTolerance ||
            deviations.leftRightSymmetry > symmetryTolerance
        );
    }

    private deviationsToConfidence(deviations: Record<string, number>): number {
        const values = Object.values(deviations);
        if (values.length === 0) return 1;
        const avgDeviation = values.reduce((s, v) => s + v, 0) / values.length;
        // Map avg deviation → confidence: 0% deviation → 1.0, 50%+ → 0.0
        return Math.max(0, Math.min(1, 1 - avgDeviation * 2));
    }

    // ── Result factory ───────────────────────────────────────────────

    private result(
        status: SameUserStatus,
        isSameUser: boolean,
        confidence: number,
        reason: string,
        feedbackMessage: string,
        deviations: Record<string, number>
    ): SameUserResult {
        return { status, isSameUser, confidence, reason, feedbackMessage, deviations };
    }
}
