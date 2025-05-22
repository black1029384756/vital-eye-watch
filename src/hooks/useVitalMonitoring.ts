import { useState, useEffect, useRef } from 'react';
import { Profile, VitalReading, AlertLevel } from '@/types/hostage';
import { subscribeToVitalUpdates } from '@/services/mockApi';
import { checkVitalSigns, triggerAlert } from '@/services/alertService';

interface UseVitalMonitoringProps {
  profile: Profile;
  initialVitals?: VitalReading;
  enableAlerts?: boolean;
}

interface UseVitalMonitoringResult {
  vitals: VitalReading | null;
  alertLevel: AlertLevel;
  isLoading: boolean;
}

export const useVitalMonitoring = ({
  profile,
  initialVitals,
  enableAlerts = true
}: UseVitalMonitoringProps): UseVitalMonitoringResult => {
  const [vitals, setVitals] = useState<VitalReading | null>(initialVitals || null);
  const [alertLevel, setAlertLevel] = useState<AlertLevel>(AlertLevel.NORMAL);
  const [isLoading, setIsLoading] = useState<boolean>(!initialVitals);
  
  // Use ref to keep track of the current alertLevel to avoid dependency issues
  const alertLevelRef = useRef<AlertLevel>(AlertLevel.NORMAL);
  
  // Update the ref whenever alertLevel changes
  useEffect(() => {
    alertLevelRef.current = alertLevel;
  }, [alertLevel]);

  useEffect(() => {
    // If profile doesn't exist or is inactive, don't subscribe
    if (!profile || profile.status !== 'active') {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    // Subscribe to vital updates
    const subscription = subscribeToVitalUpdates(profile.macAddress, (data) => {
      setVitals(data);
      setIsLoading(false);
      
      // Check alert level
      const level = checkVitalSigns(data);
      
      // Only trigger alerts if the level has changed
      if (level !== alertLevelRef.current) {
        setAlertLevel(level);
        
        // Trigger alert if needed
        if (enableAlerts && level !== AlertLevel.NORMAL) {
          triggerAlert(data, `${profile.firstName} ${profile.lastName}`, level);
        }
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [profile, enableAlerts]); // Removed alertLevel from dependencies

  return {
    vitals,
    alertLevel,
    isLoading
  };
};
