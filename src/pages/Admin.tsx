
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { fetchAllProfilesWithVitals, createProfile, updateProfile, deleteProfile } from "@/services/mockApi";
import { ProfileWithVitals, Profile } from "@/types/hostage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { generateMacAddress } from "@/lib/utils";
import { ProfileList } from "@/components/admin/ProfileList";
import { ProfileDetails } from "@/components/admin/ProfileDetails";
import { AddEmployeeDialog } from "@/components/admin/AddEmployeeDialog";
import { TimerDialog } from "@/components/admin/TimerDialog";
import { DeleteDialog } from "@/components/admin/DeleteDialog";

const Admin = () => {
  const [profiles, setProfiles] = useState<ProfileWithVitals[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithVitals | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllProfilesWithVitals();
      setProfiles(data);
      setIsLoading(false);
      if (data.length > 0 && !selectedProfile) {
        setSelectedProfile(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProfileSelect = (profile: ProfileWithVitals) => {
    setSelectedProfile(profile);
  };

  const handleAddProfile = async (data: any) => {
    try {
      const macToUse = data.macAddress ? data.macAddress : generateMacAddress();
      
      if (!data.firstName || !data.lastName) {
        toast({
          title: "Error",
          description: "First name and last name are required.",
          variant: "destructive",
        });
        return;
      }
      
      const newProfile: Omit<Profile, 'id'> = {
        firstName: data.firstName,
        lastName: data.lastName,
        age: parseInt(data.age),
        gender: data.gender,
        location: data.location,
        macAddress: macToUse,
        status: "active",
        bloodGroup: data.bloodGroup,
        contactNumber: data.contactNumber,
        photo: data.selectedPhoto || undefined
      };

      const createdProfile = await createProfile(newProfile);
      toast({
        title: "Profile Created",
        description: `${createdProfile.firstName} ${createdProfile.lastName} has been added successfully.`,
      });

      setShowAddDialog(false);
      fetchProfiles();
    } catch (error) {
      console.error("Failed to create profile:", error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfile) return;

    try {
      await deleteProfile(selectedProfile.id);
      toast({
        title: "Profile Deleted",
        description: `${selectedProfile.firstName} ${selectedProfile.lastName} has been deleted.`,
      });
      setShowDeleteDialog(false);
      
      // Select another profile or set to null if none left
      const remainingProfiles = profiles.filter(p => p.id !== selectedProfile.id);
      if (remainingProfiles.length > 0) {
        setSelectedProfile(remainingProfiles[0]);
      } else {
        setSelectedProfile(null);
      }
      
      fetchProfiles();
    } catch (error) {
      console.error("Failed to delete profile:", error);
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetTimer = async (data: any) => {
    if (!selectedProfile) return;

    try {
      const updatedProfile = {
        ...selectedProfile,
        monitoringEndTime: data.monitoringEndTime
      };
      
      await updateProfile(updatedProfile);
      toast({
        title: "Timer Set",
        description: `Monitoring end time set for ${selectedProfile.firstName} ${selectedProfile.lastName}.`,
      });
      
      setShowTimerDialog(false);
      fetchProfiles();
    } catch (error) {
      console.error("Failed to set timer:", error);
      toast({
        title: "Error",
        description: "Failed to set timer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const activeProfiles = profiles.filter((profile) => profile.status === "active");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onSearchChange={handleSearch} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-delphi-800">Employee Monitoring Dashboard</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="mr-2">
              Total: {profiles.length}
            </Badge>
            <Badge variant="default" className="bg-delphi-500">
              Active: {activeProfiles.length}
            </Badge>
            <Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side: Profile List */}
          <div className="lg:col-span-1">
            <ProfileList 
              profiles={profiles}
              selectedProfile={selectedProfile}
              onProfileSelect={handleProfileSelect}
              searchQuery={searchQuery}
              onSearchChange={handleSearch}
            />
          </div>

          {/* Right side: Selected Profile Details */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">Loading profile data...</p>
              </div>
            ) : selectedProfile ? (
              <ProfileDetails 
                profile={selectedProfile}
                isLoading={isLoading}
                onShowTimerDialog={() => setShowTimerDialog(true)}
                onShowDeleteDialog={() => setShowDeleteDialog(true)}
              />
            ) : (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">Select a profile to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <AddEmployeeDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onSubmit={handleAddProfile} 
      />
      
      <TimerDialog 
        open={showTimerDialog} 
        onOpenChange={setShowTimerDialog} 
        onSubmit={handleSetTimer} 
      />
      
      <DeleteDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog} 
        onDelete={handleDeleteProfile} 
        profile={selectedProfile}
      />
    </div>
  );
};

export default Admin;
