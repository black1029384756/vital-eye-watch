
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/types/hostage";
import { Link } from "react-router-dom";
import { getInitials } from "@/lib/utils";

interface ProfileCardProps {
  profile: Profile;
  showLink?: boolean;
}

export function ProfileCard({ profile, showLink = true }: ProfileCardProps) {
  const { firstName, lastName, age, gender, location, status, macAddress, photo } = profile;
  const fullName = `${firstName} ${lastName}`;
  const initials = getInitials(fullName);
  
  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border border-gray-200">
              <AvatarImage src={photo} alt={fullName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{fullName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {age} years • {gender}
              </p>
            </div>
          </div>
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status === "active" ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Location:</span> {location}
          </div>
          <div className="text-sm font-mono">
            <span className="font-medium">MAC:</span>{" "}
            <span className="text-xs bg-gray-100 p-1 rounded">{macAddress}</span>
          </div>
          {showLink && (
            <div className="pt-3">
              <Link
                to={`/dashboard/${profile.id}`}
                className="text-sm text-delphi-500 hover:text-delphi-700 font-medium"
              >
                View Monitoring Dashboard →
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
