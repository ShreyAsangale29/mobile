import { ExerciseThresholds } from '../config/thresholds';
import {
    average,
    calculateAngle,
    Point,
} from '../angle-calculation/geometry';
import {
    LEFT_ANKLE,
    LEFT_ELBOW,
    LEFT_HIP,
    LEFT_KNEE,
    LEFT_SHOULDER,
    LEFT_WRIST,
    RIGHT_ANKLE,
    RIGHT_ELBOW,
    RIGHT_HIP,
    RIGHT_KNEE,
    RIGHT_SHOULDER,
    RIGHT_WRIST,
    PoseFrame,
    point,
    visible,
} from '../landmark-extraction/landmarks';
import { scoreFromErrors } from '../posture-validator/scoring';
import { EngineResult, createEngineResult } from '../types/EngineResult';

export class PushupEngine {
    private t: ExerciseThresholds;

    private stage = 'not_ready';
    private readyToCount = false;
    private readyFrames = 0;

    private reps = 0;
    private validReps = 0;
    private invalidReps = 0;

    private minElbowAngle: number | null = null;
    private angleHistory: number[] = [];

    private downConfirmFrames = 0;
    private upConfirmFrames = 0;

    private requiredReadyFrames: number;
    private baselineElbowAngle: number | null = null;

    constructor(thresholds: ExerciseThresholds) {
        this.t = thresholds;
        this.requiredReadyFrames = Math.max(
            24,
            Math.floor(this.t.debounceFrames * 8)
        );
    }

    private smooth(value: number, window = 7): number {
        this.angleHistory.push(value);
        this.angleHistory = this.angleHistory.slice(-window);

        return (
            this.angleHistory.reduce((sum, item) => sum + item, 0) /
            this.angleHistory.length
        );
    }

    private avgPoint(points: Array<Point | null>): Point | null {
        const validPoints = points.filter((p): p is Point => p !== null);

        if (validPoints.length === 0) {
            return null;
        }

        return {
            x: Math.floor(
                validPoints.reduce((sum, p) => sum + p.x, 0) / validPoints.length
            ),
            y: Math.floor(
                validPoints.reduce((sum, p) => sum + p.y, 0) / validPoints.length
            ),
        };
    }

    private elbowAngles(frame: PoseFrame): number[] {
        const angles: number[] = [];

        const leftShoulder = point(frame, LEFT_SHOULDER);
        const leftElbow = point(frame, LEFT_ELBOW);
        const leftWrist = point(frame, LEFT_WRIST);

        if (
            leftShoulder &&
            leftElbow &&
            leftWrist &&
            visible(frame, LEFT_SHOULDER) &&
            visible(frame, LEFT_ELBOW) &&
            visible(frame, LEFT_WRIST)
        ) {
            angles.push(calculateAngle(leftShoulder, leftElbow, leftWrist));
        }

        const rightShoulder = point(frame, RIGHT_SHOULDER);
        const rightElbow = point(frame, RIGHT_ELBOW);
        const rightWrist = point(frame, RIGHT_WRIST);

        if (
            rightShoulder &&
            rightElbow &&
            rightWrist &&
            visible(frame, RIGHT_SHOULDER) &&
            visible(frame, RIGHT_ELBOW) &&
            visible(frame, RIGHT_WRIST)
        ) {
            angles.push(calculateAngle(rightShoulder, rightElbow, rightWrist));
        }

        return angles;
    }

    private bodyPoints(frame: PoseFrame): {
        shoulder: Point | null;
        hip: Point | null;
        support: Point | null;
    } {
        const shoulder = this.avgPoint([
            point(frame, LEFT_SHOULDER),
            point(frame, RIGHT_SHOULDER),
        ]);

        const hip = this.avgPoint([
            point(frame, LEFT_HIP),
            point(frame, RIGHT_HIP),
        ]);

        let support: Point | null;

        if (this.t.pushupVariant === 'knee') {
            support = this.avgPoint([
                point(frame, LEFT_KNEE),
                point(frame, RIGHT_KNEE),
            ]);
        } else {
            support = this.avgPoint([
                point(frame, LEFT_ANKLE),
                point(frame, RIGHT_ANKLE),
            ]);
        }

        return {
            shoulder,
            hip,
            support,
        };
    }

