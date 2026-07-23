package com.anonymous.exercisebuddy.mediapipePose

import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MediapipePoseModule : Module() {

    override fun definition() = ModuleDefinition {

        Name("MediapipePose")

        Events("onPoseResult", "onPoseError")

        Function("hello") {
            "AuraFit MediaPipe Module Loaded 🚀"
        }

        OnCreate {
            android.util.Log.i("MediapipePose", "Module OnCreate — registering frame processor plugin")
            try {
                FrameProcessorPluginRegistry.addFrameProcessorPlugin("mediapipePose") { proxy, options ->
                    MediapipePoseFrameProcessorPlugin(proxy, options)
                }
            } catch (e: Throwable) {
                android.util.Log.w("MediapipePose", "Frame processor plugin 'mediapipePose' already registered", e)
            }

            PoseBridge.attach(appContext.reactContext) { landmarksJson ->
                sendEvent("onPoseResult", mapOf("landmarks" to landmarksJson))
            }
        }

        OnDestroy {
            PoseBridge.detach()
        }
    }
}