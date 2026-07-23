package com.anonymous.exercisebuddy.mediapipePose.model

/**
 * Represents a single MediaPipe pose landmark.
 *
 * x, y are normalized coordinates (0.0 - 1.0)
 * z represents relative depth
 * visibility is MediaPipe's confidence that the landmark is visible.
 */
data class PoseLandmarkData(
    val x: Float,
    val y: Float,
    val z: Float,
    val visibility: Float
)