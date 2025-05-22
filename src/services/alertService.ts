
import { AlertLevel, VitalReading } from "@/types/hostage";
import { VITAL_THRESHOLDS } from "@/lib/constants";
import { toast } from "sonner";

export const checkVitalSigns = (vitals: VitalReading): AlertLevel => {
  const { heartRate, bodyTemperature } = vitals;
  
  // Check heart rate
  if (
    heartRate < VITAL_THRESHOLDS.heartRate.min - 5 || 
    heartRate > VITAL_THRESHOLDS.heartRate.max + 5
  ) {
    return AlertLevel.DANGER;
  } else if (
    heartRate < VITAL_THRESHOLDS.heartRate.min || 
    heartRate > VITAL_THRESHOLDS.heartRate.max
  ) {
    return AlertLevel.WARNING;
  }
  
  // Check body temperature
  if (
    bodyTemperature < VITAL_THRESHOLDS.bodyTemperature.min - 0.5 || 
    bodyTemperature > VITAL_THRESHOLDS.bodyTemperature.max + 0.5
  ) {
    return AlertLevel.DANGER;
  } else if (
    bodyTemperature < VITAL_THRESHOLDS.bodyTemperature.min || 
    bodyTemperature > VITAL_THRESHOLDS.bodyTemperature.max
  ) {
    return AlertLevel.WARNING;
  }
  
  return AlertLevel.NORMAL;
};

export const triggerAlert = (
  vitals: VitalReading,
  profileName: string,
  alertLevel: AlertLevel
): void => {
  let message = "";
  let vital = "";

  if (
    vitals.heartRate < VITAL_THRESHOLDS.heartRate.min || 
    vitals.heartRate > VITAL_THRESHOLDS.heartRate.max
  ) {
    vital = "Heart rate";
    message = `${profileName}'s heart rate is ${vitals.heartRate} bpm (normal: ${VITAL_THRESHOLDS.heartRate.min}-${VITAL_THRESHOLDS.heartRate.max})`;
  } else if (
    vitals.bodyTemperature < VITAL_THRESHOLDS.bodyTemperature.min || 
    vitals.bodyTemperature > VITAL_THRESHOLDS.bodyTemperature.max
  ) {
    vital = "Body temperature";
    message = `${profileName}'s body temperature is ${vitals.bodyTemperature}°F (normal: ${VITAL_THRESHOLDS.bodyTemperature.min}-${VITAL_THRESHOLDS.bodyTemperature.max})`;
  }

  if (message) {
    if (alertLevel === AlertLevel.DANGER) {
      toast.error(`ALERT: ${vital} abnormal!`, {
        description: message,
        duration: 10000,
      });
      // In a real application, we would implement push notifications, SMS, etc. here
    } else if (alertLevel === AlertLevel.WARNING) {
      toast.warning(`WARNING: ${vital} borderline`, {
        description: message,
        duration: 5000,
      });
    }
  }
};