    private bodyAngle(frame: PoseFrame): number | null {
        const { shoulder, hip, support } = this.bodyPoints(frame);

        if (!shoulder || !hip || !support) {
            return null;
        }

        return calculateAngle(shoulder, hip, support);
    }

    private upperBodyVisible(frame: PoseFrame): boolean {
        const required = [
            LEFT_SHOULDER,
            RIGHT_SHOULDER,
            LEFT_ELBOW,
            RIGHT_ELBOW,
            LEFT_WRIST,
            RIGHT_WRIST,
            LEFT_HIP,
            RIGHT_HIP,
        ];

        const visibleCount = required.reduce((count, id) => {
            const landmarkPoint = point(frame, id);
            const isVisible = visible(frame, id, 0.45);

            return landmarkPoint && isVisible ? count + 1 : count;
        }, 0);

        return visibleCount >= 7;
    }

    private pushupGeometryOk(
        frame: PoseFrame,
        bodyAngle: number | null
    ): {
        ok: boolean;
        message: string;
    } {
        const { shoulder, hip, support } = this.bodyPoints(frame);

        if (!shoulder || !hip || !support || bodyAngle === null) {
            return {
                ok: false,
                message: 'Keep shoulder, hip and support point visible.',
            };
        }

        const width = Math.max(1, frame.width);
        const height = Math.max(1, frame.height);

        const dxTotal = Math.abs(support.x - shoulder.x);
        const dyTotal = Math.abs(support.y - shoulder.y);

        const dxShoulderHip = Math.abs(hip.x - shoulder.x);
        const dyShoulderHip = Math.abs(hip.y - shoulder.y);

        const dxHipSupport = Math.abs(support.x - hip.x);
        const dyHipSupport = Math.abs(support.y - hip.y);

        if (dxTotal < width * 0.35) {
            return {
                ok: false,
                message:
                    'Move into side-view push-up position; body must be visible horizontally.',
            };
        }

        if (dxTotal <= dyTotal * 1.4) {
            return {
                ok: false,
                message:
                    'Get into push-up position first; body should be mostly horizontal.',
            };
        }

        if (
            dxShoulderHip <= dyShoulderHip * 1.1 ||
            dxHipSupport <= dyHipSupport * 1.1
        ) {
            return {
                ok: false,
                message: 'Align shoulder, hip and support point in one line.',
            };
        }

        if (bodyAngle < this.t.pushupBodyAngleMin) {
            return {
                ok: false,
                message: 'Keep shoulder, hip and support point straighter.',
            };
        }

        const wrists = [
            point(frame, LEFT_WRIST),
            point(frame, RIGHT_WRIST),
        ].filter((p): p is Point => p !== null);

        if (wrists.length === 0) {
            return {
                ok: false,
                message: 'Keep hands/wrists visible on the floor.',
            };
        }

        const avgWrist = this.avgPoint(wrists);

        if (!avgWrist) {
            return {
                ok: false,
                message: 'Keep hands/wrists visible.',
            };
        }

        if (avgWrist.y < shoulder.y - height * 0.2) {
            return {
                ok: false,
                message: 'Place hands on the floor under your shoulders.',
            };
        }

        return {
            ok: true,
            message: 'Push-up start pose detected.',
        };
    }

    private isPushupReady(
        frame: PoseFrame,
        bodyAngle: number | null
    ): {
        ready: boolean;
        message: string;
        errors: string[];
    } {
        if (!this.upperBodyVisible(frame)) {
            return {
                ready: false,
                message: 'Keep shoulder, elbow, wrist and hip visible.',
                errors: ['ERR_NO_POSE'],
            };
        }

        const geometryCheck = this.pushupGeometryOk(frame, bodyAngle);

        if (!geometryCheck.ok) {
            if (this.t.pushupVariant === 'knee') {
                return {
                    ready: false,
                    message:
                        geometryCheck.message +
                        ' Use knee push-up: shoulder, hip and knee aligned.',
                    errors: ['ERR_PUSHUP_BODY_ALIGNMENT'],
                };
            }

            return {
                ready: false,
                message:
                    geometryCheck.message +
                    ' Use standard push-up: shoulder, hip and ankle aligned.',
                errors: ['ERR_PUSHUP_BODY_ALIGNMENT'],
            };
        }

        const elbowAngle = average(this.elbowAngles(frame));

        if (elbowAngle === null) {
            return {
                ready: false,
                message: 'Show shoulders, elbows and wrists clearly.',
                errors: ['ERR_NO_POSE'],
            };
        }

        if (elbowAngle < Math.max(130.0, this.t.pushupUpAngle - 8)) {
            return {
                ready: false,
                message: 'Start from top push-up position with arms extended.',
                errors: ['ERR_PUSHUP_START_POSITION'],
            };
        }

        return {
            ready: true,
            message: 'Hold push-up start position. Tracking will start.',
            errors: [],
        };
    }

