package com.anonymous.exercisebuddy.mediapipePose.model

/**
 * Represents the pose detected in a single camera frame.
 */
data class PoseResultData(
    val landmarks: List<PoseLandmarkData>,
    val timestamp: Long,
    val detectionConfidence: Float
)