
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
  // Always declare all hooks at the top level with no conditions
  const [vitals, setVitals] = useState<VitalReading | null>(initialVitals || null);
  const [alertLevel, setAlertLevel] = useState<AlertLevel>(AlertLevel.NORMAL);
  const [isLoading, setIsLoading] = useState<boolean>(!initialVitals);
  
  // Use refs for values that shouldn't trigger re-renders when they change
  const profileRef = useRef<Profile>(profile);
  const alertLevelRef = useRef<AlertLevel>(AlertLevel.NORMAL);
  const enableAlertsRef = useRef<boolean>(enableAlerts);
  
  // Update refs when props change
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  
  useEffect(() => {
    enableAlertsRef.current = enableAlerts;
  }, [enableAlerts]);
  
  // Update alertLevelRef when state changes
  useEffect(() => {
    alertLevelRef.current = alertLevel;
  }, [alertLevel]);
  
  // Subscribe to vital updates
  useEffect(() => {
    // Always define this with no early returns that skip hook execution
    let subscription = { unsubscribe: () => {} };
    
    if (profile && profile.status === 'active') {
      setIsLoading(true);
      
      subscription = subscribeToVitalUpdates(profile.macAddress, (data) => {
        setVitals(data);
        setIsLoading(false);
        
        // Check alert level
        const level = checkVitalSigns(data);
        
        // Only trigger alerts if the level has changed
        if (level !== alertLevelRef.current) {
          setAlertLevel(level);
          
          // Trigger alert if needed
          if (enableAlertsRef.current && level !== AlertLevel.NORMAL) {
            const profileName = `${profileRef.current.firstName} ${profileRef.current.lastName}`;
            triggerAlert(data, profileName, level);
          }
        }
      });
    } else {
      setIsLoading(false);
    }
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [profile]); // Only depend on profile identity changes

  return {
    vitals,
    alertLevel,
    isLoading
  };
};
