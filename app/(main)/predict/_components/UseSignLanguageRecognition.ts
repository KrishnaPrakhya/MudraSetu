"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { HolisticLandmarkerResult } from "@mediapipe/tasks-vision"
import { type LandmarkData, mediaPipeClient } from "./MediaPipeClient"

interface PredictionResponse {
  status: "prediction" | "buffering" | "low_confidence" | "error"
  prediction?: string
  confidence?: number
  progress?: number
  message?: string
}

interface AggregatedPrediction {
  id: string
  prediction: string
  confidence: number
  timestamp: Date
  count: number
}

interface Stats {
  totalPredictions: number
  averageConfidence: number
  sessionDuration: number
  topPredictions: { [key: string]: number }
}

interface Settings {
  confidenceThreshold: number
  poseColor: string
  leftHandColor: string
  rightHandColor: string
  speechRate: number
  speechPitch: number
  autoSpeak: boolean
  performanceMode: boolean
  frameRateLimit: number
}

export function useSignLanguageRecognition() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const sessionStartTime = useRef<Date | null>(null)

  const [isCapturing, setIsCapturing] = useState(false)
  const [landmarks, setLandmarks] = useState<HolisticLandmarkerResult | null>(null)
  const [predictions, setPredictions] = useState<string[]>([])
  const [aggregatedPredictions, setAggregatedPredictions] = useState<AggregatedPrediction[]>([])
  const [isBuffering, setIsBuffering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState<Stats>({
    totalPredictions: 0,
    averageConfidence: 0,
    sessionDuration: 0,
    topPredictions: {},
  })
  const [settings, setSettings] = useState<Settings>({
    confidenceThreshold: 70,
    poseColor: "#FF0000",
    leftHandColor: "#00FF00",
    rightHandColor: "#0000FF",
    speechRate: 1,
    speechPitch: 1,
    autoSpeak: false,
    performanceMode: true, // Enable performance mode by default
    frameRateLimit: 15, // Lower frame rate for better performance
  })

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionStartTime.current) {
        const duration = (Date.now() - sessionStartTime.current.getTime()) / 1000
        setStats((prev) => ({ ...prev, sessionDuration: duration }))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const updateStats = useCallback((prediction: string, confidence: number) => {
    setStats((prev) => {
      const newTopPredictions = { ...prev.topPredictions }
      newTopPredictions[prediction] = (newTopPredictions[prediction] || 0) + 1

      const totalPredictions = prev.totalPredictions + 1
      const averageConfidence = (prev.averageConfidence * prev.totalPredictions + confidence) / totalPredictions

      return {
        ...prev,
        totalPredictions,
        averageConfidence,
        topPredictions: newTopPredictions,
      }
    })
  }, [])

  const addAggregatedPrediction = useCallback((prediction: string, confidence: number) => {
    setAggregatedPredictions((prev) => {
      const existing = prev.find((p) => p.prediction === prediction)
      if (existing) {
        return prev.map((p) =>
          p.prediction === prediction
            ? { ...p, count: p.count + 1, confidence: Math.max(p.confidence, confidence), timestamp: new Date() }
            : p,
        )
      } else {
        return [
          {
            id: Date.now().toString(),
            prediction,
            confidence,
            timestamp: new Date(),
            count: 1,
          },
          ...prev,
        ].slice(0, 50) // Keep last 50 predictions
      }
    })
  }, [])

  const speakPredictions = useCallback(() => {
    if (aggregatedPredictions.length === 0) {
      const utterance = new SpeechSynthesisUtterance("No predictions to speak")
      speechSynthesis.speak(utterance)
      return
    }

    const text = aggregatedPredictions
      .sort((a, b) => b.count - a.count)
      .map((p) => `${p.prediction} (${p.count} times)`)
      .join(", ")

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = settings.speechRate
    utterance.pitch = settings.speechPitch
    speechSynthesis.speak(utterance)
  }, [aggregatedPredictions, settings.speechRate, settings.speechPitch])

  const clearPredictions = useCallback(() => {
    setPredictions([])
    setAggregatedPredictions([])
    setStats((prev) => ({
      ...prev,
      totalPredictions: 0,
      averageConfidence: 0,
      topPredictions: {},
    }))
  }, [])

  const exportPredictions = useCallback(() => {
    const data = {
      predictions: aggregatedPredictions,
      stats,
      exportTime: new Date().toISOString(),
      sessionDuration: stats.sessionDuration,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sign-predictions-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [aggregatedPredictions, stats])

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updatedSettings = { ...prev, ...newSettings }
      
      // Apply performance settings to MediaPipeClient
      if (newSettings.performanceMode !== undefined) {
        mediaPipeClient.setPerformanceMode(newSettings.performanceMode)
      }
      
      if (newSettings.frameRateLimit !== undefined) {
        mediaPipeClient.setFrameRateLimit(newSettings.frameRateLimit)
      }
      
      return updatedSettings
    })
  }, [])

  const connectSocket = useCallback(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/predict")

    socket.onopen = () => {
      console.log("WebSocket connection established.")
    }

    socket.onmessage = (event) => {
      try {
        const data: PredictionResponse = JSON.parse(event.data)

        if (data.status === "prediction" && data.prediction && data.confidence) {
          setIsBuffering(false)
          const confidence = data.confidence

          if (confidence >= settings.confidenceThreshold) {
            const newPrediction = `${data.prediction} (${confidence.toFixed(1)}%)`
            setPredictions((prev) => [newPrediction, ...prev].slice(0, 10))

            addAggregatedPrediction(data.prediction, confidence)
            updateStats(data.prediction, confidence)

            if (settings.autoSpeak) {
              const utterance = new SpeechSynthesisUtterance(data.prediction)
              utterance.rate = settings.speechRate
              utterance.pitch = settings.speechPitch
              speechSynthesis.speak(utterance)
            }
          }
        } else if (data.status === "buffering" && data.progress) {
          setIsBuffering(true)
          setProgress(data.progress)
        } else if (data.status === "low_confidence") {
          setIsBuffering(false)
        } else if (data.status === "error") {
          console.error("Backend error:", data.message)
          setIsBuffering(false)
        }
      } catch (error) {
        console.error("Failed to parse prediction message:", error)
      }
    }

    socket.onclose = () => {
      console.log("WebSocket connection closed.")
    }

    socket.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    socketRef.current = socket
  }, [
    settings.confidenceThreshold,
    settings.autoSpeak,
    settings.speechRate,
    settings.speechPitch,
    addAggregatedPrediction,
    updateStats,
  ])

  // Track FPS for performance monitoring
  const fpsRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)
  const lastFpsUpdateRef = useRef<number>(0)
  
  const runDetection = useCallback(async () => {
    // Calculate FPS every second
    const now = performance.now()
    frameCountRef.current++
    
    if (now - lastFpsUpdateRef.current >= 1000) {
      fpsRef.current = Math.round(frameCountRef.current * 1000 / (now - lastFpsUpdateRef.current))
      frameCountRef.current = 0
      lastFpsUpdateRef.current = now
    }
    
    if (videoRef.current) {
      // Use the optimized detect method with frame rate limiting
      const landmarkData: LandmarkData | null = mediaPipeClient.detect(videoRef.current)

      if (landmarkData) {
        // Use a function state update to avoid unnecessary re-renders
        setLandmarks(landmarkData.results)

        // Only send data if socket is open and we have keypoints
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          const keypoints = landmarkData.keypoints
          // Use a more efficient way to send data
          try {
            socketRef.current.send(JSON.stringify(keypoints))
          } catch (error) {
            console.error("Error sending keypoints to server:", error)
          }
        }
      }
    }
    
    // Use requestAnimationFrame for smoother performance
    animationFrameId.current = requestAnimationFrame(runDetection)
  }, [])

  const toggleCapture = useCallback(async () => {
    if (isCapturing) {
      setIsCapturing(false)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      if (socketRef.current) {
        socketRef.current.close()
      }
      setLandmarks(null)
      sessionStartTime.current = null
    } else {
      setIsCapturing(true)
      setPredictions([])
      setIsBuffering(false)
      setProgress(0)
      sessionStartTime.current = new Date()
      
      // Apply performance settings before starting detection
      mediaPipeClient.setPerformanceMode(settings.performanceMode)
      mediaPipeClient.setFrameRateLimit(settings.frameRateLimit)
      
      await mediaPipeClient.initialize()
      connectSocket()
      runDetection()
    }
  }, [isCapturing, runDetection, connectSocket, settings.performanceMode, settings.frameRateLimit])

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  // Expose FPS for UI display
  const [fps, setFps] = useState(0)
  
  // Update FPS for UI display
  useEffect(() => {
    if (!isCapturing) return
    
    const fpsInterval = setInterval(() => {
      setFps(fpsRef.current)
    }, 500) // Update FPS display twice per second
    
    return () => clearInterval(fpsInterval)
  }, [isCapturing])
  
  return {
    videoRef,
    landmarks,
    predictions,
    aggregatedPredictions,
    isCapturing,
    toggleCapture,
    isBuffering,
    progress,
    speakPredictions,
    clearPredictions,
    exportPredictions,
    stats,
    settings,
    updateSettings,
    fps, // Expose actual FPS to components
  }
}
