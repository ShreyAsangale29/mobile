export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type PushupVariant = 'auto' | 'standard' | 'knee';

export type EffectivePushupVariant = 'standard' | 'knee';

export type ExerciseThresholds = {
    level: FitnessLevel;
    gender: string;
    pushupVariant: EffectivePushupVariant;

    // Squat angles: hip -> knee -> ankle
    squatStandingAngle: number;
    squatDeepAngle: number;
    squatShallowLimit: number;
    squatMinBendAngle: number;

    // Push-up angles: shoulder -> elbow -> wrist
    pushupUpAngle: number;
    pushupDownAngle: number;
    pushupShallowLimit: number;
    pushupMinBendAngle: number;
    pushupBodyAngleMin: number;

    // Plank alignment: shoulder -> hip -> ankle/knee
    plankGoodAngle: number;
    plankHipOffsetRatio: number;
    plankMinHoldSeconds: number;

    // Deadlift: shoulder -> hip -> knee primary hip hinge angle
    deadliftStandingAngle: number;
    deadliftBottomAngle: number;
    deadliftRepCompleteAngle: number;
    deadliftBackRoundLimit: number;
    deadliftKneeMinAngle: number;

    // Lunge: hip -> knee -> ankle knee angle
    lungeStandingAngle: number;
    lungeFrontKneeTarget: number;
    lungeShallowLimit: number;
    lungeTorsoLeanLimit: number;

    // Signal control
    debounceFrames: number;
    audioCooldownSeconds: number;
};

export function normalizeLevel(level?: string | null): FitnessLevel {
    const normalized = (level || 'intermediate').trim().toLowerCase();

    if (
        normalized === 'beginner' ||
        normalized === 'intermediate' ||
        normalized === 'advanced'
    ) {
        return normalized;
    }

    return 'intermediate';
}

export function getThresholdsForProfile(
    level: string = 'intermediate',
    gender: string = 'unspecified',
    pushupVariant: PushupVariant = 'auto'
): ExerciseThresholds {
    const normalizedLevel = normalizeLevel(level);
    const normalizedGender = (gender || 'unspecified').trim().toLowerCase();
    const normalizedPushupVariant = (pushupVariant || 'auto')
        .trim()
        .toLowerCase() as PushupVariant;

    let effectivePushupVariant: EffectivePushupVariant;

    if (normalizedPushupVariant === 'auto') {
        effectivePushupVariant =
            normalizedLevel === 'beginner' ? 'knee' : 'standard';
    } else if (
        normalizedPushupVariant === 'standard' ||
        normalizedPushupVariant === 'knee'
    ) {
        effectivePushupVariant = normalizedPushupVariant;
    } else {
        effectivePushupVariant = 'standard';
    }

    const presets: Record<
        FitnessLevel,
        Omit<
            ExerciseThresholds,
            'level' | 'gender' | 'pushupVariant' | 'debounceFrames' | 'audioCooldownSeconds'
        >
    > = {
        beginner: {
            squatStandingAngle: 130.0,
            squatDeepAngle: 100.0,
            squatShallowLimit: 110.0,
            squatMinBendAngle: 135.0,

            pushupUpAngle: 140.0,
            pushupDownAngle: 125.0,
            pushupShallowLimit: 132.0,
            pushupMinBendAngle: 138.0,
            pushupBodyAngleMin: 135.0,

            plankGoodAngle: 150.0,
            plankHipOffsetRatio: 0.14,
            plankMinHoldSeconds: 10.0,

            deadliftStandingAngle: 140.0,
            deadliftBottomAngle: 95.0,
            deadliftRepCompleteAngle: 140.0,
            deadliftBackRoundLimit: 82.0,
            deadliftKneeMinAngle: 75.0,

            lungeStandingAngle: 145.0,
            lungeFrontKneeTarget: 125.0,
            lungeShallowLimit: 135.0,
            lungeTorsoLeanLimit: 35.0,
        },

        intermediate: {
            squatStandingAngle: 130.0,
            squatDeepAngle: 120.0,
            squatShallowLimit: 130.0,
            squatMinBendAngle: 140.0,

            pushupUpAngle: 150.0,
            pushupDownAngle: 110.0,
            pushupShallowLimit: 120.0,
            pushupMinBendAngle: 130.0,
            pushupBodyAngleMin: 150.0,

            plankGoodAngle: 160.0,
            plankHipOffsetRatio: 0.1,
            plankMinHoldSeconds: 10.0,

            deadliftStandingAngle: 150.0,
            deadliftBottomAngle: 75.0,
            deadliftRepCompleteAngle: 150.0,
            deadliftBackRoundLimit: 75.0,
            deadliftKneeMinAngle: 90.0,

            lungeStandingAngle: 155.0,
            lungeFrontKneeTarget: 105.0,
            lungeShallowLimit: 120.0,
            lungeTorsoLeanLimit: 25.0,
        },

        advanced: {
            squatStandingAngle: 140.0,
            squatDeepAngle: 105.0,
            squatShallowLimit: 115.0,
            squatMinBendAngle: 125.0,

            pushupUpAngle: 160.0,
            pushupDownAngle: 95.0,
            pushupShallowLimit: 105.0,
            pushupMinBendAngle: 115.0,
            pushupBodyAngleMin: 160.0,

            plankGoodAngle: 165.0,
            plankHipOffsetRatio: 0.07,
            plankMinHoldSeconds: 10.0,

            deadliftStandingAngle: 160.0,
            deadliftBottomAngle: 65.0,
            deadliftRepCompleteAngle: 155.0,
            deadliftBackRoundLimit: 65.0,
            deadliftKneeMinAngle: 105.0,

            lungeStandingAngle: 165.0,
            lungeFrontKneeTarget: 95.0,
            lungeShallowLimit: 110.0,
            lungeTorsoLeanLimit: 18.0,
        },
    };

    return {
        level: normalizedLevel,
        gender: normalizedGender,
        pushupVariant: effectivePushupVariant,
        ...presets[normalizedLevel],
        debounceFrames: 3,
        audioCooldownSeconds: 4.0,
    };
}