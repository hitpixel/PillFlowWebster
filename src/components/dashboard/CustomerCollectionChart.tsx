import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, subMonths } from "date-fns";
import { supabase } from "../../../supabase/supabase";

interface CustomerCollectionChartProps {
  customerId: string;
}

const CustomerCollectionChart = ({
  customerId,
}: CustomerCollectionChartProps) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);

        // Fetch customer's collections
        const { data: collectionsData, error: collectionsError } =
          await supabase
            .from("collections")
            .select("*")
            .eq("customer_id", customerId)
            .order("collection_date");

        if (collectionsError) throw collectionsError;

        // Generate collection stats for the chart (last 6 months)
        const today = new Date();

        // Initialize monthly data
        const monthlyData = {};
        for (let i = 0; i < 6; i++) {
          const monthDate = subMonths(today, i);
          const monthKey = format(monthDate, "yyyy-MM");
          monthlyData[monthKey] = { month: monthKey, collections: 0, packs: 0 };
        }

        // Count collections by month
        collectionsData?.forEach((collection) => {
          const date = parseISO(collection.collection_date);
          const monthKey = format(date, "yyyy-MM");

          if (monthlyData[monthKey]) {
            monthlyData[monthKey].collections += 1;
            monthlyData[monthKey].packs += collection.pack_count || 1;
          }
        });

        // Convert to array and sort by month
        const statsArray = Object.values(monthlyData).sort((a, b) =>
          a.month.localeCompare(b.month),
        );
        setChartData(statsArray);
      } catch (err) {
        console.error("Error fetching collection data:", err);
        // Set default data if there's an error
        setChartData([
          { month: "2023-01", collections: 0, packs: 0 },
          { month: "2023-02", collections: 0, packs: 0 },
          { month: "2023-03", collections: 0, packs: 0 },
          { month: "2023-04", collections: 0, packs: 0 },
          { month: "2023-05", collections: 0, packs: 0 },
          { month: "2023-06", collections: 0, packs: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCollectionData();
    }
  }, [customerId]);

  return (
    <div className="h-[300px] w-full">
      {loading ? (
        <div className="flex justify-center items-center h-full text-gray-400">
          Loading collection data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPacks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2738" />
            <XAxis
              dataKey="month"
              stroke="#64748b"
              tickFormatter={(value) => {
                const date = parseISO(`${value}-01`);
                return format(date, "MMM yyyy");
              }}
            />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a2133",
                border: "1px solid #1e2738",
                borderRadius: "6px",
                color: "#ffffff",
              }}
              labelFormatter={(value) => {
                const date = parseISO(`${value}-01`);
                return format(date, "MMMM yyyy");
              }}
            />
            <Area
              type="monotone"
              dataKey="collections"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorCollections)"
              name="Collections"
            />
            <Area
              type="monotone"
              dataKey="packs"
              stroke="#10b981"
              fillOpacity={0.5}
              fill="url(#colorPacks)"
              name="Packs"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CustomerCollectionChart;
