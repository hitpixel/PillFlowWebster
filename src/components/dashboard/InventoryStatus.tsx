import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "../../../supabase/supabase";

interface InventoryStatusProps {}

interface PackTypeStats {
  type: string;
  count: number;
  percentage: number;
  status: "High-demanding" | "Low-demanding";
  statusColor: string;
}

const InventoryStatus = ({}: InventoryStatusProps) => {
  const [packStats, setPackStats] = useState<PackTypeStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackTypeStats = async () => {
      try {
        setLoading(true);

        // Get all collections with pack_type
        const { data: collectionsData, error: collectionsError } =
          await supabase
            .from("collections")
            .select("pack_type, pack_count")
            .not("pack_type", "is", null);

        if (collectionsError) throw collectionsError;

        // Count by pack type
        const packTypeCounts = {};
        let totalPacks = 0;

        collectionsData.forEach((collection) => {
          const packType = collection.pack_type || "unknown";
          const packCount = collection.pack_count || 1;

          if (!packTypeCounts[packType]) {
            packTypeCounts[packType] = 0;
          }

          packTypeCounts[packType] += packCount;
          totalPacks += packCount;
        });

        // Format the stats
        const formattedStats: PackTypeStats[] = [];

        // Add blister packs
        const blisterCount = packTypeCounts["blister"] || 0;
        const blisterPercentage =
          totalPacks > 0 ? (blisterCount / totalPacks) * 100 : 0;
        formattedStats.push({
          type: "Blister Packs",
          count: blisterCount,
          percentage: blisterPercentage,
          status: blisterPercentage > 40 ? "High-demanding" : "Low-demanding",
          statusColor:
            blisterPercentage > 40 ? "text-blue-400" : "text-gray-400",
        });

        // Add sachets
        const sachetCount = packTypeCounts["sachet"] || 0;
        const sachetPercentage =
          totalPacks > 0 ? (sachetCount / totalPacks) * 100 : 0;
        formattedStats.push({
          type: "Sachets",
          count: sachetCount,
          percentage: sachetPercentage,
          status: sachetPercentage > 40 ? "High-demanding" : "Low-demanding",
          statusColor:
            sachetPercentage > 40 ? "text-blue-400" : "text-gray-400",
        });

        // Add other types if they exist
        Object.keys(packTypeCounts).forEach((type) => {
          if (type !== "blister" && type !== "sachet" && type !== "unknown") {
            const count = packTypeCounts[type];
            const percentage = totalPacks > 0 ? (count / totalPacks) * 100 : 0;
            formattedStats.push({
              type: type.charAt(0).toUpperCase() + type.slice(1),
              count,
              percentage,
              status: percentage > 40 ? "High-demanding" : "Low-demanding",
              statusColor: percentage > 40 ? "text-blue-400" : "text-gray-400",
            });
          }
        });

        setPackStats(formattedStats);
      } catch (error) {
        console.error("Error fetching pack type stats:", error);
        // Set default data if there's an error
        setPackStats([
          {
            type: "Blister Packs",
            count: 0,
            percentage: 0,
            status: "Low-demanding",
            statusColor: "text-gray-400",
          },
          {
            type: "Sachets",
            count: 0,
            percentage: 0,
            status: "Low-demanding",
            statusColor: "text-gray-400",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackTypeStats();

    // Refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchPackTypeStats();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card className="bg-[#0d121f] text-white border-[#1e2738]">
      <CardHeader>
        <CardTitle>Blister vs Sachets: Current Status</CardTitle>
        <CardDescription className="text-gray-400">
          Current packing status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400">
            Loading inventory status...
          </div>
        ) : (
          <div className="space-y-4">
            {packStats.map((stat, index) => (
              <div key={index}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div>{stat.type}</div>
                  <div className={stat.statusColor}>{stat.status}</div>
                </div>
                <Progress
                  value={stat.percentage}
                  className="h-2 bg-[#1e2738]"
                  indicatorClassName={`${stat.percentage > 40 ? "bg-blue-500" : "bg-gray-500"}`}
                />
                <div className="mt-1 text-xs text-gray-400">
                  {stat.count} packs ({Math.round(stat.percentage)}%)
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryStatus;
