import AsyncStorage from '@react-native-async-storage/async-storage';
import { Landmark } from './authenticityTypes';
import {
    BodySignature,
    createBodySignatureFromLandmarks,
} from './bodySignature';

const SESSION_USER_PROFILE_KEY = 'SESSION_USER_BODY_PROFILE';

export async function saveSessionUserProfileFromLandmarks(
    landmarks: Landmark[]
): Promise<{
    success: boolean;
    profile?: BodySignature;
    message: string;
}> {
    const profile = createBodySignatureFromLandmarks(landmarks);

    if (!profile) {
        return {
            success: false,
            message:
                'Full body not detected. Please stand 2–3 meters away and keep shoulders, hips, and legs visible.',
        };
    }

    await AsyncStorage.setItem(
        SESSION_USER_PROFILE_KEY,
        JSON.stringify(profile)
    );

    return {
        success: true,
        profile,
        message: 'User profile saved successfully.',
    };
}

export async function getSessionUserProfile(): Promise<BodySignature | null> {
    const storedValue = await AsyncStorage.getItem(SESSION_USER_PROFILE_KEY);

    if (!storedValue) {
        return null;
    }

    try {
        return JSON.parse(storedValue) as BodySignature;
    } catch {
        return null;
    }
}

export async function clearSessionUserProfile(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_USER_PROFILE_KEY);
}