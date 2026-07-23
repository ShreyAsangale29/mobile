import { ExerciseThresholds } from '../config/thresholds';
import {
    average,
    calculateAngle,
    isHorizontal,
    midpoint,
    yOnLineAtX,
} from '../angle-calculation/geometry';
import {
    LEFT_ANKLE,
    LEFT_HIP,
    LEFT_SHOULDER,
    RIGHT_ANKLE,
    RIGHT_HIP,
    RIGHT_SHOULDER,
    PoseFrame,
    point,
    visible,
} from '../landmark-extraction/landmarks';
import { scoreFromErrors } from '../posture-validator/scoring';
import { EngineResult, createEngineResult } from '../types/EngineResult';

export class PlankEngine {
    private t: ExerciseThresholds;

    private goodSeconds = 0.0;
    private currentHoldSeconds = 0.0;
    private lastUpdateTime: number | null = null;
    private previousStage: string | null = null;

    constructor(thresholds: ExerciseThresholds) {
        this.t = thresholds;
    }

    update(frame: PoseFrame): EngineResult {
        const errors: string[] = [];

        const now = Date.now() / 1000;
        let deltaTime =
            this.lastUpdateTime === null ? 0.0 : now - this.lastUpdateTime;

        this.lastUpdateTime = now;

        const wasGood = this.previousStage === 'good';

        const horizontal = isHorizontal(
            visible(frame, LEFT_SHOULDER) ? point(frame, LEFT_SHOULDER) : null,
            visible(frame, RIGHT_SHOULDER) ? point(frame, RIGHT_SHOULDER) : null,
            visible(frame, LEFT_ANKLE) ? point(frame, LEFT_ANKLE) : null,
            visible(frame, RIGHT_ANKLE) ? point(frame, RIGHT_ANKLE) : null,
            visible(frame, LEFT_HIP) ? point(frame, LEFT_HIP) : null,
            visible(frame, RIGHT_HIP) ? point(frame, RIGHT_HIP) : null
        );

        if (!horizontal) {
            errors.push('ERR_PLANK_NOT_HORIZONTAL');

            this.currentHoldSeconds = 0.0;
            this.previousStage = 'not_horizontal';

            return createEngineResult({
                exercise: 'plank',
                metrics: {
                    level: this.t.level,
                    holdSeconds: 0.0,
                    targetHoldSeconds: this.t.plankMinHoldSeconds,
                    totalGoodSeconds: Number(this.goodSeconds.toFixed(1)),
                    postureScore: scoreFromErrors(errors),
                },
                errors,
                reps: 0,
                stage: 'not_horizontal',
                status: 'Get into plank position',
            });
        }

        let leftAngle: number | null = null;
        let rightAngle: number | null = null;

        const leftShoulder = point(frame, LEFT_SHOULDER);
        const leftHip = point(frame, LEFT_HIP);
        const leftAnkle = point(frame, LEFT_ANKLE);

        if (
            leftShoulder &&
            leftHip &&
            leftAnkle &&
            visible(frame, LEFT_SHOULDER) &&
            visible(frame, LEFT_HIP) &&
            visible(frame, LEFT_ANKLE)
        ) {
            leftAngle = calculateAngle(leftShoulder, leftHip, leftAnkle);
        }

        const rightShoulder = point(frame, RIGHT_SHOULDER);
        const rightHip = point(frame, RIGHT_HIP);
        const rightAnkle = point(frame, RIGHT_ANKLE);

        if (
            rightShoulder &&
            rightHip &&
            rightAnkle &&
            visible(frame, RIGHT_SHOULDER) &&
            visible(frame, RIGHT_HIP) &&
            visible(frame, RIGHT_ANKLE)
        ) {
            rightAngle = calculateAngle(rightShoulder, rightHip, rightAnkle);
        }

        const bodyAngle = average([leftAngle, rightAngle]);

        if (bodyAngle === null) {
            this.currentHoldSeconds = 0.0;
            this.previousStage = 'unknown';

            return createEngineResult({
                exercise: 'plank',
                metrics: {
                    level: this.t.level,
                    holdSeconds: 0.0,
                    targetHoldSeconds: this.t.plankMinHoldSeconds,
                    totalGoodSeconds: Number(this.goodSeconds.toFixed(1)),
                    postureScore: scoreFromErrors(['ERR_NO_POSE']),
                },
                errors: ['ERR_NO_POSE'],
                reps: 0,
                stage: 'unknown',
                status: 'No pose detected',
            });
        }

        const leftShoulderPoint = point(frame, LEFT_SHOULDER);
        const rightShoulderPoint = point(frame, RIGHT_SHOULDER);
        const leftHipPoint = point(frame, LEFT_HIP);
        const rightHipPoint = point(frame, RIGHT_HIP);
        const leftAnklePoint = point(frame, LEFT_ANKLE);
        const rightAnklePoint = point(frame, RIGHT_ANKLE);

        if (
            !leftShoulderPoint ||
            !rightShoulderPoint ||
            !leftHipPoint ||
            !rightHipPoint ||
            !leftAnklePoint ||
            !rightAnklePoint
        ) {
            this.currentHoldSeconds = 0.0;
            this.previousStage = 'unknown';

            return createEngineResult({
                exercise: 'plank',
                metrics: {
                    level: this.t.level,
                    holdSeconds: 0.0,
                    targetHoldSeconds: this.t.plankMinHoldSeconds,
                    totalGoodSeconds: Number(this.goodSeconds.toFixed(1)),
                    postureScore: scoreFromErrors(['ERR_NO_POSE']),
                },
                errors: ['ERR_NO_POSE'],
                reps: 0,
                stage: 'unknown',
                status: 'Keep shoulder, hip and ankle visible.',
            });
        }

        const shoulder = midpoint(leftShoulderPoint, rightShoulderPoint);
        const hip = midpoint(leftHipPoint, rightHipPoint);
        const ankle = midpoint(leftAnklePoint, rightAnklePoint);

        const expectedHipY = yOnLineAtX(shoulder, ankle, hip.x);

        const hipOffset =
            expectedHipY === null ? 0.0 : hip.y - expectedHipY;

        const tolerancePx = frame.height * this.t.plankHipOffsetRatio;

        if (bodyAngle < this.t.plankGoodAngle) {
            errors.push('ERR_PLANK_ALIGNMENT');
        }

        if (hipOffset > tolerancePx) {
            errors.push('ERR_PLANK_HIP_LOW');
        } else if (hipOffset < -tolerancePx) {
            errors.push('ERR_PLANK_HIP_HIGH');
        }

        let stage: string;
        let status: string;

        if (errors.length > 0) {
            stage = 'needs_correction';
            this.currentHoldSeconds = 0.0;
            status = 'Correct plank form';
        } else {
            stage = 'good';

            if (!wasGood) {
                deltaTime = 0.0;
            }

            this.goodSeconds += deltaTime;
            this.currentHoldSeconds += deltaTime;

            const targetMet =
                this.currentHoldSeconds >= this.t.plankMinHoldSeconds;

            status = targetMet
                ? 'Plank target achieved'
                : `Good plank: ${Number(this.currentHoldSeconds.toFixed(1))}s`;
        }

        this.previousStage = stage;

        return createEngineResult({
            exercise: 'plank',
            metrics: {
                level: this.t.level,
                bodyAngle: Number(bodyAngle.toFixed(1)),
                targetBodyAngle: this.t.plankGoodAngle,
                hipOffsetPx: Number(hipOffset.toFixed(1)),
                tolerancePx: Number(tolerancePx.toFixed(1)),
                holdSeconds: Number(this.currentHoldSeconds.toFixed(1)),
                targetHoldSeconds: this.t.plankMinHoldSeconds,
                totalGoodSeconds: Number(this.goodSeconds.toFixed(1)),
                postureScore: scoreFromErrors(errors),
            },
            errors,
            reps: 0,
            stage,
            status,
        });
    }

    reset(): void {
        this.goodSeconds = 0.0;
        this.currentHoldSeconds = 0.0;
        this.lastUpdateTime = null;
        this.previousStage = null;
    }
}