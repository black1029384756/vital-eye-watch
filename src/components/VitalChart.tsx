
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VitalReading } from "@/types/hostage";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { VITAL_THRESHOLDS } from "@/lib/constants";
import { format, parseISO } from "date-fns";

interface VitalChartProps {
  title: string;
  data: VitalReading[];
  vitalType: "heartRate" | "bodyTemperature";
  color: string;
  isLoading?: boolean;
  height?: number;
}

export function VitalChart({
  title,
  data,
  vitalType,
  color,
  isLoading = false,
  height = 200,
}: VitalChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map((reading) => ({
        timestamp: reading.timestamp,
        time: format(parseISO(reading.timestamp), "HH:mm"),
        value: reading[vitalType],
      }));
      
      setChartData(formattedData);
    }
  }, [data, vitalType]);

  const thresholds = vitalType === "heartRate" 
    ? VITAL_THRESHOLDS.heartRate 
    : VITAL_THRESHOLDS.bodyTemperature;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-md font-medium">{title} History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || chartData.length === 0 ? (
          <div className="h-[200px] w-full flex items-center justify-center bg-muted/10">
            <p className="text-muted-foreground">
              {isLoading ? "Loading chart data..." : "No data available"}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                scale="point"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={[
                  (dataMin: number) => Math.floor(Math.min(dataMin, thresholds.min - 5)),
                  (dataMax: number) => Math.ceil(Math.max(dataMax, thresholds.max + 5))
                ]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                labelFormatter={(value) => `Time: ${value}`}
                formatter={(value: number) => [
                  `${value} ${vitalType === "heartRate" ? "bpm" : "°F"}`,
                  title
                ]}
              />
              <ReferenceLine y={thresholds.min} stroke="#f59e0b" strokeDasharray="3 3" />
              <ReferenceLine y={thresholds.max} stroke="#f59e0b" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3, fill: color }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
