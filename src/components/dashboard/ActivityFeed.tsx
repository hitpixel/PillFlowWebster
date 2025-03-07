import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Package, Users, Calendar, Settings } from "lucide-react";
import { supabase } from "../../../supabase/supabase";

interface ActivityFeedProps {}

interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const ActivityFeed = ({}: ActivityFeedProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);

        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Get recent collections for the current user only
        const { data: collectionsData, error: collectionsError } =
          await supabase
            .from("collections")
            .select(
              `
            id, 
            collection_date, 
            collected_by, 
            status,
            webster_packs!inner(id, pack_name, customer_id),
            customers!inner(id, full_name)
          `,
            )
            .eq("customers.user_id", userId)
            .order("collection_date", { ascending: false })
            .limit(3);

        if (collectionsError) throw collectionsError;

        // Get recent customer additions
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(2);

        if (customersError) throw customersError;

        // Format activities
        const formattedActivities: Activity[] = [];

        // Add collection activities
        collectionsData.forEach((collection, index) => {
          formattedActivities.push({
            id: collection.id,
            type: "collection",
            description: "Collection completed",
            time: `${collection.customers?.full_name} • ${new Date(collection.collection_date).toLocaleDateString()}`,
            icon: <Package className="h-4 w-4" />,
            iconBg: index % 2 === 0 ? "bg-blue-500/20" : "bg-purple-500/20",
            iconColor: index % 2 === 0 ? "text-blue-400" : "text-purple-400",
          });
        });

        // Add customer activities
        customersData.forEach((customer) => {
          formattedActivities.push({
            id: customer.id,
            type: "customer",
            description: "New customer added",
            time: `${customer.full_name} • ${new Date(customer.created_at).toLocaleDateString()}`,
            icon: <Users className="h-4 w-4" />,
            iconBg: "bg-green-500/20",
            iconColor: "text-green-400",
          });
        });

        // Sort by most recent first (assuming created_at is more recent than collection_date)
        formattedActivities.sort((a, b) => {
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        });

        setActivities(formattedActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
        // Add fallback activities if there's an error
        setActivities([
          {
            id: "1",
            type: "system",
            description: "System initialized",
            time: "System • Just now",
            icon: <Settings className="h-4 w-4" />,
            iconBg: "bg-blue-500/20",
            iconColor: "text-blue-400",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <Card className="bg-[#0d121f] text-white border-[#1e2738]">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription className="text-gray-400">
          Latest system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400">
            Loading activity...
          </div>
        ) : (
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`rounded-full ${activity.iconBg} p-1`}>
                    <div className={activity.iconColor}>{activity.icon}</div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
