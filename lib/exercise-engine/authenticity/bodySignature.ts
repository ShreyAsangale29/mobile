import { Landmark } from './authenticityTypes';

export type BodySignature = {
    shoulderWidth: number;
    hipWidth: number;
    torsoHeight: number;
    bodyHeight: number;
    shoulderToHipRatio: number;
    bodyCenterX: number;
    bodyCenterY: number;
    createdAt: string;
};

const LANDMARKS = {
    nose: 0,
    leftShoulder: 11,
    rightShoulder: 12,
    leftHip: 23,
    rightHip: 24,
    leftAnkle: 27,
    rightAnkle: 28,
};

const MIN_VISIBILITY = 0.45;

function isVisible(point?: Landmark): boolean {
    return Boolean(
        point &&
        typeof point.x === 'number' &&
        typeof point.y === 'number' &&
        (point.visibility === undefined || point.visibility >= MIN_VISIBILITY)
    );
}

function distance(a: Landmark, b: Landmark): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z || 0) - (b.z || 0);

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function midpoint(a: Landmark, b: Landmark): Landmark {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
        z: ((a.z || 0) + (b.z || 0)) / 2,
        visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
    };
}

export function createBodySignatureFromLandmarks(
    landmarks: Landmark[]
): BodySignature | null {
    const nose = landmarks[LANDMARKS.nose];
    const leftShoulder = landmarks[LANDMARKS.leftShoulder];
    const rightShoulder = landmarks[LANDMARKS.rightShoulder];
    const leftHip = landmarks[LANDMARKS.leftHip];
    const rightHip = landmarks[LANDMARKS.rightHip];
    const leftAnkle = landmarks[LANDMARKS.leftAnkle];
    const rightAnkle = landmarks[LANDMARKS.rightAnkle];

    const requiredPoints = [
        nose,
        leftShoulder,
        rightShoulder,
        leftHip,
        rightHip,
        leftAnkle,
        rightAnkle,
    ];

    if (!requiredPoints.every(isVisible)) {
        return null;
    }

    const shoulderCenter = midpoint(leftShoulder, rightShoulder);
    const hipCenter = midpoint(leftHip, rightHip);
    const ankleCenter = midpoint(leftAnkle, rightAnkle);

    const shoulderWidth = distance(leftShoulder, rightShoulder);
    const hipWidth = distance(leftHip, rightHip);
    const torsoHeight = distance(shoulderCenter, hipCenter);
    const bodyHeight = distance(nose, ankleCenter);

    if (
        shoulderWidth <= 0 ||
        hipWidth <= 0 ||
        torsoHeight <= 0 ||
        bodyHeight <= 0
    ) {
        return null;
    }

    return {
        shoulderWidth,
        hipWidth,
        torsoHeight,
        bodyHeight,
        shoulderToHipRatio: shoulderWidth / hipWidth,
        bodyCenterX: hipCenter.x,
        bodyCenterY: hipCenter.y,
        createdAt: new Date().toISOString(),
    };
}

function normalizedDifference(reference: number, current: number): number {
    if (reference === 0) {
        return 1;
    }

    return Math.abs(reference - current) / reference;
}

export function compareBodySignatures(
    reference: BodySignature,
    current: BodySignature
): {
    isSameUser: boolean;
    differenceScore: number;
    reason: string;
} {
    const shoulderDiff = normalizedDifference(
        reference.shoulderWidth,
        current.shoulderWidth
    );

    const hipDiff = normalizedDifference(reference.hipWidth, current.hipWidth);

    const torsoDiff = normalizedDifference(
        reference.torsoHeight,
        current.torsoHeight
    );

    const heightDiff = normalizedDifference(
        reference.bodyHeight,
        current.bodyHeight
    );

    const ratioDiff = normalizedDifference(
        reference.shoulderToHipRatio,
        current.shoulderToHipRatio
    );

    const differenceScore =
        shoulderDiff * 0.2 +
        hipDiff * 0.2 +
        torsoDiff * 0.2 +
        heightDiff * 0.25 +
        ratioDiff * 0.15;

    const isSameUser = differenceScore <= 0.15;

    return {
        isSameUser,
        differenceScore,
        reason: isSameUser
            ? `Workout user matches captured setup profile. Difference score: ${differenceScore.toFixed(3)}`
            : `Workout user does not match captured setup profile. Difference score: ${differenceScore.toFixed(3)}`,
    };
}