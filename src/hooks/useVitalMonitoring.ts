
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
  // Initialize all hooks at the top, with consistent order
  const [vitals, setVitals] = useState<VitalReading | null>(initialVitals || null);
  const [alertLevel, setAlertLevel] = useState<AlertLevel>(AlertLevel.NORMAL);
  const [isLoading, setIsLoading] = useState<boolean>(!initialVitals);
  
  // Store values in refs to avoid unnecessary effect dependencies
  const profileRef = useRef<Profile>(profile);
  const enableAlertsRef = useRef<boolean>(enableAlerts);
  const alertLevelRef = useRef<AlertLevel>(alertLevel);
  
  // Update refs when props change
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  
  useEffect(() => {
    enableAlertsRef.current = enableAlerts;
  }, [enableAlerts]);
  
  // Update alertLevel ref when state changes
  useEffect(() => {
    alertLevelRef.current = alertLevel;
  }, [alertLevel]);
  
  // Main subscription effect
  useEffect(() => {
    // Define a default no-op unsubscribe function
    let unsubscribe = () => {};
    
    // Check if we should subscribe to vital updates
    if (profileRef.current && profileRef.current.status === 'active') {
      setIsLoading(true);
      
      // Create the subscription and store the unsubscribe function
      const subscription = subscribeToVitalUpdates(profileRef.current.macAddress, (data) => {
        setVitals(data);
        setIsLoading(false);
        
        // Check vital signs and determine alert level
        const level = checkVitalSigns(data);
        
        // Only update alert level if it has changed
        if (level !== alertLevelRef.current) {
          setAlertLevel(level);
          
          // Trigger alert if needed
          if (enableAlertsRef.current && level !== AlertLevel.NORMAL) {
            const profileName = `${profileRef.current.firstName} ${profileRef.current.lastName}`;
            triggerAlert(data, profileName, level);
          }
        }
      });
      
      unsubscribe = subscription.unsubscribe;
    } else {
      setIsLoading(false);
    }
    
    // Return cleanup function
    return () => {
      unsubscribe();
    };
  }, [/* Empty dependency array - use refs instead */]);
  
  return {
    vitals,
    alertLevel,
    isLoading
  };
};
