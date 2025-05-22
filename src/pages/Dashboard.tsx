
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAllProfilesWithVitals } from "@/services/mockApi";
import { ProfileWithVitals } from "@/types/hostage";
import { Header } from "@/components/Header";
import { ProfileCard } from "@/components/ProfileCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [profiles, setProfiles] = useState<ProfileWithVitals[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileWithVitals[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllProfilesWithVitals();
        setProfiles(data);
        setFilteredProfiles(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        setIsLoading(false);
      }
    };

    fetchData();
    // In a real app, we would set up a websocket or polling here
    const interval = setInterval(fetchData, 30000); // refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = profiles.filter((profile) => {
        const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
        const location = profile.location.toLowerCase();
        const query = searchQuery.toLowerCase();
        
        return (
          fullName.includes(query) ||
          location.includes(query) ||
          profile.macAddress.toLowerCase().includes(query)
        );
      });
      
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [searchQuery, profiles]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const activeProfiles = filteredProfiles.filter(
    (profile) => profile.status === "active"
  );
  
  const inactiveProfiles = filteredProfiles.filter(
    (profile) => profile.status === "inactive"
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onSearchChange={handleSearch} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Monitoring Dashboard</h2>
          <div>
            <Badge variant="outline" className="mr-2">
              Total: {profiles.length}
            </Badge>
            <Badge variant="default" className="bg-delphi-500">
              Active: {activeProfiles.length}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading profiles...</p>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active">Active ({activeProfiles.length})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({inactiveProfiles.length})</TabsTrigger>
              <TabsTrigger value="all">All ({filteredProfiles.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {activeProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {activeProfiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No active profiles found</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="inactive">
              {inactiveProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {inactiveProfiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No inactive profiles found</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all">
              {filteredProfiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {filteredProfiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No profiles found matching your search</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
