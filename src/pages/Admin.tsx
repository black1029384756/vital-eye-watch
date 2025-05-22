
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { fetchAllProfilesWithVitals } from "@/services/mockApi";
import { ProfileWithVitals } from "@/types/hostage";
import { AdminProfileCard } from "@/components/AdminProfileCard";
import { VitalChart } from "@/components/VitalChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const [profiles, setProfiles] = useState<ProfileWithVitals[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileWithVitals[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithVitals | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllProfilesWithVitals();
        setProfiles(data);
        setFilteredProfiles(data);
        setIsLoading(false);
        if (data.length > 0) {
          setSelectedProfile(data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = profiles.filter((profile) => {
        const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [searchQuery, profiles]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProfileSelect = (profile: ProfileWithVitals) => {
    setSelectedProfile(profile);
  };

  const activeProfiles = filteredProfiles.filter((profile) => profile.status === "active");
  const inactiveProfiles = filteredProfiles.filter((profile) => profile.status === "inactive");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onSearchChange={handleSearch} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-delphi-800">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="mr-2">
              Total: {profiles.length}
            </Badge>
            <Badge variant="default" className="bg-delphi-500">
              Active: {activeProfiles.length}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left side: Profile List */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search by name..." 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">All ({filteredProfiles.length})</TabsTrigger>
                  <TabsTrigger value="active">Active ({activeProfiles.length})</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive ({inactiveProfiles.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="max-h-[600px] overflow-y-auto">
                  {filteredProfiles.length > 0 ? (
                    <div className="divide-y">
                      {filteredProfiles.map((profile) => (
                        <div 
                          key={profile.id} 
                          onClick={() => handleProfileSelect(profile)}
                          className={`cursor-pointer p-2 hover:bg-gray-50 ${
                            selectedProfile?.id === profile.id ? "bg-delphi-50" : ""
                          }`}
                        >
                          <AdminProfileCard profile={profile} isCompact={true} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-500">No profiles found</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="active" className="max-h-[600px] overflow-y-auto">
                  {activeProfiles.length > 0 ? (
                    <div className="divide-y">
                      {activeProfiles.map((profile) => (
                        <div 
                          key={profile.id} 
                          onClick={() => handleProfileSelect(profile)}
                          className={`cursor-pointer p-2 hover:bg-gray-50 ${
                            selectedProfile?.id === profile.id ? "bg-delphi-50" : ""
                          }`}
                        >
                          <AdminProfileCard profile={profile} isCompact={true} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-500">No active profiles found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="inactive" className="max-h-[600px] overflow-y-auto">
                  {inactiveProfiles.length > 0 ? (
                    <div className="divide-y">
                      {inactiveProfiles.map((profile) => (
                        <div 
                          key={profile.id} 
                          onClick={() => handleProfileSelect(profile)}
                          className={`cursor-pointer p-2 hover:bg-gray-50 ${
                            selectedProfile?.id === profile.id ? "bg-delphi-50" : ""
                          }`}
                        >
                          <AdminProfileCard profile={profile} isCompact={true} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-500">No inactive profiles found</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right side: Selected Profile Details */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">Loading profile data...</p>
              </div>
            ) : selectedProfile ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <AdminProfileCard profile={selectedProfile} isCompact={false} />
                </div>
                
                {/* Vital Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <VitalChart 
                      title="Heart Rate" 
                      data={selectedProfile.vitalHistory || []}
                      vitalType="heartRate"
                      color="#0000FF"
                      isLoading={isLoading}
                      height={250}
                    />
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <VitalChart 
                      title="Body Temperature" 
                      data={selectedProfile.vitalHistory || []}
                      vitalType="bodyTemperature"
                      color="#ff4c4c"
                      isLoading={isLoading}
                      height={250}
                    />
                  </div>
                </div>
                
                {selectedProfile.status !== 'active' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-amber-700">
                      This profile is currently inactive. No real-time data is being received.
                    </p>
                  </div>
                )}
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                  <p className="text-gray-700">{selectedProfile.contactInfo || "No emergency contact information available"}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">Select a profile to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
