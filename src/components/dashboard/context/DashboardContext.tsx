import * as React from "react";
import { getDashboardStats, getRecentActivity } from "@/lib/api";

type ActivityItem = {
  type: string;
  description: string;
  time: string;
  icon?: React.ReactNode;
};

type DashboardContextType = {
  totalCustomers: number;
  activeCustomers: number;
  totalCollections: number;
  dueCollections: number;
  collectionRate: number;
  recentActivities: ActivityItem[];
  refreshDashboard: () => void;
};

const initialState: DashboardContextType = {
  totalCustomers: 0,
  activeCustomers: 0,
  totalCollections: 0,
  dueCollections: 0,
  collectionRate: 0,
  recentActivities: [],
  refreshDashboard: () => {},
};

export const DashboardContext =
  React.createContext<DashboardContextType>(initialState);

// Named function component for consistent exports
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [dashboardData, setDashboardData] = React.useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalCollections: 0,
    dueCollections: 0,
    collectionRate: 0,
    recentActivities: [] as ActivityItem[],
  });

  const calculateDashboardData = React.useCallback(async () => {
    try {
      console.log("Fetching dashboard data...");
      const stats = await getDashboardStats();
      console.log("Dashboard stats:", stats);
      const activity = await getRecentActivity();

      const recentActivities: ActivityItem[] = [];

      if (activity.recentCollections && activity.recentCollections.length > 0) {
        activity.recentCollections.forEach((collection) => {
          recentActivities.push({
            type: "collection",
            description: `Collection completed for ${collection.customers?.full_name || "Patient"}`,
            time: new Date(collection.collection_date).toLocaleDateString(
              "en-AU",
              { day: "2-digit", month: "2-digit", year: "numeric" },
            ),
          });
        });
      }

      if (activity.recentCustomers && activity.recentCustomers.length > 0) {
        activity.recentCustomers.forEach((customer) => {
          recentActivities.push({
            type: "customer",
            description: `New customer added: ${customer.full_name}`,
            time: new Date(customer.created_at).toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
          });
        });
      }

      if (recentActivities.length === 0) {
        recentActivities.push({
          type: "system",
          description: "No recent activity",
          time: "Now",
        });
      }

      setDashboardData({
        totalCustomers: stats.totalCustomers,
        activeCustomers: stats.activeCustomers,
        totalCollections: stats.totalCollections,
        dueCollections: stats.dueCollections,
        collectionRate: stats.collectionRate,
        recentActivities,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData({
        totalCustomers: 0,
        activeCustomers: 0,
        totalCollections: 0,
        dueCollections: 0,
        collectionRate: 0,
        recentActivities: [],
      });
    }
  }, []);

  React.useEffect(() => {
    // Initial data fetch
    calculateDashboardData();

    // Secondary fetch after a short delay to ensure data is loaded
    const initialTimeout = setTimeout(() => {
      calculateDashboardData();
    }, 500);

    // Regular interval updates
    const intervalId = setInterval(() => {
      calculateDashboardData();
    }, 5000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [calculateDashboardData]);

  const refreshDashboard = React.useCallback(() => {
    calculateDashboardData();
  }, [calculateDashboardData]);

  const value = React.useMemo(() => {
    return {
      ...dashboardData,
      refreshDashboard,
    };
  }, [dashboardData, refreshDashboard]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// Named function for consistent exports
export function useDashboard() {
  const context = React.useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
