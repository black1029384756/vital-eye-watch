
import { useState, useEffect } from 'react';
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

  useEffect(() => {
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
      if (level !== alertLevel) {
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
  }, [profile, enableAlerts, alertLevel]);

  return {
    vitals,
    alertLevel,
    isLoading
  };
};
