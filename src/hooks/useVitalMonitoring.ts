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
  // Initialize all state hooks at the top level to maintain consistent hook order
  const [vitals, setVitals] = useState<VitalReading | null>(initialVitals || null);
  const [alertLevel, setAlertLevel] = useState<AlertLevel>(AlertLevel.NORMAL);
  const [isLoading, setIsLoading] = useState<boolean>(!initialVitals);
  
  // Use refs for values we need to access in callbacks without adding them as dependencies
  const profileRef = useRef<Profile>(profile);
  const alertLevelRef = useRef<AlertLevel>(AlertLevel.NORMAL);
  const enableAlertsRef = useRef<boolean>(enableAlerts);
  
  // Keep refs in sync with props
  useEffect(() => {
    profileRef.current = profile;
    enableAlertsRef.current = enableAlerts;
  }, [profile, enableAlerts]);
  
  // Keep alertLevelRef in sync with state
  useEffect(() => {
    alertLevelRef.current = alertLevel;
  }, [alertLevel]);

  // Subscribe to vital updates
  useEffect(() => {
    // Early return if profile isn't active - but don't make it conditional
    if (!profile || profile.status !== 'active') {
      setIsLoading(false);
      return () => {/* Empty cleanup function */};
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
        if (enableAlertsRef.current && level !== AlertLevel.NORMAL) {
          const profileName = `${profileRef.current.firstName} ${profileRef.current.lastName}`;
          triggerAlert(data, profileName, level);
        }
      }
    });

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
