"use client";
import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DeviceSelectorProps {
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
  selectedVideoDeviceId: string;
  selectedAudioDeviceId: string;
  onVideoDeviceChange: (deviceId: string) => void;
  onAudioDeviceChange: (deviceId: string) => void;
}

function DeviceSelector({
  videoDevices,
  audioDevices,
  selectedVideoDeviceId,
  selectedAudioDeviceId,
  onVideoDeviceChange,
  onAudioDeviceChange,
}: DeviceSelectorProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
      <div className="space-y-2">
        <Label htmlFor="video-device">Camera</Label>
        <Select
          value={selectedVideoDeviceId}
          onValueChange={onVideoDeviceChange}
        >
          <SelectTrigger id="video-device" className="w-full">
            <SelectValue placeholder="Select camera" />
          </SelectTrigger>
          <SelectContent>
            {videoDevices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="audio-device">Microphone</Label>
        <Select
          value={selectedAudioDeviceId}
          onValueChange={onAudioDeviceChange}
        >
          <SelectTrigger id="audio-device" className="w-full">
            <SelectValue placeholder="Select microphone" />
          </SelectTrigger>
          <SelectContent>
            {audioDevices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default memo(DeviceSelector);