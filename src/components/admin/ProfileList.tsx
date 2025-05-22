
import { useState, useEffect } from "react";
import { ProfileWithVitals } from "@/types/hostage";
import { AdminProfileCard } from "@/components/AdminProfileCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProfileListProps {
  profiles: ProfileWithVitals[];
  selectedProfile: ProfileWithVitals | null;
  onProfileSelect: (profile: ProfileWithVitals) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ProfileList({
  profiles,
  selectedProfile,
  onProfileSelect,
  searchQuery,
  onSearchChange,
}: ProfileListProps) {
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileWithVitals[]>(profiles);
  
  const activeProfiles = filteredProfiles.filter((profile) => profile.status === "active");
  const inactiveProfiles = filteredProfiles.filter((profile) => profile.status === "inactive");

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

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search by name..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
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
                    onClick={() => onProfileSelect(profile)}
                    className={`cursor-pointer p-3 hover:bg-gray-50 ${
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
          
          {/* Tab for active profiles */}
          <TabsContent value="active" className="max-h-[600px] overflow-y-auto">
            {activeProfiles.length > 0 ? (
              <div className="divide-y">
                {activeProfiles.map((profile) => (
                  <div 
                    key={profile.id} 
                    onClick={() => onProfileSelect(profile)}
                    className={`cursor-pointer p-3 hover:bg-gray-50 ${
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

          {/* Tab for inactive profiles */}
          <TabsContent value="inactive" className="max-h-[600px] overflow-y-auto">
            {inactiveProfiles.length > 0 ? (
              <div className="divide-y">
                {inactiveProfiles.map((profile) => (
                  <div 
                    key={profile.id} 
                    onClick={() => onProfileSelect(profile)}
                    className={`cursor-pointer p-3 hover:bg-gray-50 ${
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
  );
}
