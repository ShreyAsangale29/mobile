package com.anonymous.exercisebuddy.mediapipePose

import android.content.Context
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult
import java.util.concurrent.atomic.AtomicBoolean

object PoseBridge {

    private var helper: PoseLandmarkerHelper? = null
    private var onResultCallback: ((String) -> Unit)? = null
    private val isProcessing = AtomicBoolean(false)

    fun attach(context: Context?, onResult: (String) -> Unit) {
        android.util.Log.i("PoseBridge", "attach() called, context=${context != null}")
        if (context == null) return
        onResultCallback = onResult

        helper = PoseLandmarkerHelper(
            context = context,
            onResult = { result ->
                isProcessing.set(false)
                onResultCallback?.invoke(serialize(result))
            },
            onError = { message ->
                isProcessing.set(false)
                android.util.Log.e("PoseBridge", message)
            }
        )
        helper?.initialize()
    }

    fun detach() {
        helper?.close()
        helper = null
        onResultCallback = null
        isProcessing.set(false)
    }

    fun processFrame(bitmap: android.graphics.Bitmap, timestampMs: Long) {
        // If the previous frame hasn't finished inference yet, drop this one
        // instead of queuing it up — prevents landmarks from falling further
        // and further behind real movement over time.
        if (!isProcessing.compareAndSet(false, true)) {
            return
        }
        helper?.detect(bitmap, timestampMs)
    }

    private fun serialize(result: PoseLandmarkerResult): String {
        if (result.landmarks().isEmpty()) return "[]"
        val landmarks = result.landmarks()[0]
        val sb = StringBuilder("[")
        landmarks.forEachIndexed { i, lm ->
            if (i > 0) sb.append(",")
            val visibility = lm.visibility().orElse(null)
            val visibilityJson = if (visibility != null) visibility.toString() else "null"
            sb.append("""{"x":${lm.x()},"y":${lm.y()},"z":${lm.z()},"visibility":$visibilityJson}""")
        }
        sb.append("]")
        return sb.toString()
    }
}