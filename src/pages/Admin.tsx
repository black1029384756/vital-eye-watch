
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { fetchProfiles, createProfile, updateProfile, deleteProfile } from "@/services/mockApi";
import { Profile } from "@/types/hostage";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getInitials, generateMacAddress } from "@/lib/utils";
import { Trash, Pencil, Plus, Check, X } from "lucide-react";

// Form schema for profile
const profileSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  age: z.coerce.number().min(1, "Age must be a positive number"),
  gender: z.enum(["male", "female", "other"]),
  location: z.string().min(1, "Location is required"),
  macAddress: z.string().regex(/^([0-9A-F]{2}:){5}([0-9A-F]{2})$/, "Invalid MAC address format (XX:XX:XX:XX:XX:XX)"),
  status: z.enum(["active", "inactive"]),
  photo: z.string().optional(),
  contactInfo: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Admin = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: 30,
      gender: "male",
      location: "",
      macAddress: generateMacAddress(),
      status: "active",
      contactInfo: "",
    },
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await fetchProfiles();
      setProfiles(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
      setIsLoading(false);
      toast.error("Failed to load profiles");
    }
  };

  const handleOpenDialog = (profile?: Profile) => {
    if (profile) {
      setIsEditMode(true);
      setSelectedProfile(profile);
      form.reset({
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: profile.age,
        gender: profile.gender,
        location: profile.location,
        macAddress: profile.macAddress,
        status: profile.status,
        photo: profile.photo,
        contactInfo: profile.contactInfo,
      });
    } else {
      setIsEditMode(false);
      setSelectedProfile(null);
      form.reset({
        firstName: "",
        lastName: "",
        age: 30,
        gender: "male",
        location: "",
        macAddress: generateMacAddress(),
        status: "active",
        contactInfo: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    form.reset();
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      if (isEditMode && selectedProfile) {
        await updateProfile({ ...values, id: selectedProfile.id } as Profile);
        toast.success("Profile updated successfully");
      } else {
        await createProfile(values as Omit<Profile, "id">);
        toast.success("Profile created successfully");
      }
      loadProfiles();
      handleCloseDialog();
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(`Failed to ${isEditMode ? "update" : "create"} profile`);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await deleteProfile(id);
      setProfiles(profiles.filter((p) => p.id !== id));
      toast.success("Profile deleted successfully");
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete profile:", error);
      toast.error("Failed to delete profile");
    }
  };

  const activeProfiles = profiles.filter((profile) => profile.status === "active");
  const inactiveProfiles = profiles.filter((profile) => profile.status === "inactive");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <Button 
            onClick={() => handleOpenDialog()}
            className="bg-delphi-500 hover:bg-delphi-600"
          >
            <Plus className="h-4 w-4 mr-2" /> Add New Profile
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Profiles ({profiles.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeProfiles.length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive ({inactiveProfiles.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ProfilesTable 
              profiles={profiles} 
              isLoading={isLoading} 
              onEdit={handleOpenDialog} 
              onDelete={setDeleteConfirmId}
              deleteConfirmId={deleteConfirmId}
              onConfirmDelete={handleDeleteProfile}
              onCancelDelete={() => setDeleteConfirmId(null)}
            />
          </TabsContent>
          
          <TabsContent value="active">
            <ProfilesTable 
              profiles={activeProfiles} 
              isLoading={isLoading} 
              onEdit={handleOpenDialog} 
              onDelete={setDeleteConfirmId}
              deleteConfirmId={deleteConfirmId}
              onConfirmDelete={handleDeleteProfile}
              onCancelDelete={() => setDeleteConfirmId(null)}
            />
          </TabsContent>
          
          <TabsContent value="inactive">
            <ProfilesTable 
              profiles={inactiveProfiles} 
              isLoading={isLoading} 
              onEdit={handleOpenDialog} 
              onDelete={setDeleteConfirmId}
              deleteConfirmId={deleteConfirmId}
              onConfirmDelete={handleDeleteProfile}
              onCancelDelete={() => setDeleteConfirmId(null)}
            />
          </TabsContent>
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Profile" : "Add New Profile"}</DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update the profile information below."
                  : "Fill in the profile information to add a new person to the system."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" />
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
                          <Input {...field} placeholder="Doe" />
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
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
                        <Input {...field} placeholder="Building A, Room 101" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="macAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MAC Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="XX:XX:XX:XX:XX:XX" />
                      </FormControl>
                      <FormDescription>
                        Format: XX:XX:XX:XX:XX:XX where X is a hexadecimal digit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Emergency contact information" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-delphi-500 hover:bg-delphi-600">
                    {isEditMode ? "Update Profile" : "Add Profile"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

interface ProfilesTableProps {
  profiles: Profile[];
  isLoading: boolean;
  onEdit: (profile: Profile) => void;
  onDelete: (id: string) => void;
  deleteConfirmId: string | null;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

const ProfilesTable = ({
  profiles,
  isLoading,
  onEdit,
  onDelete,
  deleteConfirmId,
  onConfirmDelete,
  onCancelDelete,
}: ProfilesTableProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading profiles...</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No profiles found</p>
      </div>
    );
  }

  return (
    <div className="mt-4 border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>MAC Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.photo} alt={`${profile.firstName} ${profile.lastName}`} />
                    <AvatarFallback>{getInitials(`${profile.firstName} ${profile.lastName}`)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                    <p className="text-xs text-muted-foreground">{profile.age} years • {profile.gender}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{profile.location}</TableCell>
              <TableCell>
                <code className="bg-gray-100 text-xs p-1 rounded">{profile.macAddress}</code>
              </TableCell>
              <TableCell>
                <Badge variant={profile.status === "active" ? "default" : "secondary"}>
                  {profile.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {deleteConfirmId === profile.id ? (
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCancelDelete()}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onConfirmDelete(profile.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(profile)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(profile.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Admin;
