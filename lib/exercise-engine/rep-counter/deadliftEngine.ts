import { ExerciseThresholds } from '../config/thresholds';
import {
    average,
    calculateAngle,
    distance,
    isHorizontal,
    Point,
} from '../angle-calculation/geometry';
import {
    LEFT_SHOULDER,
    RIGHT_SHOULDER,
    LEFT_HIP,
    RIGHT_HIP,
    LEFT_KNEE,
    RIGHT_KNEE,
    LEFT_ANKLE,
    RIGHT_ANKLE,
    PoseFrame,
    point,
    visible,
} from '../landmark-extraction/landmarks';
import { scoreFromErrors } from '../posture-validator/scoring';
import { EngineResult, createEngineResult } from '../types/EngineResult';

function backAngleFromVertical(
    shoulderPoint: Point | null,
    hipPoint: Point | null
): number | null {
    if (!shoulderPoint || !hipPoint) {
        return null;
    }

    const dx = Math.abs(shoulderPoint.x - hipPoint.x);
    const dy = hipPoint.y - shoulderPoint.y;

    if (dy <= 0) {
        return 90.0;
    }

    return (Math.atan2(dx, dy) * 180) / Math.PI;
}

export class DeadliftEngine {
    private t: ExerciseThresholds;

    private stage = 'standing';
    private reps = 0;
    private validReps = 0;
    private invalidReps = 0;

    private minHipAngle: number | null = null;
    private minKneeAngle: number | null = null;
    private maxBackAngle = 0.0;

    private downConfirmFrames = 0;
    private upConfirmFrames = 0;

    private hipHistory: number[] = [];

    constructor(thresholds: ExerciseThresholds) {
        this.t = thresholds;
    }

    private smooth(value: number, window = 5): number {
        this.hipHistory.push(value);
        this.hipHistory = this.hipHistory.slice(-window);

        return (
            this.hipHistory.reduce((sum, item) => sum + item, 0) /
            this.hipHistory.length
        );
    }

    private sideAngles(frame: PoseFrame): {
        hipAngle: number | null;
        kneeAngle: number | null;
        backAngle: number | null;
    } {
        const hipAngles: number[] = [];
        const kneeAngles: number[] = [];
        const backAngles: Array<number | null> = [];

        const leftShoulder = point(frame, LEFT_SHOULDER);
        const leftHip = point(frame, LEFT_HIP);
        const leftKnee = point(frame, LEFT_KNEE);
        const leftAnkle = point(frame, LEFT_ANKLE);

        if (
            leftShoulder &&
            leftHip &&
            leftKnee &&
            leftAnkle &&
            visible(frame, LEFT_SHOULDER) &&
            visible(frame, LEFT_HIP) &&
            visible(frame, LEFT_KNEE) &&
            visible(frame, LEFT_ANKLE)
        ) {
            hipAngles.push(calculateAngle(leftShoulder, leftHip, leftKnee));
            kneeAngles.push(calculateAngle(leftHip, leftKnee, leftAnkle));
            backAngles.push(backAngleFromVertical(leftShoulder, leftHip));
        }

        const rightShoulder = point(frame, RIGHT_SHOULDER);
        const rightHip = point(frame, RIGHT_HIP);
        const rightKnee = point(frame, RIGHT_KNEE);
        const rightAnkle = point(frame, RIGHT_ANKLE);

        if (
            rightShoulder &&
            rightHip &&
            rightKnee &&
            rightAnkle &&
            visible(frame, RIGHT_SHOULDER) &&
            visible(frame, RIGHT_HIP) &&
            visible(frame, RIGHT_KNEE) &&
            visible(frame, RIGHT_ANKLE)
        ) {
            hipAngles.push(calculateAngle(rightShoulder, rightHip, rightKnee));
            kneeAngles.push(calculateAngle(rightHip, rightKnee, rightAnkle));
            backAngles.push(backAngleFromVertical(rightShoulder, rightHip));
        }

        return {
            hipAngle: average(hipAngles),
            kneeAngle: average(kneeAngles),
            backAngle: average(backAngles),
        };
    }

