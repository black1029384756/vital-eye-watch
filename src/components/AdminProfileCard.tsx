
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/types/hostage";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

interface AdminProfileCardProps {
  profile: Profile;
  isCompact: boolean;
}

export function AdminProfileCard({ profile, isCompact }: AdminProfileCardProps) {
  const { firstName, lastName, age, gender, location, status, macAddress, photo } = profile;
  const fullName = `${firstName} ${lastName}`;
  const initials = getInitials(fullName);
  
  if (isCompact) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border border-gray-200">
            <AvatarImage src={photo} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">{fullName}</h4>
            <p className="text-xs text-gray-500">{location}</p>
          </div>
        </div>
        <Badge variant={status === "active" ? "default" : "secondary"} className="text-xs">
          {status === "active" ? "Active" : "Inactive"}
        </Badge>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border border-gray-200">
            <AvatarImage src={photo} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{fullName}</h2>
            <p className="text-gray-600">
              {age} years • {gender}
            </p>
            <p className="text-gray-600 mt-1">{location}</p>
          </div>
        </div>
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status === "active" ? "Active" : "Inactive"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <h3 className="text-sm font-medium text-gray-500">MAC Address</h3>
          <p className="font-mono text-xs bg-gray-100 p-1 rounded mt-1 inline-block">{macAddress}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p>{status === "active" ? "Monitoring Active" : "Monitoring Inactive"}</p>
        </div>
      </div>
    </div>
  );
}
