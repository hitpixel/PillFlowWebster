import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CollectionTrendsProps {
  data?: {
    labels: string[];
    collections: number[];
    customers: number[];
  };
}

const defaultData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  collections: [12, 18, 15, 22, 30, 16, 8],
  customers: [8, 12, 10, 15, 20, 12, 6],
};

const CollectionTrends = ({ data = defaultData }: CollectionTrendsProps) => {
  // Find the max value to scale the chart properly
  const maxValue = Math.max(...data.collections, ...data.customers);

  return (
    <Card className="bg-[#0f1623] border-[#1e2738] text-white">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-200">
          Collection Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <div className="flex h-full items-end gap-2">
            {data.labels.map((label, index) => (
              <div
                key={label}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex justify-center gap-1 h-full items-end">
                  <div
                    className="w-3 bg-blue-500 rounded-t"
                    style={{
                      height: `${(data.collections[index] / maxValue) * 100}%`,
                    }}
                  ></div>
                  <div
                    className="w-3 bg-teal-500 rounded-t"
                    style={{
                      height: `${(data.customers[index] / maxValue) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-4 gap-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span className="text-sm text-gray-300">Collections</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-teal-500 rounded mr-2"></div>
            <span className="text-sm text-gray-300">Customers</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectionTrends;
