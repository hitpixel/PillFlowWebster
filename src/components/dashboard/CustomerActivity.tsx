import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "../../../supabase/supabase";

interface CustomerActivityProps {}

interface CustomerData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  status: string | null;
  lastCollection: string;
  collectionsCompleted: number;
  totalCollections: number;
}

const CustomerActivity = ({}: CustomerActivityProps) => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
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

        // Get customers with their collections for the current user only
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("id, full_name, avatar_url, status")
          .eq("user_id", userId)
          .order("full_name");

        if (customersError) throw customersError;

        // Get collections for each customer
        const customerActivity = await Promise.all(
          customersData.map(async (customer) => {
            // Get webster packs for this customer
            const { data: packs, error: packsError } = await supabase
              .from("webster_packs")
              .select("id")
              .eq("customer_id", customer.id);

            if (packsError) throw packsError;

            // Get collections for this customer directly using customer_id
            let collections = [];
            let lastCollection = "Never";
            let lastCollectionDate = null;

            const { data: collectionsData, error: collectionsError } =
              await supabase
                .from("collections")
                .select("*")
                .eq("customer_id", customer.id)
                .order("collection_date", { ascending: false });

            if (collectionsError) throw collectionsError;

            collections = collectionsData || [];

            if (collections.length > 0) {
              lastCollectionDate = new Date(collections[0].collection_date);
              lastCollection = lastCollectionDate.toLocaleDateString("en-AU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            }

            return {
              ...customer,
              lastCollection,
              lastCollectionDate,
              collectionsCompleted: collections.length,
              totalCollections: Math.max(
                collections.length,
                packs?.length * 4 || 0,
              ), // Assuming 4 collections per pack as target
            };
          }),
        );

        // Filter out customers with no collections and sort by last collection date
        const filteredActivity = customerActivity
          .filter((customer) => customer.lastCollectionDate !== null)
          .sort((a, b) => {
            if (!a.lastCollectionDate) return 1;
            if (!b.lastCollectionDate) return -1;
            return (
              b.lastCollectionDate.getTime() - a.lastCollectionDate.getTime()
            );
          })
          .slice(0, 5); // Only take the 5 most recent

        setCustomers(filteredActivity);
      } catch (error) {
        console.error("Error fetching customer activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerActivity();
  }, []);

  if (loading) {
    return (
      <Card className="bg-[#0d121f] text-white border-[#1e2738]">
        <CardHeader>
          <CardTitle>Customer Collection Activity</CardTitle>
          <CardDescription className="text-gray-400">
            Recent collection activity by customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40 text-gray-400">
            Loading customer activity...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0d121f] text-white border-[#1e2738]">
      <CardHeader>
        <CardTitle>Customer Collection Activity</CardTitle>
        <CardDescription className="text-gray-400">
          Recent collection activity by customer
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                        <div className="font-medium">{customer.full_name}</div>
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
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerActivity;
