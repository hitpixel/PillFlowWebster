import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar, Package } from "lucide-react";
import { supabase } from "../../../supabase/supabase";

interface UpcomingCollectionsProps {}

interface UpcomingCollection {
  id: string;
  packName: string;
  customerName: string;
  dueDate: string;
}

const UpcomingCollections = ({}: UpcomingCollectionsProps) => {
  const [upcomingCollections, setUpcomingCollections] = useState<
    UpcomingCollection[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingCollections = async () => {
      try {
        setLoading(true);

        // Get current date and date 7 days from now
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Get packs due for collection in the next 7 days for the current user's customers only
        const { data: packsData, error: packsError } = await supabase
          .from("webster_packs")
          .select(
            `
            id, 
            pack_name, 
            next_collection_date,
            customers!inner(id, full_name, user_id)
          `,
          )
          .eq("customers.user_id", userId)
          .gte("next_collection_date", today.toISOString())
          .lte("next_collection_date", nextWeek.toISOString())
          .order("next_collection_date");

        if (packsError) throw packsError;

        // Format upcoming collections
        const formattedCollections = packsData.map((pack) => ({
          id: pack.id,
          packName: pack.pack_name,
          customerName: pack.customers?.full_name || "Unknown",
          dueDate: new Date(pack.next_collection_date).toLocaleDateString(
            "en-AU",
            { day: "2-digit", month: "2-digit", year: "numeric" },
          ),
        }));

        setUpcomingCollections(formattedCollections);
      } catch (error) {
        console.error("Error fetching upcoming collections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingCollections();
  }, []);

  return (
    <Card className="bg-[#0d121f] text-white border-[#1e2738]">
      <CardHeader>
        <CardTitle>Upcoming Collections</CardTitle>
        <CardDescription className="text-gray-400">Next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40 text-gray-400">
            Loading upcoming collections...
          </div>
        ) : upcomingCollections.length > 0 ? (
          <div className="space-y-3">
            {upcomingCollections.map((collection) => (
              <div
                key={collection.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-[#1a2133]"
              >
                <div className="rounded-full bg-blue-500/20 p-2">
                  <Package className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-sm">
                      {collection.customerName}
                    </h4>
                    <span className="text-xs text-gray-400">
                      {collection.dueDate}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {collection.packName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[#1e2738] bg-[#0a0e17] p-4 text-center">
            <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400">
              No upcoming collections this week
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingCollections;
