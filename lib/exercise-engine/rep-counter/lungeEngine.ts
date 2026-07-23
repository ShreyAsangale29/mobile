import { ExerciseThresholds } from '../config/thresholds';
import {
    average,
    calculateAngle,
    midpoint,
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
    LEFT_FOOT_INDEX,
    RIGHT_FOOT_INDEX,
    PoseFrame,
    point,
    visible,
} from '../landmark-extraction/landmarks';
import { scoreFromErrors } from '../posture-validator/scoring';
import { EngineResult, createEngineResult } from '../types/EngineResult';

function torsoAngleFromVertical(
    shoulder: Point | null,
    hip: Point | null
): number | null {
    if (!shoulder || !hip) {
        return null;
    }

    const dx = Math.abs(shoulder.x - hip.x);
    const dy = hip.y - shoulder.y;

    if (dy <= 0) {
        return 90.0;
    }

    return (Math.atan2(dx, dy) * 180) / Math.PI;
}

export class LungeEngine {
    private t: ExerciseThresholds;

    private stage = 'standing';
    private reps = 0;
    private validReps = 0;
    private invalidReps = 0;

    private leftReps = 0;
    private rightReps = 0;

    private frontLegSide: 'left' | 'right' | 'unknown' = 'unknown';
    private minFrontKnee: number | null = null;

    private downConfirmFrames = 0;
    private upConfirmFrames = 0;

    constructor(thresholds: ExerciseThresholds) {
        this.t = thresholds;
    }

    private kneeAngles(frame: PoseFrame): {
        leftKnee: number | null;
        rightKnee: number | null;
    } {
        let leftKnee: number | null = null;
        let rightKnee: number | null = null;

        const leftHip = point(frame, LEFT_HIP);
        const leftKneePoint = point(frame, LEFT_KNEE);
        const leftAnkle = point(frame, LEFT_ANKLE);

        if (
            leftHip &&
            leftKneePoint &&
            leftAnkle &&
            visible(frame, LEFT_HIP) &&
            visible(frame, LEFT_KNEE) &&
            visible(frame, LEFT_ANKLE)
        ) {
            leftKnee = calculateAngle(leftHip, leftKneePoint, leftAnkle);
        }

        const rightHip = point(frame, RIGHT_HIP);
        const rightKneePoint = point(frame, RIGHT_KNEE);
        const rightAnkle = point(frame, RIGHT_ANKLE);

        if (
            rightHip &&
            rightKneePoint &&
            rightAnkle &&
            visible(frame, RIGHT_HIP) &&
            visible(frame, RIGHT_KNEE) &&
            visible(frame, RIGHT_ANKLE)
        ) {
            rightKnee = calculateAngle(rightHip, rightKneePoint, rightAnkle);
        }

        return {
            leftKnee,
            rightKnee,
        };
    }

    private torsoAngle(frame: PoseFrame): number | null {
        const leftShoulder = point(frame, LEFT_SHOULDER);
        const rightShoulder = point(frame, RIGHT_SHOULDER);
        const leftHip = point(frame, LEFT_HIP);
        const rightHip = point(frame, RIGHT_HIP);

        const shoulder =
            leftShoulder && rightShoulder
                ? midpoint(leftShoulder, rightShoulder)
                : null;

        const hip = leftHip && rightHip ? midpoint(leftHip, rightHip) : null;

        return torsoAngleFromVertical(shoulder, hip);
    }

    private kneeOverToe(frame: PoseFrame, side: 'left' | 'right'): boolean {
        let knee: Point | null = null;
        let toe: Point | null = null;

        if (side === 'left') {
            knee = point(frame, LEFT_KNEE);
            toe = point(frame, LEFT_FOOT_INDEX) || point(frame, LEFT_ANKLE);
        } else {
            knee = point(frame, RIGHT_KNEE);
            toe = point(frame, RIGHT_FOOT_INDEX) || point(frame, RIGHT_ANKLE);
        }

        if (!knee || !toe) {
            return false;
        }

        return Math.abs(knee.x - toe.x) > frame.width * 0.18;
    }

