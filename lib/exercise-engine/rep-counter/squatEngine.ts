import { ExerciseThresholds } from '../config/thresholds';
import {
    average,
    calculateAngle,
    distance,
    isHorizontal,
    Point,
} from '../angle-calculation/geometry';
import {
    LEFT_ANKLE,
    LEFT_HIP,
    LEFT_KNEE,
    RIGHT_ANKLE,
    RIGHT_HIP,
    RIGHT_KNEE,
    LEFT_SHOULDER,
    RIGHT_SHOULDER,
    PoseFrame,
    point,
    visible,
} from '../landmark-extraction/landmarks';
import { scoreFromErrors } from '../posture-validator/scoring';
import { EngineResult, createEngineResult } from '../types/EngineResult';

export class SquatEngine {
    private t: ExerciseThresholds;

    private stage = 'not_ready';
    private readyToCount = false;
    private readyFrames = 0;

    private reps = 0;
    private validReps = 0;
    private invalidReps = 0;

    private minAngleInRep: number | null = null;
    private angleHistory: number[] = [];

    private downConfirmFrames = 0;
    private upConfirmFrames = 0;

    private requiredReadyFrames: number;
    private standingBaselineAngle: number | null = null;

    constructor(thresholds: ExerciseThresholds) {
        this.t = thresholds;

        const baseReady = this.t.level === 'beginner' ? 12 : 24;
        this.requiredReadyFrames = Math.max(
            baseReady,
            Math.floor(this.t.debounceFrames * 4)
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

    private bodyPoints(frame: PoseFrame): {
        shoulder: Point | null;
        hip: Point | null;
        knee: Point | null;
        ankle: Point | null;
    } {
        const shoulder = this.avgPoint([
            point(frame, LEFT_SHOULDER),
            point(frame, RIGHT_SHOULDER),
        ]);

        const hip = this.avgPoint([
            point(frame, LEFT_HIP),
            point(frame, RIGHT_HIP),
        ]);

        const knee = this.avgPoint([
            point(frame, LEFT_KNEE),
            point(frame, RIGHT_KNEE),
        ]);

        const ankle = this.avgPoint([
            point(frame, LEFT_ANKLE),
            point(frame, RIGHT_ANKLE),
        ]);

        return {
            shoulder,
            hip,
            knee,
            ankle,
        };
    }

    private kneeAngles(frame: PoseFrame): number[] {
        const angles: number[] = [];

        const leftHip = point(frame, LEFT_HIP);
        const leftKnee = point(frame, LEFT_KNEE);
        const leftAnkle = point(frame, LEFT_ANKLE);

        if (
            leftHip &&
            leftKnee &&
            leftAnkle &&
            visible(frame, LEFT_HIP) &&
            visible(frame, LEFT_KNEE) &&
            visible(frame, LEFT_ANKLE)
        ) {
            angles.push(calculateAngle(leftHip, leftKnee, leftAnkle));
        }

        const rightHip = point(frame, RIGHT_HIP);
        const rightKnee = point(frame, RIGHT_KNEE);
        const rightAnkle = point(frame, RIGHT_ANKLE);

        if (
            rightHip &&
            rightKnee &&
            rightAnkle &&
            visible(frame, RIGHT_HIP) &&
            visible(frame, RIGHT_KNEE) &&
            visible(frame, RIGHT_ANKLE)
        ) {
            angles.push(calculateAngle(rightHip, rightKnee, rightAnkle));
        }

        return angles;
    }

    private fullBodyVisible(frame: PoseFrame): boolean {
        const required = [
            LEFT_SHOULDER,
            RIGHT_SHOULDER,
            LEFT_HIP,
            RIGHT_HIP,
            LEFT_KNEE,
            RIGHT_KNEE,
            LEFT_ANKLE,
            RIGHT_ANKLE,
        ];

        let visibilityThreshold = 0.4;
        let minVisible = 6;

        if (this.t.level === 'beginner') {
            visibilityThreshold = 0.35;
            minVisible = 5;
        } else if (this.t.level === 'advanced') {
            visibilityThreshold = 0.4;
            minVisible = 7;
        }

        const visibleCount = required.reduce((count, id) => {
            const landmarkPoint = point(frame, id);
            const isVisible = visible(frame, id, visibilityThreshold);

            return landmarkPoint && isVisible ? count + 1 : count;
        }, 0);

        return visibleCount >= minVisible;
    }

    private standingGeometryOk(frame: PoseFrame): {
        ok: boolean;
        message: string;
    } {
        const { shoulder, hip, knee, ankle } = this.bodyPoints(frame);

        if (!shoulder || !hip || !knee || !ankle) {
            return {
                ok: false,
                message: 'Keep shoulder, hip, knee and ankle visible.',
            };
        }

        const height = Math.max(1, frame.height);
        const level = this.t.level;

        const yMargin = Math.max(8, Math.floor(height * 0.025));

        if (!(shoulder.y + yMargin < hip.y && hip.y < knee.y && knee.y < ankle.y - yMargin)) {
            return {
                ok: false,
                message: 'Stand upright first. Do not start from sitting posture.',
            };
        }

        const minBodyRatio =
            level === 'beginner' ? 0.3 : level === 'intermediate' ? 0.35 : 0.38;

        const bodyHeight = ankle.y - shoulder.y;

        if (bodyHeight < height * minBodyRatio) {
            return {
                ok: false,
                message: 'Move back so your full body is visible before starting squat.',
            };
        }

        const torsoVertical = Math.abs(hip.y - shoulder.y);
        const torsoHorizontal = Math.abs(hip.x - shoulder.x);

        const torsoRatio = level === 'advanced' ? 1.1 : 1.0;
        const minTorsoVertical = level === 'beginner' ? 15 : 20;

        if (
            torsoVertical < Math.max(minTorsoVertical, torsoHorizontal * torsoRatio)
        ) {
            return {
                ok: false,
                message: 'Keep torso upright before starting squat.',
            };
        }

        const thighLength = distance(hip, knee);
        const shinLength = distance(knee, ankle);

        if (thighLength < height * 0.08 || shinLength < height * 0.08) {
            return {
                ok: false,
                message: 'Move back and keep legs clearly visible.',
            };
        }

        const ratio = thighLength / Math.max(1.0, shinLength);

        let ratioLow = 0.4;
        let ratioHigh = 2.5;

        if (level === 'beginner') {
            ratioLow = 0.35;
            ratioHigh = 2.8;
        } else if (level === 'advanced') {
            ratioLow = 0.42;
            ratioHigh = 2.3;
        }

        if (ratio < ratioLow || ratio > ratioHigh) {
            return {
                ok: false,
                message: 'Leg landmarks are not stable. Stand fully visible.',
            };
        }

        return {
            ok: true,
            message: 'Standing start pose detected.',
        };
    }

    private isSquatReady(
        frame: PoseFrame,
        kneeAngle: number,
        horizontal: boolean
    ): {
        ready: boolean;
        message: string;
        errors: string[];
    } {
        if (!this.fullBodyVisible(frame)) {
            return {
                ready: false,
                message: 'Keep full body visible: shoulder, hip, knee and ankle.',
                errors: ['ERR_NO_POSE'],
            };
        }

        if (horizontal) {
            return {
                ready: false,
                message:
                    'Stand upright first. Squat tracking starts only from standing position.',
                errors: ['ERR_SQUAT_NOT_VERTICAL'],
            };
        }

        const geometryCheck = this.standingGeometryOk(frame);

        if (!geometryCheck.ok) {
            return {
                ready: false,
                message: geometryCheck.message,
                errors: ['ERR_SQUAT_START_POSITION'],
            };
        }

        let readyMinAngle: number;

        if (this.t.level === 'beginner') {
            readyMinAngle = Math.max(100.0, this.t.squatStandingAngle - 20);
        } else if (this.t.level === 'intermediate') {
            readyMinAngle = Math.max(105.0, this.t.squatStandingAngle - 20);
        } else {
            readyMinAngle = Math.max(110.0, this.t.squatStandingAngle - 15);
        }

        if (kneeAngle < readyMinAngle) {
            return {
                ready: false,
                message: 'Stand straight first; squat counting has not started.',
                errors: ['ERR_SQUAT_START_POSITION'],
            };
        }

        return {
            ready: true,
            message: 'Hold standing position. Squat tracking will start.',
            errors: [],
        };
    }

    private notReadyResult(
        message: string,
        errors: string[],
        kneeAngle: number | null
    ): EngineResult {
        this.readyToCount = false;
        this.readyFrames = 0;
        this.stage = 'not_ready';
        this.minAngleInRep = null;
        this.downConfirmFrames = 0;
        this.upConfirmFrames = 0;
        this.standingBaselineAngle = null;

        return createEngineResult({
            exercise: 'squat',
            metrics: {
                level: this.t.level,
                kneeAngle: kneeAngle !== null ? Number(kneeAngle.toFixed(1)) : null,
                readyToCount: false,
                readyFrames: 0,
                validReps: this.validReps,
                invalidReps: this.invalidReps,
                postureScore: 0,
                repCounted: false,
            },
            errors,
            reps: this.reps,
            stage: 'not_ready',
            status: message,
        });
    }

    update(frame: PoseFrame): EngineResult {
        const horizontal = isHorizontal(
            point(frame, LEFT_SHOULDER),
            point(frame, RIGHT_SHOULDER),
            point(frame, LEFT_ANKLE),
            point(frame, RIGHT_ANKLE),
            point(frame, LEFT_HIP),
            point(frame, RIGHT_HIP)
        );

        const kneeAngleRaw = average(this.kneeAngles(frame));

        if (kneeAngleRaw === null) {
            return this.notReadyResult(
                'Show hip, knee and ankle clearly.',
                ['ERR_NO_POSE'],
                null
            );
        }

        const kneeAngle = this.smooth(kneeAngleRaw);

        if (!this.readyToCount) {
            const readiness = this.isSquatReady(frame, kneeAngle, horizontal);

            if (!readiness.ready) {
                return this.notReadyResult(
                    readiness.message,
                    readiness.errors,
                    kneeAngle
                );
            }

            this.readyFrames += 1;

            if (this.readyFrames < this.requiredReadyFrames) {
                this.stage = 'ready_hold';

                return createEngineResult({
                    exercise: 'squat',
                    metrics: {
                        level: this.t.level,
                        kneeAngle: Number(kneeAngle.toFixed(1)),
                        readyToCount: false,
                        readyFrames: this.readyFrames,
                        requiredReadyFrames: this.requiredReadyFrames,
                        validReps: this.validReps,
                        invalidReps: this.invalidReps,
                        postureScore: 70,
                        repCounted: false,
                    },
                    errors: [],
                    reps: this.reps,
                    stage: 'ready_hold',
                    status: 'Good. Hold standing posture for 2 seconds.',
                });
            }

            this.readyToCount = true;
            this.stage = 'standing';
            this.standingBaselineAngle = kneeAngle;

            return createEngineResult({
                exercise: 'squat',
                metrics: {
                    level: this.t.level,
                    kneeAngle: Number(kneeAngle.toFixed(1)),
                    baselineKneeAngle: Number(this.standingBaselineAngle.toFixed(1)),
                    readyToCount: true,
                    validReps: this.validReps,
                    invalidReps: this.invalidReps,
                    postureScore: 100,
                    repCounted: false,
                },
                errors: [],
                reps: this.reps,
                stage: 'ready',
                status: 'Good. Start your squat now.',
            });
        }

        const poseLost = horizontal || kneeAngleRaw === null;

        if (poseLost) {
            return this.notReadyResult(
                'Pose lost. Stand upright and show full body again.',
                ['ERR_POSE_LOST'],
                kneeAngle
            );
        }

        const errors: string[] = [];
        let repCounted = false;
        let validRep = true;

        const baseline = this.standingBaselineAngle || this.t.squatStandingAngle;
        const startBendAngle = Math.min(
            this.t.squatMinBendAngle,
            baseline - 18
        );

        let returnAngle: number;

        if (this.t.level === 'advanced') {
            returnAngle = Math.max(this.t.squatStandingAngle, baseline - 8);
        } else {
            returnAngle = Math.max(this.t.squatDeepAngle + 15, baseline * 0.88);
        }

        if (this.stage === 'standing' && kneeAngle < startBendAngle) {
            this.stage = 'going_down';
            this.minAngleInRep = kneeAngle;
            this.downConfirmFrames = 1;
            this.upConfirmFrames = 0;
        }

        if (this.stage === 'going_down' || this.stage === 'down') {
            this.minAngleInRep = Math.min(this.minAngleInRep ?? kneeAngle, kneeAngle);

            if (kneeAngle <= this.t.squatDeepAngle) {
                this.downConfirmFrames += 1;

                if (this.downConfirmFrames >= this.t.debounceFrames) {
                    this.stage = 'down';
                }
            }

            if (kneeAngle >= returnAngle) {
                this.upConfirmFrames += 1;
            } else {
                this.upConfirmFrames = 0;
            }
        }

        if (
            this.stage === 'down' &&
            this.upConfirmFrames >= this.t.debounceFrames
        ) {
            this.reps += 1;
            repCounted = true;

            if (
                this.minAngleInRep !== null &&
                this.minAngleInRep > this.t.squatShallowLimit
            ) {
                validRep = false;
                this.invalidReps += 1;
                errors.push('ERR_SQUAT_SHALLOW');
            } else {
                this.validReps += 1;
            }

            this.stage = 'standing';
            this.minAngleInRep = null;
            this.downConfirmFrames = 0;
            this.upConfirmFrames = 0;
            this.standingBaselineAngle = kneeAngle;
        }

        if (
            this.stage === 'going_down' &&
            this.minAngleInRep !== null &&
            this.minAngleInRep > this.t.squatShallowLimit
        ) {
            errors.push('ERR_SQUAT_SHALLOW');
        }

        const postureScore = scoreFromErrors(errors, validRep ? 100.0 : 85.0);

        let status = 'Squat tracking active';

        if (this.stage === 'going_down') {
            status = 'Go lower with control.';
        } else if (this.stage === 'down') {
            status = 'Good depth. Stand back up.';
        } else if (repCounted) {
            status = validRep ? 'Rep counted' : 'Shallow rep detected';
        }

        return createEngineResult({
            exercise: 'squat',
            metrics: {
                level: this.t.level,
                kneeAngle: Number(kneeAngle.toFixed(1)),
                baselineKneeAngle:
                    this.standingBaselineAngle !== null
                        ? Number(this.standingBaselineAngle.toFixed(1))
                        : null,
                startBendAngle: Number(startBendAngle.toFixed(1)),
                minAngleInRep:
                    this.minAngleInRep !== null
                        ? Number(this.minAngleInRep.toFixed(1))
                        : null,
                targetDeepAngle: this.t.squatDeepAngle,
                validDepthAngle: this.t.squatShallowLimit,
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

        this.minAngleInRep = null;
        this.angleHistory = [];

        this.downConfirmFrames = 0;
        this.upConfirmFrames = 0;

        this.standingBaselineAngle = null;
    }
}