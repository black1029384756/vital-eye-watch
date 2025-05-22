
import { ProfileWithVitals, AlertLevel } from "@/types/hostage";
import { AdminProfileCard } from "@/components/AdminProfileCard";
import { VitalChart } from "@/components/VitalChart";
import { Button } from "@/components/ui/button";
import { Clock, UserX, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useVitalMonitoring } from "@/hooks/useVitalMonitoring";

interface ProfileDetailsProps {
  profile: ProfileWithVitals;
  isLoading: boolean;
  onShowTimerDialog: () => void;
  onShowDeleteDialog: () => void;
}

export function ProfileDetails({ 
  profile, 
  isLoading, 
  onShowTimerDialog, 
  onShowDeleteDialog 
}: ProfileDetailsProps) {
  // Get vital monitoring data for the profile
  const vitalMonitoring = useVitalMonitoring({
    profile: profile,
    initialVitals: profile.currentVitals,
    enableAlerts: true
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <AdminProfileCard profile={profile} isCompact={false} />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onShowTimerDialog}>
              <Clock className="h-4 w-4 mr-2" />
              Set Timer
            </Button>
            <Button variant="destructive" size="sm" onClick={onShowDeleteDialog}>
              <UserX className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        {profile.monitoringEndTime && (
          <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-700">
              <Clock className="h-4 w-4 inline mr-1" />
              Monitoring scheduled to end at: {new Date(profile.monitoringEndTime).toLocaleString()}
            </p>
          </div>
        )}
        
        {vitalMonitoring.alertLevel !== AlertLevel.NORMAL && vitalMonitoring.vitals && (
          <Alert className={`mt-4 ${vitalMonitoring.alertLevel === AlertLevel.DANGER ? 'border-red-500 bg-red-50' : 'border-amber-500 bg-amber-50'}`}>
            <AlertTriangle className={`h-4 w-4 ${vitalMonitoring.alertLevel === AlertLevel.DANGER ? 'text-red-500' : 'text-amber-500'}`} />
            <AlertTitle className={vitalMonitoring.alertLevel === AlertLevel.DANGER ? 'text-red-700' : 'text-amber-700'}>
              {vitalMonitoring.alertLevel === AlertLevel.DANGER ? 'Critical Alert!' : 'Warning'}
            </AlertTitle>
            <AlertDescription className={vitalMonitoring.alertLevel === AlertLevel.DANGER ? 'text-red-600' : 'text-amber-600'}>
              {vitalMonitoring.alertLevel === AlertLevel.DANGER 
                ? `${profile.firstName}'s vital signs are critically abnormal and require immediate attention!` 
                : `${profile.firstName}'s vital signs are outside normal parameters.`}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Vital Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <VitalChart 
            title="Heart Rate" 
            data={profile.vitalHistory || []}
            vitalType="heartRate"
            color="#0000FF"
            isLoading={isLoading}
            height={250}
          />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <VitalChart 
            title="Body Temperature" 
            data={profile.vitalHistory || []}
            vitalType="bodyTemperature"
            color="#ff4c4c"
            isLoading={isLoading}
            height={250}
          />
        </div>
      </div>
      
      {profile.status !== 'active' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-700">
            This profile is currently inactive. No real-time data is being received.
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium mb-4">Employee Information</h3>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Full Name</TableCell>
              <TableCell>{profile.firstName} {profile.lastName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Age</TableCell>
              <TableCell>{profile.age} years</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Gender</TableCell>
              <TableCell>{profile.gender}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Blood Group</TableCell>
              <TableCell>{profile.bloodGroup || "Not specified"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Contact Number</TableCell>
              <TableCell>{profile.contactNumber || "Not specified"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Emergency Contact</TableCell>
              <TableCell>{profile.contactInfo || "Not specified"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Location</TableCell>
              <TableCell>{profile.location}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">MAC Address</TableCell>
              <TableCell><code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{profile.macAddress}</code></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