    update(frame: PoseFrame): EngineResult {
        const errors: string[] = [];

        const {
            hipAngle: hipAngleRaw,
            kneeAngle,
            backAngle,
        } = this.sideAngles(frame);

        if (hipAngleRaw === null || kneeAngle === null) {
            return createEngineResult({
                exercise: 'deadlift',
                errors: ['ERR_NO_POSE'],
                reps: this.reps,
                stage: 'no_pose',
                status: 'Show shoulder, hip, knee and ankle.',
                metrics: {
                    level: this.t.level,
                    validReps: this.validReps,
                    invalidReps: this.invalidReps,
                    postureScore: 0,
                    repCounted: false,
                },
            });
        }

        const hipAngle = this.smooth(hipAngleRaw);

        let repCounted = false;
        let validRep = true;

        if (this.stage === 'standing' && hipAngle < this.t.deadliftStandingAngle) {
            this.stage = 'hinging_down';
            this.minHipAngle = hipAngle;
            this.minKneeAngle = kneeAngle;
            this.maxBackAngle = backAngle ?? 0.0;
            this.downConfirmFrames = 1;
            this.upConfirmFrames = 0;
        }

        if (this.stage === 'hinging_down' || this.stage === 'bottom') {
            this.minHipAngle = Math.min(this.minHipAngle ?? hipAngle, hipAngle);
            this.minKneeAngle = Math.min(this.minKneeAngle ?? kneeAngle, kneeAngle);
            this.maxBackAngle = Math.max(this.maxBackAngle, backAngle ?? 0.0);

            if (hipAngle <= this.t.deadliftBottomAngle) {
                this.downConfirmFrames += 1;

                if (this.downConfirmFrames >= 2) {
                    this.stage = 'bottom';
                }
            }

            if (hipAngle >= this.t.deadliftRepCompleteAngle) {
                this.upConfirmFrames += 1;
            } else {
                this.upConfirmFrames = 0;
            }
        }

        if (
            (this.stage === 'hinging_down' || this.stage === 'bottom') &&
            this.upConfirmFrames >= 2
        ) {
            this.reps += 1;
            repCounted = true;

            if (
                this.minHipAngle === null ||
                this.minHipAngle > this.t.deadliftBottomAngle
            ) {
                validRep = false;
                errors.push('ERR_DEADLIFT_INCOMPLETE_HINGE');
            }

            if (this.maxBackAngle > this.t.deadliftBackRoundLimit) {
                validRep = false;
                errors.push('ERR_DEADLIFT_ROUNDED_BACK');
            }

            if (
                this.minKneeAngle !== null &&
                this.minKneeAngle < this.t.deadliftKneeMinAngle
            ) {
                validRep = false;
                errors.push('ERR_DEADLIFT_SQUATTING');
            }

            if (validRep) {
                this.validReps += 1;
            } else {
                this.invalidReps += 1;
            }

            this.stage = 'standing';
            this.minHipAngle = null;
            this.minKneeAngle = null;
            this.maxBackAngle = 0.0;
            this.downConfirmFrames = 0;
            this.upConfirmFrames = 0;
        }

        if (backAngle !== null && backAngle > this.t.deadliftBackRoundLimit) {
            errors.push('ERR_DEADLIFT_ROUNDED_BACK');
        }

        if (kneeAngle < this.t.deadliftKneeMinAngle) {
            errors.push('ERR_DEADLIFT_SQUATTING');
        }

        return createEngineResult({
            exercise: 'deadlift',
            metrics: {
                level: this.t.level,
                hipAngle: Number(hipAngle.toFixed(1)),
                kneeAngle: Number(kneeAngle.toFixed(1)),
                backAngle: backAngle !== null ? Number(backAngle.toFixed(1)) : null,
                targetBottomAngle: this.t.deadliftBottomAngle,
                minHipAngle:
                    this.minHipAngle !== null ? Number(this.minHipAngle.toFixed(1)) : null,
                minKneeAngle:
                    this.minKneeAngle !== null
                        ? Number(this.minKneeAngle.toFixed(1))
                        : null,
                maxBackAngle: Number(this.maxBackAngle.toFixed(1)),
                validReps: this.validReps,
                invalidReps: this.invalidReps,
                postureScore: scoreFromErrors(errors, validRep ? 100.0 : 85.0),
                repCounted,
                lastRepValid: validRep,
            },
            errors,
            reps: this.reps,
            stage: this.stage,
            status: repCounted ? 'Rep counted' : 'Track hip hinge.',
        });
    }

    reset(): void {
        this.stage = 'standing';
        this.reps = 0;
        this.validReps = 0;
        this.invalidReps = 0;

        this.minHipAngle = null;
        this.minKneeAngle = null;
        this.maxBackAngle = 0.0;

        this.downConfirmFrames = 0;
        this.upConfirmFrames = 0;
        this.hipHistory = [];
    }
}