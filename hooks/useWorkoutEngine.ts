import { useCallback, useEffect, useRef, useState } from 'react';

import {
    PoseFrame,
    EngineResult,
    getThresholdsForProfile,
    SquatEngine,
    PushupEngine,
    PlankEngine,
    LungeEngine,
    DeadliftEngine,
} from '../lib/exercise-engine';

import {
    LivenessValidator,
    SameUserValidator,
    getSessionUserProfile,
    createBodySignatureFromLandmarks,
    compareBodySignatures,
    BodySignature,
} from '../lib/exercise-engine/authenticity';

import {
    enhanceExerciseFeedback,
    EngineFeedback,
} from '../lib/exercise-engine/feedback';

export type WorkoutMode =
    | 'squat'
    | 'pushup'
    | 'plank'
    | 'lunge'
    | 'deadlift';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type PushupVariant = 'auto' | 'standard' | 'knee';

type UseWorkoutEngineOptions = {
    mode: WorkoutMode;
    level?: FitnessLevel;
    gender?: string;
    pushupVariant?: PushupVariant;
    referenceLandmarks?: any;
};

type WorkoutEngine =
    | SquatEngine
    | PushupEngine
    | PlankEngine
    | LungeEngine
    | DeadliftEngine;

type AuthLandmark = {
    x: number;
    y: number;
    z?: number;
    visibility?: number;
};

type EngineResultWithAuthenticity = EngineResult & {
    feedbackCode?: string;
    canCountRep?: boolean;
    enhancedFeedback?: EngineFeedback;
    voiceMessage?: string;
    shouldSpeak?: boolean;
    repCount?: number;
    validRepCount?: number;
    invalidRepCount?: number;
    postureScore?: number;
    feedback?: string;
    authenticity?: {
        status: string;
        isValidUser: boolean;
        isLive: boolean;
        confidence: number;
        reason: string;
        feedbackMessage: string;
        motionScore: number;
        visibleLandmarkCount: number;
        setupUserStatus?: string;
        setupUserConfidence?: number;
        setupUserReason?: string;
        sameUserStatus?: string;
        sameUserConfidence?: number;
        sameUserReason?: string;
    };
};

function createEngine(options: UseWorkoutEngineOptions): WorkoutEngine {
    const thresholds = getThresholdsForProfile(
        options.level ?? 'beginner',
        options.gender ?? 'unspecified',
        options.pushupVariant ?? 'auto'
    );

    switch (options.mode) {
        case 'squat':
            return new SquatEngine(thresholds);

        case 'pushup':
            return new PushupEngine(thresholds);

        case 'plank':
            return new PlankEngine(thresholds);

        case 'lunge':
            return new LungeEngine(thresholds);

        case 'deadlift':
            return new DeadliftEngine(thresholds);

        default:
            return new SquatEngine(thresholds);
    }
}

function getNumberValue(value: unknown, fallback = 0): number {
    return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function getFrameLandmarks(frame: PoseFrame): AuthLandmark[] {
    const rawFrame = frame as any;

    const sourceLandmarks =
        rawFrame.rawLandmarks ??
        rawFrame.landmarks ??
        [];

    return sourceLandmarks.map((lm: any) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
    }));
}

function createBlockedEngineResult(
    previousResult: EngineResultWithAuthenticity | null,
    feedback: string,
    feedbackCode: string,
    authenticity: EngineResultWithAuthenticity['authenticity'],
    mode: WorkoutMode
): EngineResultWithAuthenticity {
    const previousReps = previousResult?.repCount ?? (previousResult as any)?.reps;
    const previousValidReps =
        previousResult?.validRepCount ?? (previousResult as any)?.metrics?.validReps;
    const previousInvalidReps =
        previousResult?.invalidRepCount ?? (previousResult as any)?.metrics?.invalidReps;

    const baseResult: EngineResultWithAuthenticity = {
        ...(previousResult ?? ({} as EngineResult)),

        reps: getNumberValue(previousReps, 0),
        repCount: getNumberValue(previousReps, 0),
        validRepCount: getNumberValue(previousValidReps, 0),
        invalidRepCount: getNumberValue(previousInvalidReps, 0),

        postureScore: 0,
        feedback,
        feedbackCode,
        canCountRep: false,
        authenticity,
    };

    const enhancedFeedback = enhanceExerciseFeedback({
        mode,
        repCount: baseResult.repCount,
        validRepCount: baseResult.validRepCount,
        invalidRepCount: baseResult.invalidRepCount,
        postureScore: baseResult.postureScore,
        feedback: baseResult.feedback,
        feedbackCode: baseResult.feedbackCode,
        canCountRep: baseResult.canCountRep,
        authenticity: baseResult.authenticity,
    });

    return {
        ...baseResult,
        enhancedFeedback,
        voiceMessage: enhancedFeedback.voiceMessage,
        shouldSpeak: enhancedFeedback.shouldSpeak,
    };
}

