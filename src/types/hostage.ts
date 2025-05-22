export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  location: string;
  macAddress: string;
  photo?: string;
  status: 'active' | 'inactive';
  contactInfo?: string;
  bloodGroup?: string;
  contactNumber?: string;
  monitoringEndTime?: string;
}

export interface VitalReading {
  macAddress: string;
  heartRate: number;
  bodyTemperature: number;
  timestamp: string;
}

export interface ProfileWithVitals extends Profile {
  currentVitals?: VitalReading;
  vitalHistory?: VitalReading[];
}

export enum AlertLevel {
  NORMAL = 'normal',
  WARNING = 'warning',
  DANGER = 'danger',
}

export interface ThresholdSettings {
  heartRate: {
    min: number;
    max: number;
  };
  bodyTemperature: {
    min: number;
    max: number;
  };
}
