import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Package, LineChart, ArrowUp } from "lucide-react";

interface StatisticsCardsProps {
  totalCollections?: number;
  activeCustomers?: number;
  dueCollections?: number;
  collectionRate?: number;
}

const StatisticsCards = ({
  totalCollections = 0,
  activeCustomers = 0,
  dueCollections = 0,
  collectionRate = 0,
}: StatisticsCardsProps) => {
  console.log("StatisticsCards props:", {
    totalCollections,
    activeCustomers,
    dueCollections,
    collectionRate,
  });
  return (
    <>
      <Card className="bg-[#0d121f] text-white border-[#1e2738] w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Total Collections
          </CardTitle>
          <Package className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalCollections}</div>
          <p className="text-xs text-green-400 flex items-center mt-1">
            <ArrowUp className="h-3 w-3 mr-1" />
            12% from last month
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#0d121f] text-white border-[#1e2738] w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Total Customers
          </CardTitle>
          <Users className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeCustomers}</div>
          <p className="text-xs text-gray-400 flex items-center mt-1">
            <span className="text-gray-400">No change from last month</span>
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#0d121f] text-white border-[#1e2738] w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Due This Week
          </CardTitle>
          <Calendar className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{dueCollections}</div>
          <p className="text-xs text-gray-400 flex items-center mt-1">
            <span className="text-gray-400">All collections up to date</span>
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#0d121f] text-white border-[#1e2738] w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">
            Collection Rate
          </CardTitle>
          <LineChart className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{collectionRate}%</div>
          <p className="text-xs text-green-400 flex items-center mt-1">
            <ArrowUp className="h-3 w-3 mr-1" />
            5% from last month
          </p>
        </CardContent>
      </Card>
    </>
  );
};

export default StatisticsCards;
