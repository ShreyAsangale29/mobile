export type PoseLandmark = {
    x: number;
    y: number;
    z?: number;
    visibility?: number;
    presence?: number;
};

export type PosePoint = {
    x: number;
    y: number;
};


export type PoseFrame = {
    rawLandmarks: PoseLandmark[];
    points: Record<number, PosePoint>;
    width: number;
    height: number;
};

export function getPoint(frame: PoseFrame, index: number): PosePoint | null {
    return frame.points[index] ?? null;
}

export function isVisible(
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