
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
  
  const getUnit = () => vitalType === "heartRate" ? "bpm" : "°F";
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex items-center">
          {title} History
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            (Last {chartData.length} readings)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || chartData.length === 0 ? (
          <div className="h-[200px] w-full flex items-center justify-center bg-muted/10">
            <p className="text-muted-foreground">
              {isLoading ? "Loading chart data..." : "No data available"}
            </p>
          </div>
        ) : (
          <div className="pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Normal range: {thresholds.min}-{thresholds.max} {getUnit()}</span>
              <span>Latest: {chartData[chartData.length - 1]?.value} {getUnit()}</span>
            </div>
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                <XAxis 
                  dataKey="time" 
                  scale="point"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  domain={[
                    (dataMin: number) => Math.floor(Math.min(dataMin, thresholds.min - 5)),
                    (dataMax: number) => Math.ceil(Math.max(dataMax, thresholds.max + 5))
                  ]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  padding={{ top: 10, bottom: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}
                  labelFormatter={(value) => `Time: ${value}`}
                  formatter={(value: number) => [
                    `${value} ${getUnit()}`,
                    title
                  ]}
                />
                <ReferenceLine 
                  y={thresholds.min} 
                  stroke="#f59e0b" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: "Min", 
                    position: "insideBottomLeft", 
                    fontSize: 10, 
                    fill: "#f59e0b" 
                  }} 
                />
                <ReferenceLine 
                  y={thresholds.max} 
                  stroke="#f59e0b" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: "Max", 
                    position: "insideTopLeft", 
                    fontSize: 10, 
                    fill: "#f59e0b" 
                  }} 
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: color }}
                  activeDot={{ r: 5 }}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
