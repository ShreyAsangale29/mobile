import {
    EngineFeedback,
    FeedbackInput,
} from './engineFeedbackTypes';

function getNumber(value: unknown, fallback = 0): number {
    return typeof value === 'number' && !Number.isNaN(value) ? value : fallback;
}

function createFeedback(
    code: string,
    message: string,
    voiceMessage: string,
    severity: EngineFeedback['severity'],
    category: EngineFeedback['category'],
    shouldSpeak = true
): EngineFeedback {
    return {
        code,
        message,
        voiceMessage,
        severity,
        category,
        shouldSpeak,
    };
}

function getCameraOrAuthenticityFeedback(input: FeedbackInput): EngineFeedback | null {
    const status = input.authenticity?.status ?? input.feedbackCode;

    switch (status) {
        case 'NO_POSE':
            return createFeedback(
                'NO_POSE',
                'No user detected. Please stand fully visible in front of the camera.',
                'No user detected. Please stand fully visible in front of the camera.',
                'error',
                'CAMERA'
            );

        case 'PARTIAL_POSE':
            return createFeedback(
                'PARTIAL_POSE',
                'Full body is not visible. Move back and keep your body inside the frame.',
                'Move back. Keep your full body visible.',
                'warning',
                'CAMERA'
            );

        case 'LOW_CONFIDENCE':
            return createFeedback(
                'LOW_CONFIDENCE',
                'Pose confidence is low. Improve lighting and face the camera clearly.',
                'Lighting is low. Please face the camera clearly.',
                'warning',
                'CAMERA'
            );

        case 'MULTIPLE_PERSONS':
            return createFeedback(
                'MULTIPLE_PERSONS',
                'Multiple people detected. Only one person should be visible.',
                'Only one person should be visible.',
                'error',
                'CAMERA'
            );

        case 'CAMERA_OBSTRUCTED':
            return createFeedback(
                'CAMERA_OBSTRUCTED',
                'Camera may be obstructed. Please clear the camera view.',
                'Camera view is blocked. Please clear the camera.',
                'error',
                'CAMERA'
            );

        case 'STATIC_IMAGE_SUSPECTED':
            return createFeedback(
                'STATIC_IMAGE_SUSPECTED',
                'Static image suspected. Reps will not be counted.',
                'Static photo detected. Please perform the exercise live.',
                'error',
                'AUTHENTICITY'
            );

        case 'DIFFERENT_USER_SUSPECTED':
            return createFeedback(
                'DIFFERENT_USER_SUSPECTED',
                'Different user suspected. Continue with the same person.',
                'Different user suspected. Please continue with the same person.',
                'error',
                'AUTHENTICITY'
            );

        case 'USER_PROFILE_BUILDING':
            return createFeedback(
                'USER_PROFILE_BUILDING',
                'User verification in progress. Stay in frame.',
                'Stay in frame for a few seconds.',
                'info',
                'AUTHENTICITY',
                false
            );

        case 'SETUP_PROFILE_LOADING':
            return createFeedback(
                'SETUP_PROFILE_LOADING',
                'Loading setup user profile. Please wait.',
                'Loading setup user profile. Please wait.',
                'info',
                'AUTHENTICITY',
                false
            );

        case 'SETUP_PROFILE_MISSING':
            return createFeedback(
                'SETUP_PROFILE_MISSING',
                'Setup user profile not found. Please complete camera check again.',
                'Setup user profile not found. Please complete camera check again.',
                'error',
                'AUTHENTICITY'
            );

        default:
            return null;
    }
}

function getExerciseSpecificFeedback(input: FeedbackInput): EngineFeedback {
    const postureScore = getNumber(input.postureScore, 0);
    const validRepCount = getNumber(input.validRepCount, 0);
    const invalidRepCount = getNumber(input.invalidRepCount, 0);

    if (invalidRepCount > 0 && invalidRepCount >= validRepCount) {
        return createFeedback(
            'TOO_MANY_INVALID_REPS',
            'Your form needs correction. Slow down and follow the guidance.',
            'Slow down. Focus on your form.',
            'warning',
            'REP_COUNT'
        );
    }

    if (postureScore >= 85) {
        return createFeedback(
            'GOOD_FORM',
            'Good form. Continue the same movement.',
            'Good form. Keep going.',
            'success',
            'POSTURE',
            false
        );
    }

    if (postureScore > 0 && postureScore < 50) {
        return createFeedback(
            'POOR_FORM',
            getPoorFormMessage(input.mode),
            getPoorFormVoiceMessage(input.mode),
            'warning',
            'POSTURE'
        );
    }

    return createFeedback(
        'CONTINUE',
        getDefaultMessage(input.mode),
        getDefaultVoiceMessage(input.mode),
        'info',
        'SESSION',
        false
    );
}

function getPoorFormMessage(mode: FeedbackInput['mode']): string {
    switch (mode) {
        case 'squat':
            return 'Squat form needs correction. Keep your back straight and go lower.';
        case 'pushup':
            return 'Push-up form needs correction. Keep your body straight and lower your chest properly.';
        case 'plank':
            return 'Plank form needs correction. Keep your hips aligned and hold your body straight.';
        case 'lunge':
            return 'Lunge form needs correction. Keep your front knee aligned and maintain balance.';
        case 'deadlift':
            return 'Deadlift form needs correction. Keep your back straight and hinge from your hips.';
        default:
            return 'Posture needs correction. Adjust your form.';
    }
}

function getPoorFormVoiceMessage(mode: FeedbackInput['mode']): string {
    switch (mode) {
        case 'squat':
            return 'Keep your back straight and go lower.';
        case 'pushup':
            return 'Keep your body straight and lower your chest.';
        case 'plank':
            return 'Hold your plank. Keep your hips aligned.';
        case 'lunge':
            return 'Keep your knee aligned and stay balanced.';
        case 'deadlift':
            return 'Straighten your back and hinge from your hips.';
        default:
            return 'Correct your posture.';
    }
}

function getDefaultMessage(mode: FeedbackInput['mode']): string {
    switch (mode) {
        case 'squat':
            return 'Continue squats with controlled movement.';
        case 'pushup':
            return 'Continue push-ups with steady pace.';
        case 'plank':
            return 'Hold plank position and breathe steadily.';
        case 'lunge':
            return 'Continue lunges with balance and control.';
        case 'deadlift':
            return 'Continue deadlifts with a straight back.';
        default:
            return 'Continue your workout.';
    }
}

function getDefaultVoiceMessage(mode: FeedbackInput['mode']): string {
    switch (mode) {
        case 'squat':
            return 'Continue squats.';
        case 'pushup':
            return 'Continue push-ups.';
        case 'plank':
            return 'Hold the plank.';
        case 'lunge':
            return 'Continue lunges.';
        case 'deadlift':
            return 'Continue deadlifts.';
        default:
            return 'Continue.';
    }
}

export function enhanceExerciseFeedback(input: FeedbackInput): EngineFeedback {
    const cameraOrAuthFeedback = getCameraOrAuthenticityFeedback(input);

    if (cameraOrAuthFeedback) {
        return cameraOrAuthFeedback;
    }

    if (input.feedback && input.feedback.trim().length > 0) {
        return createFeedback(
            input.feedbackCode ?? 'ENGINE_FEEDBACK',
            input.feedback,
            input.feedback,
            input.canCountRep === false ? 'warning' : 'info',
            input.canCountRep === false ? 'FORM' : 'SESSION',
            input.canCountRep === false
        );
    }

    return getExerciseSpecificFeedback(input);
}
