package com.anonymous.exercisebuddy.mediapipePose

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Matrix
import android.graphics.Rect
import android.graphics.YuvImage
import com.mrousavy.camera.core.types.Orientation
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import java.io.ByteArrayOutputStream

class MediapipePoseFrameProcessorPlugin(
    proxy: VisionCameraProxy,
    options: Map<String, Any>?
) : FrameProcessorPlugin() {

    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
        val bitmap = yuvFrameToBitmap(frame) ?: return null
        PoseBridge.processFrame(bitmap, System.currentTimeMillis())
        return null
    }

    private fun yuvFrameToBitmap(frame: Frame): Bitmap? {
    return try {
        val image = frame.image
        val yBuffer = image.planes[0].buffer
        val uBuffer = image.planes[1].buffer
        val vBuffer = image.planes[2].buffer

        val ySize = yBuffer.remaining()
        val uSize = uBuffer.remaining()
        val vSize = vBuffer.remaining()

        val nv21 = ByteArray(ySize + uSize + vSize)
        yBuffer.get(nv21, 0, ySize)
        vBuffer.get(nv21, ySize, vSize)
        uBuffer.get(nv21, ySize + vSize, uSize)

        // Direct NV21 -> ARGB conversion — no JPEG encode/decode round-trip.
        val rgbBitmap = nv21ToBitmap(nv21, image.width, image.height)

        // Downscale before rotation/inference — the Lite pose model resizes
        // internally anyway, so there's no benefit running it on a full-res frame.
        val maxDim = 480
        val scale = maxDim.toFloat() / maxOf(rgbBitmap.width, rgbBitmap.height)
        val scaledBitmap = if (scale < 1f) {
            Bitmap.createScaledBitmap(
                rgbBitmap,
                (rgbBitmap.width * scale).toInt(),
                (rgbBitmap.height * scale).toInt(),
                true
            )
        } else rgbBitmap

        val rotationDegrees = orientationToDegrees(frame.orientation)
        if (rotationDegrees != 0) {
            val matrix = Matrix()
            matrix.postRotate(rotationDegrees.toFloat())
            Bitmap.createBitmap(scaledBitmap, 0, 0, scaledBitmap.width, scaledBitmap.height, matrix, true)
        } else {
            scaledBitmap
        }
    } catch (e: Exception) {
        android.util.Log.e("MediapipePosePlugin", "Frame conversion failed", e)
        null
    }
}

// Fast NV21 -> ARGB_8888 conversion using integer math, no Context needed.
private fun nv21ToBitmap(nv21: ByteArray, width: Int, height: Int): Bitmap {
    val argb = IntArray(width * height)
    val frameSize = width * height

    var yIndex = 0
    for (j in 0 until height) {
        var uvIndex = frameSize + (j shr 1) * width
        var u = 0
        var v = 0
        for (i in 0 until width) {
            val y = (0xff and nv21[yIndex].toInt()) - 16
            if (i and 1 == 0) {
                v = (0xff and nv21[uvIndex++].toInt()) - 128
                u = (0xff and nv21[uvIndex++].toInt()) - 128
            }
            val y1192 = maxOf(y, 0) * 1192
            var r = y1192 + 1634 * v
            var g = y1192 - 833 * v - 400 * u
            var b = y1192 + 2066 * u

            r = r.coerceIn(0, 262143)
            g = g.coerceIn(0, 262143)
            b = b.coerceIn(0, 262143)

            argb[yIndex] = -0x1000000 or
                ((r shl 6) and 0xff0000) or
                ((g shr 2) and 0xff00) or
                ((b shr 10) and 0xff)
            yIndex++
        }
    }

    return Bitmap.createBitmap(argb, width, height, Bitmap.Config.ARGB_8888)
}
    private fun orientationToDegrees(orientation: Orientation): Int = when (orientation) {
    Orientation.PORTRAIT -> 0
    Orientation.LANDSCAPE_RIGHT -> 90
    Orientation.PORTRAIT_UPSIDE_DOWN -> 180
    Orientation.LANDSCAPE_LEFT -> 270
}
}