export type Point = {
    x: number;
    y: number;
};

export function calculateAngle(a: Point, b: Point, c: Point): number {
    let angle =
        Math.atan2(c.y - b.y, c.x - b.x) -
        Math.atan2(a.y - b.y, a.x - b.x);

    angle = Math.abs((angle * 180) / Math.PI);

    if (angle > 180) {
        angle = 360 - angle;
    }

    return angle;
}

export function distance(a: Point, b: Point): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

export function midpoint(a: Point, b: Point): Point {
    return {
        x: Math.floor((a.x + b.x) / 2),
        y: Math.floor((a.y + b.y) / 2),
    };
}

export function average(values: Array<number | null | undefined>): number | null {
    const validValues = values.filter(
        (value): value is number => value !== null && value !== undefined
    );

    if (validValues.length === 0) {
        return null;
    }

    return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

export function yOnLineAtX(a: Point, b: Point, x: number): number | null {
    const x1 = a.x;
    const y1 = a.y;
    const x2 = b.x;
    const y2 = b.y;

    if (x2 === x1) {
        return null;
    }

    const m = (y2 - y1) / (x2 - x1);
    return y1 + m * (x - x1);
}

export function isHorizontal(
    leftShoulder: Point | null,
    rightShoulder: Point | null,
    leftAnkle: Point | null,
    rightAnkle: Point | null,
    leftHip: Point | null = null,
    rightHip: Point | null = null
): boolean {
    let shoulder: Point | null = null;
    let ankle: Point | null = null;

    if (leftShoulder && rightShoulder) {
        shoulder = midpoint(leftShoulder, rightShoulder);
    } else if (leftShoulder) {
        shoulder = leftShoulder;
    } else if (rightShoulder) {
        shoulder = rightShoulder;
    }

    if (leftAnkle && rightAnkle) {
        ankle = midpoint(leftAnkle, rightAnkle);
    } else if (leftAnkle) {
        ankle = leftAnkle;
    } else if (rightAnkle) {
        ankle = rightAnkle;
    }

    if (!shoulder || !ankle) {
        return false;
    }

    const dx = Math.abs(ankle.x - shoulder.x);
    const dy = Math.abs(ankle.y - shoulder.y);

    if (dx > dy * 1.25) {
        return true;
    }

    if (leftHip || rightHip) {
        let hip: Point | null = null;

        if (leftHip && rightHip) {
            hip = midpoint(leftHip, rightHip);
        } else {
            hip = leftHip || rightHip;
        }

        if (hip) {
            const shoulderHipDx = Math.abs(hip.x - shoulder.x);
            const shoulderHipDy = Math.abs(hip.y - shoulder.y);

            const hipAnkleDx = Math.abs(ankle.x - hip.x);
            const hipAnkleDy = Math.abs(ankle.y - hip.y);

            if (
                shoulderHipDx > shoulderHipDy * 1.2 &&
                hipAnkleDx > hipAnkleDy * 1.2
            ) {
                return true;
            }
        }
    }

    return false;
}