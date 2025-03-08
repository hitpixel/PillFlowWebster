import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface CustomerCollectionsListProps {
  customerId: string;
}

const CustomerCollectionsList = ({
  customerId,
}: CustomerCollectionsListProps) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch customer's collections
        const { data, error } = await supabase
          .from("collections")
          .select("*")
          .eq("customer_id", customerId)
          .order("collection_date", { ascending: false });

        if (error) throw error;
        setCollections(data || []);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setError("Failed to load collections");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCollections();
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-white">Loading collections...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <Card className="bg-[#0d121f] text-white border-[#1e2738]">
      <CardHeader>
        <CardTitle>Collection History</CardTitle>
        <CardDescription className="text-gray-400">
          All webster pack collections for this customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        {collections.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No collections found for this customer
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#1e2738]">
                <tr>
                  <th className="text-left p-2 text-gray-400">Date</th>
                  <th className="text-left p-2 text-gray-400">Pack ID</th>
                  <th className="text-left p-2 text-gray-400">Type</th>
                  <th className="text-left p-2 text-gray-400">Count</th>
                  <th className="text-left p-2 text-gray-400">Collected By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2738]">
                {collections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-[#1a2133]">
                    <td className="p-2">
                      {new Date(
                        collection.collection_date,
                      ).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {collection.packs_id
                        ? collection.packs_id.substring(0, 8)
                        : collection.pack_id
                          ? collection.pack_id.substring(0, 8)
                          : "N/A"}
                    </td>
                    <td className="p-2 capitalize">
                      {collection.pack_type || "blister"}
                    </td>
                    <td className="p-2">{collection.pack_count || 1}</td>
                    <td className="p-2">
                      {collection.collected_by || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerCollectionsList;
