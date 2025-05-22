
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { fetchAllProfilesWithVitals, createProfile, updateProfile, deleteProfile } from "@/services/mockApi";
import { ProfileWithVitals, Profile } from "@/types/hostage";
import { AdminProfileCard } from "@/components/AdminProfileCard";
import { VitalChart } from "@/components/VitalChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Plus, UserX, Clock, Upload, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { generateMacAddress } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertLevel } from "@/types/hostage";
import { useVitalMonitoring } from "@/hooks/useVitalMonitoring";

const Admin = () => {
  const [profiles, setProfiles] = useState<ProfileWithVitals[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileWithVitals[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<ProfileWithVitals | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [customMacAddress, setCustomMacAddress] = useState("");
  const [useDynamicMac, setUseDynamicMac] = useState(true);

  // Form for adding/editing employee
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      age: 30,
      gender: "male" as const,
      location: "",
      bloodGroup: "",
      contactNumber: "",
      macAddress: "",
    }
  });

  // Form for setting timer
  const timerForm = useForm({
    defaultValues: {
      monitoringEndTime: "",
    }
  });

  // Get vital monitoring data for selected profile
  const vitalMonitoring = selectedProfile ? useVitalMonitoring({
    profile: selectedProfile,
    initialVitals: selectedProfile.currentVitals,
    enableAlerts: true
  }) : { vitals: null, alertLevel: AlertLevel.NORMAL, isLoading: false };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    // Show alert when vital signs are abnormal
    if (vitalMonitoring.alertLevel !== AlertLevel.NORMAL && vitalMonitoring.vitals && selectedProfile) {
      const profileName = `${selectedProfile.firstName} ${selectedProfile.lastName}`;
      const alertType = vitalMonitoring.alertLevel === AlertLevel.DANGER ? "danger" : "warning";
      const message = `${profileName}'s vital signs are ${alertType === "danger" ? "critically" : "borderline"} abnormal`;

      toast({
        title: alertType === "danger" ? "CRITICAL ALERT!" : "Warning",
        description: message,
        variant: alertType === "danger" ? "destructive" : "default",
      });
    }
  }, [vitalMonitoring.alertLevel, vitalMonitoring.vitals, selectedProfile]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllProfilesWithVitals();
      setProfiles(data);
      setFilteredProfiles(data);
      setIsLoading(false);
      if (data.length > 0 && !selectedProfile) {
        setSelectedProfile(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
      setIsLoading(false);
    }
  };

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

  const resetForm = () => {
    form.reset({
      firstName: "",
      lastName: "",
      age: 30,
      gender: "male" as const,
      location: "",
      bloodGroup: "",
      contactNumber: "",
      macAddress: "",
    });
    setSelectedPhoto(null);
    setCustomMacAddress("");
    setUseDynamicMac(true);
  };

  const handleAddProfile = async (data: any) => {
    try {
      const macToUse = useDynamicMac ? generateMacAddress() : data.macAddress;
      
      if (!useDynamicMac && !macToUse) {
        toast({
          title: "Error",
          description: "MAC address is required.",
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
        photo: selectedPhoto || undefined
      };

      const createdProfile = await createProfile(newProfile);
      toast({
        title: "Profile Created",
        description: `${createdProfile.firstName} ${createdProfile.lastName} has been added successfully.`,
      });

      setShowAddDialog(false);
      resetForm();
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

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const activeProfiles = filteredProfiles.filter((profile) => profile.status === "active");
  const inactiveProfiles = filteredProfiles.filter((profile) => profile.status === "inactive");

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
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2" onClick={() => {
                  resetForm();
                  setShowAddDialog(true);
                }}>
                  <Plus className="h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>
                    Enter the employee details below to create a new monitoring profile.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddProfile)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Chamber location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bloodGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Blood Group</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. A+" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="useDynamicMac"
                          checked={useDynamicMac}
                          onChange={() => setUseDynamicMac(!useDynamicMac)}
                          className="mr-2"
                        />
                        <Label htmlFor="useDynamicMac">Auto-generate MAC Address</Label>
                      </div>
                      
                      {!useDynamicMac && (
                        <FormField
                          control={form.control}
                          name="macAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MAC Address</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="XX:XX:XX:XX:XX:XX" 
                                  {...field} 
                                  value={customMacAddress}
                                  onChange={(e) => {
                                    setCustomMacAddress(e.target.value);
                                    field.onChange(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="photo">Photo</Label>
                      <div className="mt-1 flex items-center gap-4">
                        <Input 
                          id="photo" 
                          type="file" 
                          accept="image/*" 
                          onChange={handlePhotoSelect}
                        />
                        {selectedPhoto && (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedPhoto} alt="Preview" />
                            <AvatarFallback>IMG</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Employee</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
                
                {/* Tabs for active and inactive profiles */}
                <TabsContent value="active" className="max-h-[600px] overflow-y-auto">
                  {activeProfiles.length > 0 ? (
                    <div className="divide-y">
                      {activeProfiles.map((profile) => (
                        <div 
                          key={profile.id} 
                          onClick={() => handleProfileSelect(profile)}
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

                <TabsContent value="inactive" className="max-h-[600px] overflow-y-auto">
                  {inactiveProfiles.length > 0 ? (
                    <div className="divide-y">
                      {inactiveProfiles.map((profile) => (
                        <div 
                          key={profile.id} 
                          onClick={() => handleProfileSelect(profile)}
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

          {/* Right side: Selected Profile Details */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-500">Loading profile data...</p>
              </div>
            ) : selectedProfile ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <AdminProfileCard profile={selectedProfile} isCompact={false} />
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={showTimerDialog} onOpenChange={setShowTimerDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Clock className="h-4 w-4 mr-2" />
                            Set Timer
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Set Monitoring Timer</DialogTitle>
                            <DialogDescription>
                              Set when monitoring should end for this employee.
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...timerForm}>
                            <form onSubmit={timerForm.handleSubmit(handleSetTimer)} className="space-y-4">
                              <FormField
                                control={timerForm.control}
                                name="monitoringEndTime"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>End Time</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="datetime-local" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowTimerDialog(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit">Set Timer</Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <UserX className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete {selectedProfile.firstName} {selectedProfile.lastName}'s profile? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteProfile}>
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  {selectedProfile.monitoringEndTime && (
                    <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-700">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Monitoring scheduled to end at: {new Date(selectedProfile.monitoringEndTime).toLocaleString()}
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
                          ? `${selectedProfile.firstName}'s vital signs are critically abnormal and require immediate attention!` 
                          : `${selectedProfile.firstName}'s vital signs are outside normal parameters.`}
                      </AlertDescription>
                    </Alert>
                  )}
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
                  <h3 className="text-lg font-medium mb-4">Employee Information</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Full Name</TableCell>
                        <TableCell>{selectedProfile.firstName} {selectedProfile.lastName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Age</TableCell>
                        <TableCell>{selectedProfile.age} years</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Gender</TableCell>
                        <TableCell>{selectedProfile.gender}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Blood Group</TableCell>
                        <TableCell>{selectedProfile.bloodGroup || "Not specified"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Contact Number</TableCell>
                        <TableCell>{selectedProfile.contactNumber || "Not specified"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Emergency Contact</TableCell>
                        <TableCell>{selectedProfile.contactInfo || "Not specified"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Location</TableCell>
                        <TableCell>{selectedProfile.location}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">MAC Address</TableCell>
                        <TableCell><code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{selectedProfile.macAddress}</code></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
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