    update(frame: PoseFrame): EngineResult {
        const errors: string[] = [];

        const { leftKnee, rightKnee } = this.kneeAngles(frame);

        if (leftKnee === null && rightKnee === null) {
            return createEngineResult({
                exercise: 'lunge',
                errors: ['ERR_NO_POSE'],
                reps: this.reps,
                stage: 'no_pose',
                status: 'Show both legs.',
                metrics: {
                    level: this.t.level,
                    validReps: this.validReps,
                    invalidReps: this.invalidReps,
                    postureScore: 0,
                    repCounted: false,
                },
            });
        }

        const leftAngle = leftKnee ?? 180.0;
        const rightAngle = rightKnee ?? 180.0;

        const frontAngle = Math.min(leftAngle, rightAngle);
        const torsoAngle = this.torsoAngle(frame);

        let repCounted = false;
        let validRep = true;

        if (this.stage === 'standing' && frontAngle < this.t.lungeStandingAngle) {
            this.stage = 'lunging';
            this.frontLegSide = leftAngle <= rightAngle ? 'left' : 'right';
            this.minFrontKnee = frontAngle;
            this.downConfirmFrames = 1;
            this.upConfirmFrames = 0;
        }

        if (this.stage === 'lunging' || this.stage === 'bottom') {
            const activeFrontAngle =
                this.frontLegSide === 'left' ? leftAngle : rightAngle;

            this.minFrontKnee = Math.min(
                this.minFrontKnee ?? activeFrontAngle,
                activeFrontAngle
            );

            if (activeFrontAngle <= this.t.lungeFrontKneeTarget) {
                this.downConfirmFrames += 1;

                if (this.downConfirmFrames >= 2) {
                    this.stage = 'bottom';
                }
            }

            if (
                leftAngle >= this.t.lungeStandingAngle &&
                rightAngle >= this.t.lungeStandingAngle
            ) {
                this.upConfirmFrames += 1;
            } else {
                this.upConfirmFrames = 0;
            }
        }

        if (
            torsoAngle !== null &&
            torsoAngle > this.t.lungeTorsoLeanLimit
        ) {
            errors.push('ERR_LUNGE_TORSO_LEAN');
        }

        if (
            (this.stage === 'lunging' || this.stage === 'bottom') &&
            (this.frontLegSide === 'left' || this.frontLegSide === 'right') &&
            this.kneeOverToe(frame, this.frontLegSide)
        ) {
            errors.push('ERR_LUNGE_KNEE_OVER_TOE');
        }

        if (
            (this.stage === 'lunging' || this.stage === 'bottom') &&
            this.upConfirmFrames >= 2
        ) {
            this.reps += 1;
            repCounted = true;

            if (this.frontLegSide === 'left') {
                this.leftReps += 1;
            } else if (this.frontLegSide === 'right') {
                this.rightReps += 1;
            }

            if (
                this.minFrontKnee === null ||
                this.minFrontKnee > this.t.lungeShallowLimit
            ) {
                validRep = false;
                errors.push('ERR_LUNGE_SHALLOW');
            }

            if (errors.length > 0) {
                validRep = false;
            }

            if (validRep) {
                this.validReps += 1;
            } else {
                this.invalidReps += 1;
            }

            this.stage = 'standing';
            this.frontLegSide = 'unknown';
            this.minFrontKnee = null;
            this.downConfirmFrames = 0;
            this.upConfirmFrames = 0;
        }

        return createEngineResult({
            exercise: 'lunge',
            metrics: {
                level: this.t.level,
                leftKneeAngle: Number(leftAngle.toFixed(1)),
                rightKneeAngle: Number(rightAngle.toFixed(1)),
                frontLeg: this.frontLegSide,
                minFrontKnee:
                    this.minFrontKnee !== null
                        ? Number(this.minFrontKnee.toFixed(1))
                        : null,
                torsoAngle:
                    torsoAngle !== null ? Number(torsoAngle.toFixed(1)) : null,
                leftReps: this.leftReps,
                rightReps: this.rightReps,
                validReps: this.validReps,
                invalidReps: this.invalidReps,
                postureScore: scoreFromErrors(errors, validRep ? 100.0 : 85.0),
                repCounted,
                lastRepValid: validRep,
            },
            errors,
            reps: this.reps,
            stage: this.stage,
            status: repCounted ? 'Rep counted' : 'Track lunge depth.',
        });
    }

    reset(): void {
        this.stage = 'standing';
        this.reps = 0;
        this.validReps = 0;
        this.invalidReps = 0;

        this.leftReps = 0;
        this.rightReps = 0;

        this.frontLegSide = 'unknown';
        this.minFrontKnee = null;

        this.downConfirmFrames = 0;
        this.upConfirmFrames = 0;
    }
}