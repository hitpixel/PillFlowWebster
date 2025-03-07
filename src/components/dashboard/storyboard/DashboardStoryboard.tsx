import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Users, Calendar, Package, LineChart, ArrowUp } from "lucide-react";
import DashboardProvider from "../context/DashboardContext";

const DashboardStoryboard = () => {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen bg-[#0a0e17]">
        <div className="hidden w-64 flex-col border-r border-[#1e2738] bg-[#0d121f] text-white md:flex">
          {/* Sidebar placeholder */}
        </div>
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center gap-4 border-b border-[#1e2738] bg-[#0d121f] px-4 lg:px-6">
            {/* Header placeholder */}
          </header>
          <main className="flex-1 overflow-auto bg-[#0a0e17] p-4 md:p-6">
            <div className="grid grid-cols-4 gap-4 w-full">
              {/* Statistics Cards */}
              <Card className="bg-[#0d121f] text-white border-[#1e2738] w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Total Collections
                  </CardTitle>
                  <Package className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">8</div>
                  <p className="text-xs text-green-400 flex items-center mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0d121f] text-white border-[#1e2738] w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Total Active Customers
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">2</div>
                  <p className="text-xs text-gray-400 flex items-center mt-1">
                    <span className="text-gray-400">
                      No change from last month
                    </span>
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
                  <div className="text-3xl font-bold">0</div>
                  <p className="text-xs text-gray-400 flex items-center mt-1">
                    <span className="text-gray-400">
                      All collections up to date
                    </span>
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
                  <div className="text-3xl font-bold">100%</div>
                  <p className="text-xs text-green-400 flex items-center mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    5% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-[#0d121f] text-white border-[#1e2738]">
                <CardHeader>
                  <CardTitle>Collections Over Time</CardTitle>
                  <CardDescription className="text-gray-400">
                    Last 6 months of collection data
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  {/* Chart placeholder */}
                  <div className="h-[240px] w-full bg-[#0d121f]"></div>
                </CardContent>
              </Card>

              <div className="col-span-3">
                <Card className="bg-[#0d121f] text-white border-[#1e2738]">
                  <CardHeader>
                    <CardTitle>Customer Collection Activity</CardTitle>
                    <CardDescription className="text-gray-400">
                      Recent collection activity by customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Customer activity placeholder */}
                      <div className="h-[200px] w-full bg-[#0d121f]"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* More cards placeholder */}
            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default DashboardStoryboard;