    private notReadyResult(
        message: string,
        errors: string[],
        bodyAngle: number | null
    ): EngineResult {
        this.readyToCount = false;
        this.readyFrames = 0;
        this.stage = 'not_ready';
        this.minElbowAngle = null;
        this.downConfirmFrames = 0;
        this.upConfirmFrames = 0;
        this.baselineElbowAngle = null;

        return createEngineResult({
            exercise: 'pushup',
            metrics: {
                level: this.t.level,
                variant: this.t.pushupVariant,
                bodyAngle: bodyAngle !== null ? Number(bodyAngle.toFixed(1)) : null,
                targetBodyAngle: this.t.pushupBodyAngleMin,
                readyToCount: false,
                readyFrames: 0,
                postureScore: 0,
                validReps: this.validReps,
                invalidReps: this.invalidReps,
                repCounted: false,
            },
            errors,
            reps: this.reps,
            stage: 'not_ready',
            status: message,
        });
    }

    update(frame: PoseFrame): EngineResult {
        const bodyAngle = this.bodyAngle(frame);

        if (!this.readyToCount) {
            const readiness = this.isPushupReady(frame, bodyAngle);

            if (!readiness.ready) {
                return this.notReadyResult(
                    readiness.message,
                    readiness.errors,
                    bodyAngle
                );
            }

            this.readyFrames += 1;

            if (this.readyFrames < this.requiredReadyFrames) {
                this.stage = 'ready_hold';

                return createEngineResult({
                    exercise: 'pushup',
                    metrics: {
                        level: this.t.level,
                        variant: this.t.pushupVariant,
                        bodyAngle: bodyAngle !== null ? Number(bodyAngle.toFixed(1)) : null,
                        readyToCount: false,
                        readyFrames: this.readyFrames,
                        requiredReadyFrames: this.requiredReadyFrames,
                        postureScore: 70,
                        validReps: this.validReps,
                        invalidReps: this.invalidReps,
                        repCounted: false,
                    },
                    errors: [],
                    reps: this.reps,
                    stage: 'ready_hold',
                    status: 'Good. Hold the push-up start position for 2 seconds.',
                });
            }

            const elbowAngle =
                average(this.elbowAngles(frame)) ?? this.t.pushupUpAngle;

            this.baselineElbowAngle = elbowAngle;
            this.readyToCount = true;
            this.stage = 'up';

            return createEngineResult({
                exercise: 'pushup',
                metrics: {
                    level: this.t.level,
                    variant: this.t.pushupVariant,
                    bodyAngle: bodyAngle !== null ? Number(bodyAngle.toFixed(1)) : null,
                    baselineElbowAngle: Number(this.baselineElbowAngle.toFixed(1)),
                    readyToCount: true,
                    postureScore: 100,
                    validReps: this.validReps,
                    invalidReps: this.invalidReps,
                    repCounted: false,
                },
                errors: [],
                reps: this.reps,
                stage: 'ready',
                status: 'Good. Start your push-up now.',
            });
        }

        const geometryCheck = this.pushupGeometryOk(frame, bodyAngle);

        if (!geometryCheck.ok) {
            return this.notReadyResult(
                'Pose lost. ' + geometryCheck.message,
                ['ERR_POSE_LOST'],
                bodyAngle
            );
        }

        const elbowAngleRaw = average(this.elbowAngles(frame));

        if (elbowAngleRaw === null) {
            return this.notReadyResult(
                'Show shoulders, elbows and wrists clearly.',
                ['ERR_NO_POSE'],
                bodyAngle
            );
        }

        const elbowAngle = this.smooth(elbowAngleRaw);

        const errors: string[] = [];
        let repCounted = false;
        let validRep = true;

        const baseline = this.baselineElbowAngle || this.t.pushupUpAngle;

        const startBendAngle = Math.min(
            this.t.pushupMinBendAngle,
            baseline - 18
        );

        const returnAngle = Math.max(this.t.pushupUpAngle, baseline - 8);

        if (this.stage === 'up' && elbowAngle < startBendAngle) {
            this.stage = 'going_down';
            this.minElbowAngle = elbowAngle;
            this.downConfirmFrames = 1;
            this.upConfirmFrames = 0;
        }

        if (this.stage === 'going_down' || this.stage === 'down') {
            this.minElbowAngle = Math.min(
                this.minElbowAngle ?? elbowAngle,
                elbowAngle
            );

            if (elbowAngle <= this.t.pushupDownAngle) {
                this.downConfirmFrames += 1;

                if (this.downConfirmFrames >= this.t.debounceFrames) {
                    this.stage = 'down';
                }
            }

            if (elbowAngle >= returnAngle) {
                this.upConfirmFrames += 1;
            } else {
                this.upConfirmFrames = 0;
            }
        }

        if (this.stage === 'down' && this.upConfirmFrames >= this.t.debounceFrames) {
            this.reps += 1;
            repCounted = true;

            if (
                this.minElbowAngle !== null &&
                this.minElbowAngle > this.t.pushupShallowLimit
            ) {
                validRep = false;
                this.invalidReps += 1;
                errors.push('ERR_PUSHUP_SHALLOW');
            } else {
                this.validReps += 1;
            }

            this.stage = 'up';
            this.minElbowAngle = null;
            this.downConfirmFrames = 0;
            this.upConfirmFrames = 0;
            this.baselineElbowAngle = elbowAngle;
        }

        if (
            this.stage === 'going_down' &&
            this.minElbowAngle !== null &&
            this.minElbowAngle > this.t.pushupShallowLimit
        ) {
            errors.push('ERR_PUSHUP_SHALLOW');
        }

        const postureScore = scoreFromErrors(errors, validRep ? 100.0 : 85.0);

        let status =
            this.t.pushupVariant === 'knee'
                ? 'Knee push-up tracking active'
                : 'Push-up tracking active';

        if (this.stage === 'going_down') {
            status = 'Lower your chest with control.';
        } else if (this.stage === 'down') {
            status = 'Good depth. Push back up.';
        } else if (repCounted) {
            status = validRep ? 'Rep counted' : 'Shallow rep detected';
        }

        return createEngineResult({
            exercise: 'pushup',
            metrics: {
                level: this.t.level,
                variant: this.t.pushupVariant,
                elbowAngle: Number(elbowAngle.toFixed(1)),
                baselineElbowAngle:
                    this.baselineElbowAngle !== null
                        ? Number(this.baselineElbowAngle.toFixed(1))
                        : null,
                startBendAngle: Number(startBendAngle.toFixed(1)),
                minElbowAngle:
                    this.minElbowAngle !== null
                        ? Number(this.minElbowAngle.toFixed(1))
                        : null,
                bodyAngle: bodyAngle !== null ? Number(bodyAngle.toFixed(1)) : null,
                targetElbowAngle: this.t.pushupMinBendAngle,
                validDepthAngle: this.t.pushupShallowLimit,
                readyToCount: this.readyToCount,
                validReps: this.validReps,
                invalidReps: this.invalidReps,
                postureScore,
                repCounted,
                lastRepValid: validRep,
            },
            errors,
            reps: this.reps,
            stage: this.stage,
            status,
        });
    }

    reset(): void {
        this.stage = 'not_ready';
        this.readyToCount = false;
        this.readyFrames = 0;

        this.reps = 0;
        this.validReps = 0;
        this.invalidReps = 0;

        this.minElbowAngle = null;
        this.angleHistory = [];

        this.downConfirmFrames = 0;
        this.upConfirmFrames = 0;

        this.baselineElbowAngle = null;
    }
}