export function useWorkoutEngine({
    mode,
    level = 'beginner',
    gender = 'unspecified',
    pushupVariant = 'auto',
    referenceLandmarks,
}: UseWorkoutEngineOptions) {
    const [result, setResult] = useState<EngineResultWithAuthenticity | null>(null);

    const optionsRef = useRef<UseWorkoutEngineOptions>({
        mode,
        level,
        gender,
        pushupVariant,
        referenceLandmarks,
    });

    const engineRef = useRef<WorkoutEngine>(
        createEngine({
            mode,
            level,
            gender,
            pushupVariant,
        })
    );

    const livenessValidatorRef = useRef(
        new LivenessValidator({
            minVisibleLandmarks: 12,
            minVisibility: 0.45,
            minMotionScore: 0.004,
            staticFrameLimit: 35,
            warmupFrames: 10,
        })
    );

    const sameUserValidatorRef = useRef(new SameUserValidator());

    const setupUserProfileRef = useRef<BodySignature | null>(null);
    const setupProfileLoadedRef = useRef(false);

    const latestResultRef = useRef<EngineResultWithAuthenticity | null>(null);

    useEffect(() => {
        const nextOptions: UseWorkoutEngineOptions = {
            mode,
            level,
            gender,
            pushupVariant,
            referenceLandmarks,
        };

        optionsRef.current = nextOptions;
        engineRef.current = createEngine(nextOptions);

        livenessValidatorRef.current.reset();
        sameUserValidatorRef.current.reset();

        if (referenceLandmarks && referenceLandmarks.length > 0) {
            sameUserValidatorRef.current.enrollReference(referenceLandmarks);
        }

        latestResultRef.current = null;
        setResult(null);

        setupProfileLoadedRef.current = false;

        const loadSetupUserProfile = async () => {
            setupUserProfileRef.current = await getSessionUserProfile();
            setupProfileLoadedRef.current = true;

            console.log(
                '[WorkoutEngine] Setup profile loaded:',
                setupUserProfileRef.current
            );
        };

        loadSetupUserProfile();
    }, [mode, level, gender, pushupVariant, referenceLandmarks]);

    const processFrame = useCallback((frame: PoseFrame) => {
        const authLandmarks = getFrameLandmarks(frame);

        const authFrame = {
            landmarks: authLandmarks,
            timestamp: Date.now(),
        };

        if (!setupProfileLoadedRef.current) {
            const blockedResult = createBlockedEngineResult(
                latestResultRef.current,
                'Loading setup user profile. Please wait.',
                'SETUP_PROFILE_LOADING',
                {
                    status: 'SETUP_PROFILE_LOADING',
                    isValidUser: false,
                    isLive: true,
                    confidence: 0,
                    reason: 'Setup profile is still loading from local storage.',
                    feedbackMessage: 'Loading setup user profile. Please wait.',
                    motionScore: 0,
                    visibleLandmarkCount: authLandmarks.length,
                },
                mode
            );

            latestResultRef.current = blockedResult;
            setResult(blockedResult);

            return blockedResult;
        }

        if (!setupUserProfileRef.current) {
            const blockedResult = createBlockedEngineResult(
                latestResultRef.current,
                'Setup user profile not found. Please complete camera check again.',
                'SETUP_PROFILE_MISSING',
                {
                    status: 'SETUP_PROFILE_MISSING',
                    isValidUser: false,
                    isLive: true,
                    confidence: 0,
                    reason: 'No setup profile found in local storage.',
                    feedbackMessage:
                        'Setup user profile not found. Please complete camera check again.',
                    motionScore: 0,
                    visibleLandmarkCount: authLandmarks.length,
                },
                mode
            );

            latestResultRef.current = blockedResult;
            setResult(blockedResult);

            return blockedResult;
        }

        const authenticityResult = livenessValidatorRef.current.validate(authFrame);

        if (!authenticityResult.isValidUser) {
            const blockedResult = createBlockedEngineResult(
                latestResultRef.current,
                authenticityResult.feedbackMessage,
                authenticityResult.status,
                authenticityResult,
                mode
            );

            latestResultRef.current = blockedResult;
            setResult(blockedResult);

            return blockedResult;
        }

        const setupUserProfile = setupUserProfileRef.current;

        if (setupUserProfile) {
            const currentBodySignature =
                createBodySignatureFromLandmarks(authLandmarks);

            if (!currentBodySignature) {
                const blockedResult = createBlockedEngineResult(
                    latestResultRef.current,
                    'Full body is required to verify the workout user.',
                    'SETUP_USER_PROFILE_NOT_VISIBLE',
                    {
                        status: 'SETUP_USER_PROFILE_NOT_VISIBLE',
                        isValidUser: false,
                        isLive: true,
                        confidence: 0.4,
                        reason: 'Could not create current body signature from workout frame.',
                        feedbackMessage:
                            'Please keep your full body visible for user verification.',
                        motionScore: 0,
                        visibleLandmarkCount: authLandmarks.length,
                    },
                    mode
                );

                latestResultRef.current = blockedResult;
                setResult(blockedResult);

                return blockedResult;
            }

            const comparison = compareBodySignatures(
                setupUserProfile,
                currentBodySignature
            );

            if (!comparison.isSameUser) {
                console.log('[WorkoutEngine] Setup user mismatch:', comparison);

                const blockedResult = createBlockedEngineResult(
                    latestResultRef.current,
                    'User mismatch detected. The workout user does not match the setup photo.',
                    'SETUP_USER_MISMATCH',
                    {
                        status: 'SETUP_USER_MISMATCH',
                        isValidUser: false,
                        isLive: true,
                        confidence: Math.max(0, 1 - comparison.differenceScore),
                        reason: comparison.reason,
                        feedbackMessage:
                            'User mismatch detected. Please continue with the same person captured during setup.',
                        motionScore: comparison.differenceScore,
                        visibleLandmarkCount: authLandmarks.length,
                        setupUserStatus: 'SETUP_USER_MISMATCH',
                        setupUserConfidence: Math.max(0, 1 - comparison.differenceScore),
                        setupUserReason: comparison.reason,
                    },
                    mode
                );

                latestResultRef.current = blockedResult;
                setResult(blockedResult);

                return blockedResult;
            }
        }

        const sameUserResult = sameUserValidatorRef.current.validate(authFrame);

        if (!sameUserValidatorRef.current.hasReference && authenticityResult.isValidUser) {
            sameUserValidatorRef.current.enrollReference(authLandmarks);
        }

        const sameUserPassed =
            (sameUserResult as any).isSameUser === true ||
            (sameUserResult as any).isValidUser === true;

        if (!sameUserPassed) {
            const combinedAuthenticity = {
                ...authenticityResult,
                status: (sameUserResult as any).status ?? 'DIFFERENT_USER_SUSPECTED',
                sameUserStatus: (sameUserResult as any).status,
                sameUserConfidence: (sameUserResult as any).confidence,
                sameUserReason: (sameUserResult as any).reason,
            };

            const blockedResult = createBlockedEngineResult(
                latestResultRef.current,
                (sameUserResult as any).feedbackMessage ??
                'Different user suspected. Please continue with the same person.',
                (sameUserResult as any).status ?? 'DIFFERENT_USER_SUSPECTED',
                combinedAuthenticity,
                mode
            );

            latestResultRef.current = blockedResult;
            setResult(blockedResult);

            return blockedResult;
        }

        const rawEngineResult = engineRef.current.update(frame);

        const repCount = (rawEngineResult as any).reps ?? 0;
        const validRepCount = (rawEngineResult as any).metrics?.validReps ?? 0;
        const invalidRepCount = (rawEngineResult as any).metrics?.invalidReps ?? 0;
        const postureScore = (rawEngineResult as any).metrics?.postureScore ?? 100;
        const feedback = (rawEngineResult as any).status;

        const combinedAuthenticity = {
            ...authenticityResult,
            setupUserStatus: setupUserProfile ? 'SETUP_USER_MATCHED' : 'SETUP_USER_NOT_AVAILABLE',
            setupUserConfidence: 1,
            setupUserReason: setupUserProfile
                ? 'Workout user matches setup photo profile.'
                : 'No setup profile found. Camera check may have been skipped.',
            sameUserStatus: (sameUserResult as any).status,
            sameUserConfidence: (sameUserResult as any).confidence,
            sameUserReason: (sameUserResult as any).reason,
        };

        const enhancedFeedback = enhanceExerciseFeedback({
            mode,
            repCount,
            validRepCount,
            invalidRepCount,
            postureScore,
            feedback,
            feedbackCode: 'LIVE_USER_SETUP_MATCHED_AND_SAME_USER',
            canCountRep: true,
            authenticity: combinedAuthenticity,
        });

        const nextResult = {
            ...rawEngineResult,
            repCount,
            validRepCount,
            invalidRepCount,
            postureScore,
            feedback,
            feedbackCode: 'LIVE_USER_SETUP_MATCHED_AND_SAME_USER',
            canCountRep: true,
            authenticity: combinedAuthenticity,
            enhancedFeedback,
            voiceMessage: enhancedFeedback.voiceMessage,
            shouldSpeak: enhancedFeedback.shouldSpeak,
        } as EngineResultWithAuthenticity;

        latestResultRef.current = nextResult;
        setResult(nextResult);

        return nextResult;
    }, [mode]);

    const reset = useCallback(() => {
        if (typeof engineRef.current.reset === 'function') {
            engineRef.current.reset();
        }

        livenessValidatorRef.current.reset();
        sameUserValidatorRef.current.reset();

        const loadSetupUserProfile = async () => {
            setupUserProfileRef.current = await getSessionUserProfile();
        };

        loadSetupUserProfile();

        latestResultRef.current = null;
        setResult(null);
    }, []);

    return {
        result,
        processFrame,
        reset,
        currentMode: mode,
        currentLevel: level,
    };
}