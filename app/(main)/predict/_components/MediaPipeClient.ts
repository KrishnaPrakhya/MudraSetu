import { HolisticLandmarker, FilesetResolver, type HolisticLandmarkerResult } from "@mediapipe/tasks-vision"

// Define the structure of our landmark data for clarity
export interface LandmarkData {
  results: HolisticLandmarkerResult
  keypoints: number[]
}

// Indices now match the focused set used in the Python model training.
const UPPER_BODY_INDICES = [0, 11, 12, 13, 14, 15, 16]
const POSE_LANDMARK_COUNT = 7 * 4 // 7 landmarks, 4 values (x,y,z,visibility)
const HAND_LANDMARK_COUNT = 21 * 3 // 21 landmarks, 3 values (x,y,z)

class MediaPipeClient {
  private holisticLandmarker: HolisticLandmarker | null = null
  private isInitialized = false
  private lastFrameTime = 0
  private frameRateLimit = 15 // Reduce default to 15fps for better performance
  private performanceMode = true // Enable performance mode by default

  async initialize(): Promise<void> {
    if (this.isInitialized) return
    
    try {
      console.log("Initializing MediaPipe client...")
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm",
      )
      
      // Configure options based on performance mode
      const options = {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/latest/holistic_landmarker.task`,
          delegate: this.performanceMode ? "CPU" : "GPU", // Use CPU in performance mode for more consistent performance
          cpuSettings: {
            numThreads: 4 // Use multiple threads for CPU processing
          }
        },
        runningMode: "VIDEO",
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false, // Disable facial transformation matrices
        minTrackingConfidence: this.performanceMode ? 0.3 : 0.5, // Lower confidence threshold in performance mode
        minDetectionConfidence: this.performanceMode ? 0.3 : 0.5, // Lower confidence threshold in performance mode
      }
      
      this.holisticLandmarker = await HolisticLandmarker.createFromOptions(vision, {
        ...{
          ...options,
          baseOptions: {
            ...options.baseOptions,
            delegate: options.baseOptions.delegate as "CPU" | "GPU"
          }
        },
        runningMode: "VIDEO" as const // Explicitly type as RunningMode
      })
      this.isInitialized = true
      console.log("MediaPipe client initialized successfully")
    } catch (error) {
      console.error("Failed to initialize MediaPipe client:", error)
      throw error
    }
  }

  detect(video: HTMLVideoElement): LandmarkData | null {
    if (!this.holisticLandmarker || !this.isInitialized) return null

    const now = performance.now()
    // Implement frame rate limiting to reduce CPU usage
    const minFrameTime = 1000 / this.frameRateLimit
    if (now - this.lastFrameTime < minFrameTime) {
      return null
    }
    
    try {
      // Update last frame time
      this.lastFrameTime = now
      
      // Check if video is ready
      if (video.readyState < 2) return null
      
      // Skip detection if video is paused or ended
      if (video.paused || video.ended) {
        return null
      }
      
      // Perform detection
      const results = this.holisticLandmarker.detectForVideo(video, now)
      const keypoints = this.extractKeypoints(results)
      return { results, keypoints }
    } catch (error) {
      console.error("Error during landmark detection:", error)
      return null
    }
  }
  
  // Allow adjusting frame rate limit
  setFrameRateLimit(fps: number): void {
    this.frameRateLimit = Math.max(1, Math.min(60, fps))
  }
  
  // Toggle performance mode
  setPerformanceMode(enabled: boolean): void {
    this.performanceMode = enabled
  }
  
  // Get current performance mode status
  getPerformanceMode(): boolean {
    return this.performanceMode
  }

  // Pre-allocate arrays to avoid garbage collection
  private poseArray = new Array(POSE_LANDMARK_COUNT).fill(0);
  private leftHandArray = new Array(HAND_LANDMARK_COUNT).fill(0);
  private rightHandArray = new Array(HAND_LANDMARK_COUNT).fill(0);
  private keypointsArray: number[] = [];
  
  private extractKeypoints(results: HolisticLandmarkerResult): number[] {
    // Reset arrays with zeros instead of creating new ones
    this.poseArray.fill(0);
    this.leftHandArray.fill(0);
    this.rightHandArray.fill(0);
    
    // Extract pose landmarks
    if (results.poseLandmarks && results.poseLandmarks[0]) {
      const poseLandmarks = results.poseLandmarks[0];
      for (let i = 0; i < UPPER_BODY_INDICES.length; i++) {
        const idx = UPPER_BODY_INDICES[i];
        const lm = poseLandmarks[idx];
        if (lm) {
          const baseIdx = i * 4;
          this.poseArray[baseIdx] = lm.x;
          this.poseArray[baseIdx + 1] = lm.y;
          this.poseArray[baseIdx + 2] = lm.z;
          this.poseArray[baseIdx + 3] = lm.visibility ?? 0;
        }
      }
    }

    // Extract left hand landmarks
    if (results.leftHandLandmarks && results.leftHandLandmarks[0]) {
      const leftHandLandmarks = results.leftHandLandmarks[0];
      for (let i = 0; i < leftHandLandmarks.length; i++) {
        const lm = leftHandLandmarks[i];
        const baseIdx = i * 3;
        this.leftHandArray[baseIdx] = lm.x;
        this.leftHandArray[baseIdx + 1] = lm.y;
        this.leftHandArray[baseIdx + 2] = lm.z;
      }
    }

    // Extract right hand landmarks
    if (results.rightHandLandmarks && results.rightHandLandmarks[0]) {
      const rightHandLandmarks = results.rightHandLandmarks[0];
      for (let i = 0; i < rightHandLandmarks.length; i++) {
        const lm = rightHandLandmarks[i];
        const baseIdx = i * 3;
        this.rightHandArray[baseIdx] = lm.x;
        this.rightHandArray[baseIdx + 1] = lm.y;
        this.rightHandArray[baseIdx + 2] = lm.z;
      }
    }

    // Combine arrays without creating new ones if possible
    if (!this.keypointsArray.length) {
      // First time initialization
      this.keypointsArray = [...this.poseArray, ...this.leftHandArray, ...this.rightHandArray];
    } else {
      // Copy values to existing array
      const totalLength = POSE_LANDMARK_COUNT + HAND_LANDMARK_COUNT * 2;
      if (this.keypointsArray.length !== totalLength) {
        // Resize if needed
        this.keypointsArray = new Array(totalLength);
      }
      
      // Copy pose data
      for (let i = 0; i < POSE_LANDMARK_COUNT; i++) {
        this.keypointsArray[i] = this.poseArray[i];
      }
      
      // Copy left hand data
      for (let i = 0; i < HAND_LANDMARK_COUNT; i++) {
        this.keypointsArray[POSE_LANDMARK_COUNT + i] = this.leftHandArray[i];
      }
      
      // Copy right hand data
      for (let i = 0; i < HAND_LANDMARK_COUNT; i++) {
        this.keypointsArray[POSE_LANDMARK_COUNT + HAND_LANDMARK_COUNT + i] = this.rightHandArray[i];
      }
    }

    return this.keypointsArray;
  }
}

export const mediaPipeClient = new MediaPipeClient()
