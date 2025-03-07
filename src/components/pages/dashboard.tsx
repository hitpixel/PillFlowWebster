import React, { useState, useEffect } from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import StatisticsCards from "../dashboard/StatisticsCards";
import CollectionsChart from "../dashboard/CollectionsChart";
import CustomerActivity from "../dashboard/CustomerActivity";
import InventoryStatus from "../dashboard/InventoryStatus";
import ActivityFeed from "../dashboard/ActivityFeed";
import UpcomingCollections from "../dashboard/UpcomingCollections";
import StatisticsCardsStoryboard from "../dashboard/storyboard/StatisticsCardsStoryboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getDashboardStats, getRecentActivity } from "@/lib/api";
import { useDashboard } from "../dashboard/context/DashboardContext";

const Dashboard = () => {
  const {
    totalCustomers,
    activeCustomers,
    totalCollections,
    dueCollections,
    collectionRate,
    refreshDashboard,
  } = useDashboard();

  useEffect(() => {
    // Force immediate refresh when component mounts
    console.log("Dashboard component mounted, refreshing data...");
    refreshDashboard();

    // Do another refresh after a short delay to ensure data is loaded
    const initialTimeout = setTimeout(() => {
      console.log("Dashboard initial timeout refresh");
      refreshDashboard();
    }, 1000);

    // Set up a refresh interval (every 5 seconds for updates)
    const intervalId = setInterval(() => {
      console.log("Dashboard refresh interval triggered");
      refreshDashboard();
    }, 5000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [refreshDashboard]);

  return (
    <DashboardLayout title="Dashboard">
      <StatisticsCardsStoryboard />
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-[#0d121f] text-white border-[#1e2738] flex flex-col">
          <CardHeader>
            <CardTitle>Collections Over Time</CardTitle>
            <CardDescription className="text-gray-400">
              Last 6 months of collection data
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2 flex-1">
            <div className="h-full max-h-[500px]">
              <CollectionsChart />
            </div>
          </CardContent>
        </Card>

        <div className="col-span-3">
          <CustomerActivity />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <UpcomingCollections />
        <InventoryStatus />
        <ActivityFeed />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
