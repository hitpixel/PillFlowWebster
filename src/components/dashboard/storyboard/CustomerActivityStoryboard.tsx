import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "../../../../supabase/supabase";

const CustomerActivityStoryboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerActivity = async () => {
      try {
        setLoading(true);

        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Get all customers for the current user only
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("id, full_name, avatar_url, status")
          .eq("user_id", userId)
          .order("full_name");

        if (customersError) throw customersError;

        // Get collections for each customer
        const customerActivity = await Promise.all(
          customersData.map(async (customer) => {
            // Get collections for this customer
            const { data: collections, error: collectionsError } =
              await supabase
                .from("collections")
                .select("*")
                .eq("customer_id", customer.id)
                .order("collection_date", { ascending: false });

            if (collectionsError) throw collectionsError;

            // Calculate collection statistics
            const collectionsCompleted = collections?.length || 0;
            let lastCollection = "Never";

            if (collections && collections.length > 0) {
              const lastDate = new Date(collections[0].collection_date);
              lastCollection = lastDate.toLocaleDateString("en-AU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            }

            // Get webster packs for this customer to calculate total expected collections
            const { data: packs, error: packsError } = await supabase
              .from("webster_packs")
              .select("id")
              .eq("customer_id", customer.id);

            if (packsError) throw packsError;

            // Get total collections from Supabase
            const { count: totalCollectionsCount, error: countError } =
              await supabase
                .from("collections")
                .select("*", { count: "exact", head: true })
                .eq("customer_id", customer.id);

            if (countError) throw countError;

            // Use actual count from database, or fallback to calculated value
            const totalCollections =
              totalCollectionsCount ||
              Math.max(collectionsCompleted, (packs?.length || 0) * 4);

            // Count total packs collected
            const totalPacksCollected =
              collections?.reduce(
                (total, collection) => total + (collection.pack_count || 1),
                0,
              ) || 0;

            return {
              ...customer,
              lastCollection,
              collectionsCompleted,
              totalCollections,
              totalPacksCollected,
            };
          }),
        );

        // Sort by most recent collection first
        const sortedCustomers = customerActivity.sort((a, b) => {
          if (a.lastCollection === "Never") return 1;
          if (b.lastCollection === "Never") return -1;
          return new Date(b.lastCollection) - new Date(a.lastCollection);
        });

        setCustomers(sortedCustomers);
      } catch (error) {
        console.error("Error fetching customer activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerActivity();

    // Refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchCustomerActivity();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-[#0a0e17] p-6">
      <Card className="bg-[#0d121f] text-white border-[#1e2738]">
        <CardHeader>
          <CardTitle>Customer Collection Activity</CardTitle>
          <CardDescription className="text-gray-400">
            Recent collection activity by customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40 text-gray-400">
              Loading customer activity...
            </div>
          ) : (
            <div className="space-y-6">
              {customers.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  No customer activity found
                </div>
              ) : (
                customers.map((customer, index) => (
                  <React.Fragment key={customer.id}>
                    {index > 0 && <Separator className="bg-[#1e2738]" />}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium overflow-hidden">
                            {customer.avatar_url ? (
                              <img
                                src={customer.avatar_url}
                                alt={customer.full_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              customer.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {customer.full_name}
                            </div>
                            <div className="text-xs text-gray-400">
                              Last collection: {customer.lastCollection}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                          {!customer.status || customer.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-blue-400">
                            {customer.totalPacksCollected} packs collected
                          </span>
                          <span className="text-gray-500">•</span>
                          <span>Last collected: {customer.lastCollection}</span>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerActivityStoryboard;
