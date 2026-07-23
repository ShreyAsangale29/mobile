package com.anonymous.exercisebuddy.mediapipePose.helpers

import com.anonymous.exercisebuddy.mediapipePose.model.PoseLandmarkData
import com.anonymous.exercisebuddy.mediapipePose.model.PoseResultData
import com.google.mediapipe.tasks.components.containers.NormalizedLandmark
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult

/**
 * Converts Google's MediaPipe result into AuraFit's internal data model.
 */
object PoseMapper {

    fun map(
        result: PoseLandmarkerResult,
        timestamp: Long
    ): PoseResultData {

        val landmarks = mutableListOf<PoseLandmarkData>()

        if (result.landmarks().isNotEmpty()) {

            val firstPose = result.landmarks()[0]

            firstPose.forEach { landmark: NormalizedLandmark ->

                landmarks.add(
                    PoseLandmarkData(
                        x = landmark.x(),
                        y = landmark.y(),
                        z = landmark.z(),
                        visibility = landmark.visibility().orElse(0f)
                    )
                )
            }
        }

        return PoseResultData(
            landmarks = landmarks,
            timestamp = timestamp,
            detectionConfidence = if (landmarks.isNotEmpty()) 1f else 0f
        )
    }
}