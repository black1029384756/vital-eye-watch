
import { ThresholdSettings } from '@/types/hostage';

// Vital sign thresholds as per requirements
export const VITAL_THRESHOLDS: ThresholdSettings = {
  heartRate: {
    min: 60,
    max: 100
  },
  bodyTemperature: {
    min: 97,
    max: 99
  }
};

export const DEFAULT_REFRESH_RATE = 5000; // 5 seconds
