package com.anonymous.exercisebuddy.mediapipePose

import android.content.Context
import android.graphics.Bitmap
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult

class PoseLandmarkerHelper(
    private val context: Context,
    private val onResult: (PoseLandmarkerResult) -> Unit,
    private val onError: (String) -> Unit = {}
) {

    private var poseLandmarker: PoseLandmarker? = null

    fun initialize() {
        try {
            createLandmarker(Delegate.GPU)
            android.util.Log.i("PoseLandmarkerHelper", "Initialized with GPU delegate")
        } catch (e: Exception) {
            android.util.Log.w("PoseLandmarkerHelper", "GPU delegate failed, falling back to CPU", e)
            try {
                createLandmarker(Delegate.CPU)
                android.util.Log.i("PoseLandmarkerHelper", "Initialized with CPU delegate")
            } catch (e2: Exception) {
                onError("Failed to initialize PoseLandmarker: ${e2.message}")
            }
        }
    }

    private fun createLandmarker(delegate: Delegate) {
        val baseOptions = BaseOptions.builder()
            .setModelAssetPath("pose_landmarker_lite.task")
            .setDelegate(delegate)
            .build()

        val options = PoseLandmarker.PoseLandmarkerOptions.builder()
            .setBaseOptions(baseOptions)
            .setRunningMode(RunningMode.LIVE_STREAM)
            .setNumPoses(1)
            .setMinPoseDetectionConfidence(0.75f)
            .setMinPosePresenceConfidence(0.75f)
            .setMinTrackingConfidence(0.75f)
            .setResultListener { result, _ -> onResult(result) }
            .setErrorListener { error -> onError(error.message ?: "Unknown PoseLandmarker error") }
            .build()

        poseLandmarker = PoseLandmarker.createFromOptions(context, options)
    }

    fun detect(bitmap: Bitmap, timestampMs: Long) {
        val landmarker = poseLandmarker ?: return
        val mpImage = BitmapImageBuilder(bitmap).build()
        landmarker.detectAsync(mpImage, timestampMs)
    }

    fun close() {
        poseLandmarker?.close()
        poseLandmarker = null
    }
}