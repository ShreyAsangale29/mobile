const penalties: Record<string, number> = {
    ERR_NO_POSE: 40,

    ERR_SQUAT_NOT_VERTICAL: 25,
    ERR_SQUAT_SHALLOW: 15,

    ERR_PUSHUP_NOT_HORIZONTAL: 25,
    ERR_PUSHUP_SHALLOW: 15,
    ERR_PUSHUP_BODY_ALIGNMENT: 20,

    ERR_PLANK_NOT_HORIZONTAL: 30,
    ERR_PLANK_ALIGNMENT: 20,
    ERR_PLANK_HIP_LOW: 18,
    ERR_PLANK_HIP_HIGH: 18,

    ERR_TREE_NOT_DETECTED: 30,
    ERR_TREE_UNSTABLE: 20,

    ERR_COBRA_NOT_DETECTED: 30,
    ERR_COBRA_LOW_CHEST: 15,
    ERR_COBRA_LEGS_BENT: 15,

    ERR_WARRIOR_NOT_DETECTED: 30,
    ERR_WARRIOR_FRONT_KNEE: 15,
    ERR_WARRIOR_BACK_LEG: 15,

    ERR_DEADLIFT_ROUNDED_BACK: 25,
    ERR_DEADLIFT_INCOMPLETE_HINGE: 15,
    ERR_DEADLIFT_SQUATTING: 20,

    ERR_LUNGE_SHALLOW: 15,
    ERR_LUNGE_TORSO_LEAN: 18,
    ERR_LUNGE_KNEE_OVER_TOE: 18,
};

export function scoreFromErrors(errors: string[], base = 100.0): number {
    const uniqueErrors = Array.from(new Set(errors));

    const penalty = uniqueErrors.reduce((total, error) => {
        return total + (penalties[error] ?? 10);
    }, 0);

    return Math.max(0.0, Math.min(100.0, base - penalty));
}

export function levelLabel(level?: string | null): string {
    return (level || 'intermediate').trim().toLowerCase();
}