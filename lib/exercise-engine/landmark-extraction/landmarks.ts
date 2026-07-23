import { Point } from '../angle-calculation/geometry';

export const NOSE = 0;

export const LEFT_SHOULDER = 11;
export const RIGHT_SHOULDER = 12;

export const LEFT_ELBOW = 13;
export const RIGHT_ELBOW = 14;

export const LEFT_WRIST = 15;
export const RIGHT_WRIST = 16;

export const LEFT_HIP = 23;
export const RIGHT_HIP = 24;

export const LEFT_KNEE = 25;
export const RIGHT_KNEE = 26;

export const LEFT_ANKLE = 27;
export const RIGHT_ANKLE = 28;

export const LEFT_HEEL = 29;
export const RIGHT_HEEL = 30;

export const LEFT_FOOT_INDEX = 31;
export const RIGHT_FOOT_INDEX = 32;

export const POSE_CONNECTIONS: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 7],

    [0, 4],
    [4, 5],
    [5, 6],
    [6, 8],

    [9, 10],

    [11, 12],
    [11, 23],
    [12, 24],
    [23, 24],

    [11, 13],
    [13, 15],
    [15, 17],
    [15, 19],
    [15, 21],
    [17, 19],

    [12, 14],
    [14, 16],
    [16, 18],
    [16, 20],
    [16, 22],
    [18, 20],

    [23, 25],
    [25, 27],
    [27, 29],
    [27, 31],
    [29, 31],

    [24, 26],
    [26, 28],
    [28, 30],
    [28, 32],
    [30, 32],
];

export type PoseLandmark = {
    x: number;
    y: number;
    z?: number;
    visibility?: number;
    presence?: number;
};

export type PoseFrame = {
    rawLandmarks: PoseLandmark[];
    points: Record<number, Point>;
    width: number;
    height: number;
};

export function point(frame: PoseFrame, index: number): Point | null {
    return frame.points[index] ?? null;
}

export function visible(
    frame: PoseFrame,
    index: number,
    minPresence = 0.4
): boolean {
    if (!frame.rawLandmarks || index >= frame.rawLandmarks.length) {
        return false;
    }

    const landmark = frame.rawLandmarks[index];

    if (!landmark) {
        return false;
    }

    const presence = landmark.presence ?? 1.0;
    const visibility = landmark.visibility ?? 1.0;

    return presence >= minPresence && visibility >= minPresence;
}

export function landmarksToPoseFrame(
    landmarks: PoseLandmark[],
    width: number,
    height: number
): PoseFrame {
    const points: Record<number, Point> = {};

    landmarks.forEach((landmark, index) => {
        const x = Math.max(
            0,
            Math.min(width - 1, Math.floor(landmark.x * width))
        );

        const y = Math.max(
            0,
            Math.min(height - 1, Math.floor(landmark.y * height))
        );

        points[index] = { x, y };
    });

    return {
        rawLandmarks: landmarks,
        points,
        width,
        height,
    };
}

export function requiredPointsAvailable(
    frame: PoseFrame,
    ids: number[]
): boolean {
    return ids.every((id) => point(frame, id) !== null);
}