import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Users,
  Calendar,
  LineChart,
  ArrowUp,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          <div className="flex items-center gap-1">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Collections
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#1a2133] border-[#1e2738] text-white max-w-xs">
                  <p>
                    Total number of webster pack collections completed across
                    all customers. Each record in the collections table counts
                    as one collection.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
          <div className="flex items-center gap-1">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Customers
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#1a2133] border-[#1e2738] text-white max-w-xs">
                  <p>
                    Number of customers with status set to "active" or null.
                    Includes all customers who have at least one webster pack
                    assigned.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
          <div className="flex items-center gap-1">
            <CardTitle className="text-sm font-medium text-gray-400">
              Due This Week
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#1a2133] border-[#1e2738] text-white max-w-xs">
                  <p>
                    Number of webster packs due for collection in the next 7
                    days. Calculated based on the next_collection_date field of
                    each pack.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
          <div className="flex items-center gap-1">
            <CardTitle className="text-sm font-medium text-gray-400">
              Collection Rate
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#1a2133] border-[#1e2738] text-white max-w-xs">
                  <p>
                    Percentage of webster packs collected on time. Calculated as
                    (packs collected within the last 7 days / total packs) ×
                    100. Target is 95%.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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
