
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProfileWithVitals } from "@/services/mockApi";
import { ProfileWithVitals, AlertLevel } from "@/types/hostage";
import { VITAL_THRESHOLDS } from "@/lib/constants";
import { Header } from "@/components/Header";
import { ProfileCard } from "@/components/ProfileCard";
import { VitalCard } from "@/components/VitalCard";
import { VitalChart } from "@/components/VitalChart";
import { Button } from "@/components/ui/button";
import { Heart, Thermometer, ArrowLeft, Bell, BellOff } from "lucide-react";
import { useVitalMonitoring } from "@/hooks/useVitalMonitoring";
import { getVitalAlertLevel } from "@/lib/utils";

const ProfileDashboard = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileWithVitals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const profileData = await fetchProfileWithVitals(id);
        if (profileData) {
          setProfile(profileData);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const { vitals, alertLevel, isLoading: isVitalsLoading } = useVitalMonitoring({
    profile: profile as ProfileWithVitals,
    initialVitals: profile?.currentVitals,
    enableAlerts: alertsEnabled
  });

  const heartRateAlertLevel = vitals
    ? getVitalAlertLevel("heartRate", vitals.heartRate)
    : AlertLevel.NORMAL;
    
  const temperatureAlertLevel = vitals
    ? getVitalAlertLevel("bodyTemperature", vitals.bodyTemperature)
    : AlertLevel.NORMAL;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading profile data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Profile not found</p>
              <Link to="/dashboard">
                <Button>Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center text-delphi-500 hover:text-delphi-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Dashboard</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={alertsEnabled ? "text-red-500" : "text-green-500"}
          >
            {alertsEnabled ? (
              <>
                <BellOff className="h-4 w-4 mr-1" /> Disable Alerts
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-1" /> Enable Alerts
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileCard profile={profile} showLink={false} />
          </div>
          
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VitalCard
                title="Heart Rate"
                value={vitals?.heartRate}
                unit="bpm"
                min={VITAL_THRESHOLDS.heartRate.min}
                max={VITAL_THRESHOLDS.heartRate.max}
                alertLevel={heartRateAlertLevel}
                isLoading={isVitalsLoading}
                icon={<Heart className="h-4 w-4" />}
              />
              
              <VitalCard
                title="Body Temperature"
                value={vitals?.bodyTemperature}
                unit="°F"
                min={VITAL_THRESHOLDS.bodyTemperature.min}
                max={VITAL_THRESHOLDS.bodyTemperature.max}
                alertLevel={temperatureAlertLevel}
                isLoading={isVitalsLoading}
                icon={<Thermometer className="h-4 w-4" />}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <VitalChart
            title="Heart Rate"
            data={profile.vitalHistory || []}
            vitalType="heartRate"
            color="#0000FF"
            isLoading={isLoading}
            height={300}
          />
          
          <VitalChart
            title="Body Temperature"
            data={profile.vitalHistory || []}
            vitalType="bodyTemperature"
            color="#ff4c4c"
            isLoading={isLoading}
            height={300}
          />
        </div>

        {profile.status !== 'active' && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-700">
              This profile is currently inactive. No real-time data is being received.
            </p>
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Emergency Contact</h3>
          <p className="text-gray-700">{profile.contactInfo || "No emergency contact information available"}</p>
        </div>
      </main>
    </div>
  );
};

export default ProfileDashboard;
