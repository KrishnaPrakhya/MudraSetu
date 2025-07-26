import { memo, useEffect } from "react";
import type { RefObject } from "react";

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarkCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

function VideoDisplay({
  videoRef,
  landmarkCanvasRef,
  canvasRef,
}: VideoDisplayProps) {
  // Apply performance optimizations to video element
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // Set video attributes for better performance
      videoElement.setAttribute('disablePictureInPicture', 'true');
      videoElement.setAttribute('disableRemotePlayback', 'true');
      
      // Lower quality for better performance
      if (videoElement.srcObject instanceof MediaStream) {
        const videoTrack = videoElement.srcObject.getVideoTracks()[0];
        if (videoTrack) {
          try {
            // Apply constraints to reduce resolution for better performance
            videoTrack.applyConstraints({
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { max: 30 }
            }).catch(err => console.error('Failed to apply video constraints:', err));
          } catch (error) {
            console.error('Error applying video constraints:', error);
          }
        }
      }
    }
  }, [videoRef]);

  return (
    <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden border-2 border-cyan-400/30">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas
        ref={landmarkCanvasRef}
        id="landmarks-canvas"
        className="absolute top-0 left-0 w-full h-full"
        style={{ 
          pointerEvents: "none",
          willChange: "transform", // Optimize for animations
        }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

export default memo(VideoDisplay);
