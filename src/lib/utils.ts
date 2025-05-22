
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AlertLevel, VitalReading } from "@/types/hostage"
import { VITAL_THRESHOLDS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function getVitalAlertLevel(
  vitalType: "heartRate" | "bodyTemperature",
  value: number
): AlertLevel {
  const threshold = 
    vitalType === "heartRate" 
      ? VITAL_THRESHOLDS.heartRate 
      : VITAL_THRESHOLDS.bodyTemperature;
      
  const buffer = vitalType === "heartRate" ? 5 : 0.5;
  
  if (value < threshold.min - buffer || value > threshold.max + buffer) {
    return AlertLevel.DANGER;
  } else if (value < threshold.min || value > threshold.max) {
    return AlertLevel.WARNING;
  }
  
  return AlertLevel.NORMAL;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getMockPhotoUrl(id: string): string {
  // Placeholder for real photos in a production app
  return `/placeholder.svg`;
}

export function generateMacAddress(): string {
  const hexDigits = "0123456789ABCDEF";
  let macAddress = "";
  
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      macAddress += hexDigits.charAt(Math.floor(Math.random() * 16));
    }
    if (i < 5) macAddress += ":";
  }
  
  return macAddress;
}
