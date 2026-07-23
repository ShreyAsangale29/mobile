export type EngineResult = {
    exercise: string;
    metrics: Record<string, any>;
    errors: string[];
    reps: number;
    stage: string;
    status: string;
};

export function createEngineResult(
    result: Partial<EngineResult> & { exercise: string }
): EngineResult {
    return {
        exercise: result.exercise,
        metrics: result.metrics ?? {},
        errors: result.errors ?? [],
        reps: result.reps ?? 0,
        stage: result.stage ?? 'unknown',
        status: result.status ?? '',
    };
}