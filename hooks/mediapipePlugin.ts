import { requireNativeModule, EventEmitter } from "expo-modules-core";
import { VisionCameraProxy } from "react-native-vision-camera";

let nativeModule: any = null;
let poseEmitter: any = null;
let plugin: any = null;
let isNativeAvailable = false;

try {
  nativeModule = requireNativeModule("MediapipePose");
  poseEmitter = new (EventEmitter as any)(nativeModule);
  isNativeAvailable = true;
  plugin = VisionCameraProxy.initFrameProcessorPlugin("mediapipePose", {});
  console.log("MediapipePose native module loaded successfully");
} catch (e) {
  console.warn("MediapipePose native module not available:", e);
  isNativeAvailable = false;
}

export { nativeModule, poseEmitter, plugin, isNativeAvailable };