"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Hand,
  ArrowRight,
  Sparkles,
  Zap,
  Camera,
  Cpu,
  Target,
  Eye,
  Play,
} from "lucide-react";
import { useRef, useEffect, useState } from "react";

// Animated background component
function AnimatedBackground() {
  const [particles, setParticles] = useState<
    { x: number; y: number; delay: number }[]
  >([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Use fixed seed for consistent particle positions
    const fixedParticles = Array.from({ length: 15 }).map((_, i) => ({
      x: (i * 123.456) % 100, // Use deterministic positioning
      y: (i * 234.567) % 100,
      delay: i * 0.2,
    }));
    setParticles(fixedParticles);
  }, []);

  if (!isClient) {
    return null; // Don't render on server
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-cyan-400/20 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, Math.sin(i) * 50, 0],
            y: [0, Math.cos(i) * 50, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Improved hand gesture component with realistic sign language gestures
function HandGestureDemo() {
  const [currentGesture, setCurrentGesture] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      setCurrentGesture((prev) => (prev + 1) % gestures.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const gestures = [
    {
      name: "Hello",
      paths: [
        // Palm
        "M120 180 Q140 160 160 180 L160 220 Q160 240 140 240 L120 240 Q100 240 100 220 L100 180 Z",
        // Thumb
        "M100 200 Q90 190 85 180 Q85 170 95 165 Q105 170 110 180 Q110 190 100 200 Z",
        // Index finger
        "M120 160 Q125 140 130 120 Q135 115 140 120 Q135 140 130 160 L120 160 Z",
        // Middle finger
        "M140 160 Q145 135 150 110 Q155 105 160 110 Q155 135 150 160 L140 160 Z",
        // Ring finger
        "M160 160 Q165 140 170 125 Q175 120 180 125 Q175 140 170 160 L160 160 Z",
        // Pinky
        "M180 170 Q185 155 190 145 Q195 140 200 145 Q195 155 190 170 L180 170 Z",
      ],
    },
    {
      name: "Peace",
      paths: [
        // Palm
        "M120 180 Q140 160 160 180 L160 220 Q160 240 140 240 L120 240 Q100 240 100 220 L100 180 Z",
        // Thumb (folded)
        "M105 210 Q100 205 98 200 Q100 195 105 200 Q110 205 105 210 Z",
        // Index finger (extended)
        "M120 160 Q125 140 130 120 Q135 115 140 120 Q135 140 130 160 L120 160 Z",
        // Middle finger (extended)
        "M140 160 Q145 135 150 110 Q155 105 160 110 Q155 135 150 160 L140 160 Z",
        // Ring finger (folded)
        "M160 190 Q165 185 170 185 Q175 190 170 195 Q165 195 160 190 Z",
        // Pinky (folded)
        "M175 195 Q180 190 185 190 Q190 195 185 200 Q180 200 175 195 Z",
      ],
    },
    {
      name: "Thumbs Up",
      paths: [
        // Palm (sideways)
        "M140 200 Q160 190 170 210 L170 240 Q170 250 160 250 L140 250 Q130 250 130 240 L130 210 Q130 190 140 200 Z",
        // Thumb (up)
        "M140 190 Q145 170 150 150 Q155 145 160 150 Q155 170 150 190 L140 190 Z",
        // Other fingers (folded)
        "M170 220 Q180 215 185 220 Q180 225 175 225 Q170 225 170 220 Z",
        "M170 230 Q180 225 185 230 Q180 235 175 235 Q170 235 170 230 Z",
        "M170 240 Q180 235 185 240 Q180 245 175 245 Q170 245 170 240 Z",
        "M165 250 Q175 245 180 250 Q175 255 170 255 Q165 255 165 250 Z",
      ],
    },
    {
      name: "Thank You",
      paths: [
        // Palm (flat, facing forward)
        "M120 180 Q140 160 160 180 L160 220 Q160 240 140 240 L120 240 Q100 240 100 220 L100 180 Z",
        // All fingers extended
        "M100 200 Q95 190 90 180 Q95 175 100 180 Q105 190 100 200 Z", // Thumb
        "M120 160 Q125 140 130 120 Q135 115 140 120 Q135 140 130 160 L120 160 Z", // Index
        "M140 160 Q145 135 150 110 Q155 105 160 110 Q155 135 150 160 L140 160 Z", // Middle
        "M160 160 Q165 140 170 125 Q175 120 180 125 Q175 140 170 160 L160 160 Z", // Ring
        "M180 170 Q185 155 190 145 Q195 140 200 145 Q195 155 190 170 L180 170 Z", // Pinky
      ],
    },
  ];

  // Fixed particle positions to prevent hydration mismatch
  const particlePositions = [
    { angle: 0, radius: 140 },
    { angle: 0.52, radius: 140 },
    { angle: 1.05, radius: 140 },
    { angle: 1.57, radius: 140 },
    { angle: 2.09, radius: 140 },
    { angle: 2.62, radius: 140 },
    { angle: 3.14, radius: 140 },
    { angle: 3.67, radius: 140 },
    { angle: 4.19, radius: 140 },
    { angle: 4.71, radius: 140 },
    { angle: 5.24, radius: 140 },
    { angle: 5.76, radius: 140 },
  ];

  if (!isClient) {
    return (
      <div className="relative w-80 h-80 mx-auto flex items-center justify-center">
        <div className="w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-400/30" />
      </div>
    );
  }

  return (
    <div className="relative w-80 h-80 mx-auto flex items-center justify-center">
      {/* Outer recognition circle */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3],
          borderColor: [
            "rgba(34, 211, 238, 0.3)",
            "rgba(168, 85, 247, 0.4)",
            "rgba(34, 211, 238, 0.3)",
          ],
        }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
      />

      {/* Hand gesture SVG */}
      <div className="relative w-64 h-64">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 0 20px rgba(34, 211, 238, 0.3))" }}
        >
          <defs>
            <linearGradient
              id="handGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render current gesture */}
          {gestures[currentGesture].paths.map((path, index) => (
            <motion.path
              key={`${currentGesture}-${index}`}
              d={path}
              fill="url(#handGradient)"
              stroke="rgba(34, 211, 238, 0.6)"
              strokeWidth="1"
              filter="url(#glow)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </svg>

        {/* Hand landmark points */}
        {Array.from({ length: 21 }).map((_, i) => {
          // Define realistic hand landmark positions for current gesture
          const landmarks = {
            0: [
              // Hello - open hand
              [150, 240],
              [130, 220],
              [120, 200],
              [115, 180],
              [110, 165], // Thumb
              [140, 220],
              [135, 180],
              [130, 140],
              [130, 120], // Index
              [150, 220],
              [150, 180],
              [150, 135],
              [150, 110], // Middle
              [160, 220],
              [165, 180],
              [170, 140],
              [170, 125], // Ring
              [170, 225],
              [180, 185],
              [190, 155],
              [190, 145], // Pinky
            ],
            1: [
              // Peace sign
              [150, 240],
              [105, 215],
              [105, 205],
              [105, 195],
              [105, 185], // Thumb (folded)
              [140, 220],
              [135, 180],
              [130, 140],
              [130, 120], // Index (up)
              [150, 220],
              [150, 180],
              [150, 135],
              [150, 110], // Middle (up)
              [160, 220],
              [165, 195],
              [170, 190],
              [170, 185], // Ring (folded)
              [170, 225],
              [180, 200],
              [185, 195],
              [185, 190], // Pinky (folded)
            ],
            2: [
              // Thumbs up
              [150, 240],
              [145, 220],
              [150, 190],
              [150, 170],
              [150, 150], // Thumb (up)
              [170, 240],
              [175, 230],
              [180, 225],
              [185, 220], // Index (folded)
              [170, 245],
              [175, 240],
              [180, 235],
              [185, 230], // Middle (folded)
              [170, 250],
              [175, 245],
              [180, 240],
              [185, 235], // Ring (folded)
              [165, 255],
              [170, 250],
              [175, 245],
              [180, 240], // Pinky (folded)
            ],
            3: [
              // Thank you - open hand
              [150, 240],
              [130, 220],
              [120, 200],
              [100, 190],
              [90, 180], // Thumb
              [140, 220],
              [135, 180],
              [130, 140],
              [130, 120], // Index
              [150, 220],
              [150, 180],
              [150, 135],
              [150, 110], // Middle
              [160, 220],
              [165, 180],
              [170, 140],
              [170, 125], // Ring
              [170, 225],
              [180, 185],
              [190, 155],
              [190, 145], // Pinky
            ],
          };

          const currentLandmarks = landmarks[currentGesture as keyof typeof landmarks] || landmarks[0];
          const [x, y] = currentLandmarks[i] || [150, 200];

          return (
            <motion.div
              key={`landmark-${currentGesture}-${i}`}
              className="absolute w-2 h-2 rounded-full bg-cyan-400"
              style={{
                left: `${(x / 300) * 100}%`,
                top: `${(y / 300) * 100}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 8px rgba(34, 211, 238, 0.8)",
                zIndex: 10,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.05,
              }}
            />
          );
        })}
      </div>

      {/* Floating particles around hand */}
      {particlePositions.map((pos, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-cyan-400/60"
          style={{
            left: "50%",
            top: "50%",
            marginLeft: -4,
            marginTop: -4,
          }}
          animate={{
            x: Math.cos(pos.angle) * pos.radius,
            y: Math.sin(pos.angle) * pos.radius,
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Gesture label */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 backdrop-blur-md border border-cyan-400/40 rounded-lg"
        key={currentGesture}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-sm font-medium text-cyan-100 flex items-center">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-400 mr-2"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
          Recognizing: {gestures[currentGesture].name}
        </span>
      </motion.div>
    </div>
  );
}

// Updated gesture recognition text component
function GestureRecognitionText() {
  const words = ["Hello", "Peace", "Thumbs Up", "Thank You"];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000); // Sync with hand gesture timing
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-12 overflow-hidden">
      {words.map((word, index) => (
        <motion.div
          key={word}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ y: 40, opacity: 0 }}
          animate={{
            y: index === currentWord ? 0 : index < currentWord ? -40 : 40,
            opacity: index === currentWord ? 1 : 0,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <span className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
            {word}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// Neural network visualization
function NeuralNetworkVisualization() {
  return (
    <div className="relative w-full h-32 overflow-hidden">
      <svg className="w-full h-full">
        {/* Network layers */}
        {[0, 1, 2].map((layer) => (
          <g key={`layer-${layer}`}>
            {Array.from({ length: layer === 1 ? 6 : 4 }).map((_, node) => (
              <motion.circle
                key={`node-${layer}-${node}`}
                cx={`${20 + layer * 30}%`}
                cy={`${20 + node * 15}%`}
                r="4"
                fill="url(#nodeGradient)"
                animate={{
                  r: [4, 6, 4],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: layer * 0.2 + node * 0.1,
                }}
              />
            ))}
          </g>
        ))}

        {/* Connections */}
        {[0, 1].map((layer) =>
          Array.from({ length: layer === 0 ? 4 : 6 }).map((_, from) =>
            Array.from({ length: layer === 0 ? 6 : 4 }).map((_, to) => (
              <motion.line
                key={`connection-${layer}-${from}-${to}`}
                x1={`${20 + layer * 30}%`}
                y1={`${20 + from * 15}%`}
                x2={`${20 + (layer + 1) * 30}%`}
                y2={`${20 + to * 15}%`}
                stroke="url(#connectionGradient)"
                strokeWidth="1"
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  strokeWidth: [1, 2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: layer * 0.3 + from * 0.1 + to * 0.05,
                }}
              />
            ))
          )
        )}

        <defs>
          <linearGradient id="nodeGradient">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="connectionGradient">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-cyan-950 relative overflow-hidden"
    >
      <AnimatedBackground />

      {/* Hero Section */}
      <motion.section
        style={{ y, opacity }}
        className="pt-20 pb-16 px-6 relative"
      >
        <div className="container mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto relative z-10"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            >
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent bg-size-200">
                MudraSetu
              </span>
              <br />
              <span className="text-5xl md:text-6xl bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Intelligence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-cyan-100/80 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              Transform sign language into text with our advanced AI-powered
              gesture recognition platform. Real-time processing, exceptional
              accuracy, and seamless integration for inclusive communication.
            </motion.p>

            {/* Main demo section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mb-12"
            >
              <div className="grid md:grid-cols-2 gap-12 items-center bg-gradient-to-r from-slate-900/40 to-purple-900/20 p-8 rounded-3xl border border-cyan-400/20 backdrop-blur-sm">
                <div className="order-2 md:order-1">
                  <HandGestureDemo />
                </div>
                <div className="order-1 md:order-2 text-left">
                  <h3 className="text-3xl font-bold text-cyan-100 mb-6">
                    Real-time Gesture Recognition
                  </h3>
                  <p className="text-cyan-100/70 mb-6 text-lg">
                    Our advanced AI model detects and interprets hand gestures
                    with exceptional accuracy, providing instant feedback and
                    translation.
                  </p>

                  <div className="bg-slate-900/60 p-6 rounded-xl border border-cyan-400/20 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-cyan-100/70">Recognized Gesture:</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-sm text-green-400">Active</span>
                      </div>
                    </div>
                    <GestureRecognitionText />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      <span className="text-cyan-100/70">
                        30+ FPS Processing
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <span className="text-cyan-100/70">99.2% Accuracy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hand className="h-4 w-4 text-cyan-400" />
                      <span className="text-cyan-100/70">50+ Gestures</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-cyan-400" />
                      <span className="text-cyan-100/70">Edge Computing</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/predict">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-10 py-6 text-lg font-semibold rounded-xl"
                >
                  <Brain className="mr-3 h-6 w-6" />
                  Start Recognition
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/visualize">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400 px-10 py-6 text-lg font-semibold rounded-xl bg-transparent"
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  Explore 3D View
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent mb-6">
              Advanced AI Features
            </h2>
            <p className="text-cyan-100/70 text-xl max-w-3xl mx-auto">
              Cutting-edge technology powering seamless sign language
              recognition and translation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "Real-time Processing",
                description:
                  "Live webcam integration with instant AI-powered gesture recognition at 30+ FPS",
                gradient: "from-cyan-500 to-blue-600",
                delay: 0,
              },
              {
                icon: Brain,
                title: "Neural Intelligence",
                description:
                  "Advanced deep learning models trained on diverse sign language datasets",
                gradient: "from-purple-500 to-pink-600",
                delay: 0.2,
              },
              {
                icon: Eye,
                title: "3D Visualization",
                description:
                  "Interactive three-dimensional gesture representation with real-time tracking",
                gradient: "from-pink-500 to-cyan-600",
                delay: 0.4,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.8 }}
                whileHover={{ y: -5 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-slate-900/50 to-purple-900/30 border border-cyan-400/20 backdrop-blur-xl hover:border-cyan-400/50 transition-all duration-500 h-full">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className={`inline-flex p-6 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6`}
                      whileHover={{ scale: 1.05, rotate: 2 }}
                    >
                      <feature.icon className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-cyan-100 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-cyan-100/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-3xl p-12 border border-cyan-400/20 backdrop-blur-xl"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent mb-6">
                  Experience the Future of Communication
                </h2>
                <p className="text-cyan-100/80 text-lg mb-8 leading-relaxed">
                  Our platform bridges the communication gap with advanced AI
                  technology, making sign language accessible to everyone
                  through real-time translation.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: Zap, label: "Fast Processing", value: "30+ FPS" },
                    { icon: Target, label: "High Accuracy", value: "99.2%" },
                    {
                      icon: Hand,
                      label: "Gesture Library",
                      value: "50+ Signs",
                    },
                    { icon: Cpu, label: "Edge Computing", value: "Local AI" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-slate-900/50 p-4 rounded-lg border border-cyan-400/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className="h-5 w-5 text-cyan-400" />
                        <h4 className="font-semibold text-cyan-100 text-sm">
                          {stat.label}
                        </h4>
                      </div>
                      <p className="text-cyan-400 font-bold">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/predict">
                    <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-4">
                      <Play className="mr-2 h-5 w-5" />
                      Try Live Demo
                    </Button>
                  </Link>
                  <Link href="/visualize">
                    <Button
                      variant="outline"
                      className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 px-8 py-4 bg-transparent"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Explore 3D
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="bg-slate-900/70 rounded-xl border border-cyan-400/30 p-6 backdrop-blur-md">
                  {/* Simulated interface */}
                  <div className="aspect-video bg-black/50 rounded-lg mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Circular gesture tracking */}
                        <motion.div
                          className="w-32 h-32 rounded-full border-2 border-cyan-400/50"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                          }}
                        />

                        {/* Tracking points */}
                        {Array.from({ length: 12 }).map((_, i) => {
                          const angle = (i / 12) * Math.PI * 2;
                          const radius = 50;
                          return (
                            <motion.div
                              key={i}
                              className="absolute w-2 h-2 rounded-full bg-cyan-400"
                              style={{
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                              }}
                              animate={{
                                x: Math.cos(angle) * radius,
                                y: Math.sin(angle) * radius,
                                scale: [1, 1.5, 1],
                                opacity: [0.6, 1, 0.6],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.1,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* UI overlays */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-xs text-cyan-100/80 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                        Recording
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                      <span className="text-xs text-cyan-100/80">FPS: 30</span>
                    </div>
                  </div>

                  {/* Recognition results */}
                  <div className="bg-slate-950/50 rounded-lg p-4 border border-cyan-400/20">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-semibold text-cyan-100">
                        Recognition Results
                      </h4>
                      <span className="text-xs text-cyan-400">Live</span>
                    </div>
                    <div className="space-y-2">
                      <motion.div
                        className="flex justify-between items-center p-2 rounded bg-cyan-400/10 border border-cyan-400/30"
                        animate={{
                          backgroundColor: [
                            "rgba(34, 211, 238, 0.1)",
                            "rgba(34, 211, 238, 0.2)",
                            "rgba(34, 211, 238, 0.1)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      >
                        <span className="text-cyan-100 font-medium">Hello</span>
                        <span className="text-cyan-400 text-sm">92%</span>
                      </motion.div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-800/30">
                        <span className="text-cyan-100/70">Thank You</span>
                        <span className="text-cyan-400/70 text-sm">45%</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-800/30">
                        <span className="text-cyan-100/70">Help</span>
                        <span className="text-cyan-400/70 text-sm">28%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Neural Network Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-cyan-100 mb-4">
              Powered by Advanced Neural Networks
            </h2>
            <p className="text-cyan-100/70 text-lg max-w-3xl mx-auto mb-8">
              Our AI model processes gesture data through multiple layers of
              neural networks, ensuring accurate and reliable sign language
              recognition.
            </p>
            <div className="bg-gradient-to-r from-slate-900/50 to-purple-900/30 rounded-2xl p-8 border border-cyan-400/20 backdrop-blur-sm">
              <NeuralNetworkVisualization />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-cyan-400/20 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Hand className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              MudraSetu
            </span>
          </div>
          <p className="text-cyan-100/50">
            © 2025 MudraSetu AI. Bridging communication through intelligent
            technology.
          </p>
        </div>
      </footer>
    </div>
  );
}
