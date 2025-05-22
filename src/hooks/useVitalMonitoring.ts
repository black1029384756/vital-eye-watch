
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
  // Initialize states first - always in the same order
  const [vitals, setVitals] = useState<VitalReading | null>(initialVitals || null);
  const [alertLevel, setAlertLevel] = useState<AlertLevel>(AlertLevel.NORMAL);
  const [isLoading, setIsLoading] = useState<boolean>(!initialVitals);
  
  // Use refs to avoid recreating the effect
  const profileRef = useRef(profile);
  const enableAlertsRef = useRef(enableAlerts);
  
  // Update refs when props change
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  
  useEffect(() => {
    enableAlertsRef.current = enableAlerts;
  }, [enableAlerts]);
  
  // Main effect for subscription
  useEffect(() => {
    // Set default unsubscribe function
    let unsubscribe = () => {};
    
    // Only subscribe if profile is active
    if (profileRef.current && profileRef.current.status === 'active') {
      setIsLoading(true);
      
      try {
        const subscription = subscribeToVitalUpdates(profileRef.current.macAddress, (data) => {
          setVitals(data);
          setIsLoading(false);
          
          // Determine alert level
          const level = checkVitalSigns(data);
          
          // Update alert level if changed
          setAlertLevel(prevLevel => {
            if (prevLevel !== level) {
              // Only trigger alert if needed
              if (enableAlertsRef.current && level !== AlertLevel.NORMAL) {
                const profileName = `${profileRef.current.firstName} ${profileRef.current.lastName}`;
                triggerAlert(data, profileName, level);
              }
              return level;
            }
            return prevLevel;
          });
        });
        
        unsubscribe = subscription.unsubscribe;
      } catch (error) {
        console.error("Error subscribing to vital updates:", error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
    
    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array since we use refs
  
  return {
    vitals,
    alertLevel,
    isLoading
  };
};
