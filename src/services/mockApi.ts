
import { Profile, ProfileWithVitals, VitalReading } from "@/types/hostage";

// Mock profiles data
const mockProfiles: Profile[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    age: 35,
    gender: "male",
    location: "Building A, Room 101",
    macAddress: "AA:BB:CC:DD:EE:01",
    status: "active",
    photo: "/placeholder.svg",
    contactInfo: "Emergency: +1 (555) 123-4567",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    age: 28,
    gender: "female",
    location: "Building B, Room 205",
    macAddress: "AA:BB:CC:DD:EE:02",
    status: "active",
    photo: "/placeholder.svg",
    contactInfo: "Emergency: +1 (555) 987-6543",
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Johnson",
    age: 42,
    gender: "male",
    location: "Building C, Room 310",
    macAddress: "AA:BB:CC:DD:EE:03",
    status: "inactive",
    photo: "/placeholder.svg",
    contactInfo: "Emergency: +1 (555) 456-7890",
  },
];

// Generate random vital readings
const generateRandomVitals = (macAddress: string): VitalReading => {
  return {
    macAddress,
    heartRate: Math.floor(Math.random() * 50) + 60, // Range: 60-110
    bodyTemperature: parseFloat((Math.random() * 4 + 96).toFixed(1)), // Range: 96.0-100.0
    timestamp: new Date().toISOString(),
  };
};

// Generate random history data
const generateVitalHistory = (
  macAddress: string,
  count: number
): VitalReading[] => {
  const history: VitalReading[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now);
    timestamp.setMinutes(now.getMinutes() - i * 5); // 5 minute intervals
    
    history.push({
      macAddress,
      heartRate: Math.floor(Math.random() * 50) + 60,
      bodyTemperature: parseFloat((Math.random() * 4 + 96).toFixed(1)),
      timestamp: timestamp.toISOString(),
    });
  }

  return history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

// Mock API methods
export const fetchProfiles = async (): Promise<Profile[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockProfiles];
};

export const fetchProfileById = async (id: string): Promise<Profile | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockProfiles.find(profile => profile.id === id);
};

export const fetchProfileWithVitals = async (id: string): Promise<ProfileWithVitals | undefined> => {
  const profile = await fetchProfileById(id);
  if (!profile) return undefined;

  const currentVitals = generateRandomVitals(profile.macAddress);
  const vitalHistory = generateVitalHistory(profile.macAddress, 12); // Last 12 readings (1 hour)

  return {
    ...profile,
    currentVitals,
    vitalHistory,
  };
};

export const fetchAllProfilesWithVitals = async (): Promise<ProfileWithVitals[]> => {
  const profiles = await fetchProfiles();
  
  return profiles.map(profile => ({
    ...profile,
    currentVitals: profile.status === 'active' ? generateRandomVitals(profile.macAddress) : undefined,
    vitalHistory: profile.status === 'active' ? generateVitalHistory(profile.macAddress, 12) : [],
  }));
};

export const createProfile = async (profile: Omit<Profile, 'id'>): Promise<Profile> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newProfile = {
    ...profile,
    id: `${mockProfiles.length + 1}`,
  };
  mockProfiles.push(newProfile);
  return newProfile;
};

export const updateProfile = async (profile: Profile): Promise<Profile> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockProfiles.findIndex(p => p.id === profile.id);
  if (index >= 0) {
    mockProfiles[index] = profile;
    return profile;
  }
  throw new Error('Profile not found');
};

export const deleteProfile = async (id: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const index = mockProfiles.findIndex(p => p.id === id);
  if (index >= 0) {
    mockProfiles.splice(index, 1);
    return true;
  }
  return false;
};

// Simulate receiving real-time data via WebSocket
export const subscribeToVitalUpdates = (
  macAddress: string, 
  callback: (data: VitalReading) => void
): { unsubscribe: () => void } => {
  const intervalId = setInterval(() => {
    callback(generateRandomVitals(macAddress));
  }, 5000); // Update every 5 seconds

  return {
    unsubscribe: () => clearInterval(intervalId)
  };
};
