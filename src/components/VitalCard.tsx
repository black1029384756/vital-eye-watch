
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertLevel, VitalReading } from "@/types/hostage";
import { VITAL_THRESHOLDS } from "@/lib/constants";
import { useState, useEffect } from "react";

interface VitalCardProps {
  title: string;
  value?: number;
  unit: string;
  min: number;
  max: number;
  alertLevel?: AlertLevel;
  isLoading?: boolean;
  icon: React.ReactNode;
}

export function VitalCard({
  title,
  value,
  unit,
  min,
  max,
  alertLevel = AlertLevel.NORMAL,
  isLoading = false,
  icon,
}: VitalCardProps) {
  const getAlertClasses = () => {
    switch (alertLevel) {
      case AlertLevel.WARNING:
        return "border-alert-warning border-2";
      case AlertLevel.DANGER:
        return "border-alert-danger border-2 animate-pulse";
      default:
        return "border-alert-normal border";
    }
  };

  const getStatusText = () => {
    switch (alertLevel) {
      case AlertLevel.WARNING:
        return "Warning: Borderline";
      case AlertLevel.DANGER:
        return "Alert: Abnormal";
      default:
        return "Normal";
    }
  };

  const getStatusColor = () => {
    switch (alertLevel) {
      case AlertLevel.WARNING:
        return "text-alert-warning";
      case AlertLevel.DANGER:
        return "text-alert-danger";
      default:
        return "text-alert-normal";
    }
  };

  return (
    <Card className={`${getAlertClasses()} h-full`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
        <CardTitle className="text-md font-medium flex items-center">
          <span className="mr-2">{icon}</span>
          {title}
        </CardTitle>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </CardHeader>
      <CardContent className="pb-2">
        {isLoading ? (
          <Skeleton className="h-14 w-full" />
        ) : (
          <div className="flex items-end space-x-1">
            <span className="text-3xl font-bold">{value !== undefined ? value : "--"}</span>
            <span className="text-xl mb-1 text-muted-foreground">{unit}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        Normal range: {min}-{max} {unit}
      </CardFooter>
    </Card>
  );
}
