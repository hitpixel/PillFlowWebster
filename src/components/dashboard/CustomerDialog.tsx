import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, Calendar, User, Phone, Mail, MapPin } from "lucide-react";
import CustomerCollectionChart from "./CustomerCollectionChart";
import CustomerCollectionsList from "./CustomerCollectionsList";

interface CustomerDialogProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomerDialog = ({
  customerId,
  open,
  onOpenChange,
}: CustomerDialogProps) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [packs, setPacks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!open || !customerId) return;

      try {
        setLoading(true);
        setError("");

        // Fetch customer details
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", customerId)
          .single();

        if (customerError) throw customerError;
        setCustomer(customerData);

        // Fetch customer's webster packs
        const { data: packsData, error: packsError } = await supabase
          .from("webster_packs")
          .select("*")
          .eq("customer_id", customerId)
          .order("pack_name");

        if (packsError) throw packsError;
        setPacks(packsData || []);

        // Fetch customer's collections
        const { data: collectionsData, error: collectionsError } =
          await supabase
            .from("collections")
            .select("*")
            .eq("customer_id", customerId)
            .order("collection_date", { ascending: false });

        if (collectionsError) throw collectionsError;
        setCollections(collectionsData || []);
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerId, open]);

  const handleViewFullDashboard = () => {
    onOpenChange(false);
    navigate(`/customers/${customerId}`);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0d121f] text-white border-[#1e2738] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {loading ? "Loading..." : customer?.full_name || "Customer Details"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-white">Loading customer data...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-400">{error}</div>
          </div>
        ) : customer ? (
          <>
            {/* Customer Profile Summary */}
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16 border-2 border-[#1e2738]">
                <AvatarImage
                  src={
                    customer.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.full_name}`
                  }
                  alt={customer.full_name}
                />
                <AvatarFallback className="bg-[#1a2133] text-xl">
                  {customer.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {customer.full_name}
                  </h2>
                  <Badge
                    className={`${!customer.status || customer.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                  >
                    {!customer.status || customer.status === "active"
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">
                  ID: {customer.id.substring(0, 8)}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {customer.email && (
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3 text-blue-400" />
                      <span className="text-gray-300">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="h-3 w-3 text-blue-400" />
                      <span className="text-gray-300">{customer.phone}</span>
                    </div>
                  )}
                  {customer.date_of_birth && (
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-blue-400" />
                      <span className="text-gray-300">
                        DOB:{" "}
                        {new Date(customer.date_of_birth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-400">Total Collections</div>
                <div className="text-2xl font-bold">{collections.length}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {collections.length > 0
                    ? `Last: ${new Date(collections[0].collection_date).toLocaleDateString()}`
                    : "No collections"}
                </div>
              </div>
            </div>

            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#1a2133]">
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-[#232d42]"
                >
                  <User className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="collections"
                  className="data-[state=active]:bg-[#232d42]"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Collections
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="mt-4">
                <div className="space-y-4">
                  <div className="bg-[#1a2133] rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-2">
                      Collection Trends
                    </h3>
                    <CustomerCollectionChart customerId={customerId} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1a2133] rounded-lg p-4">
                      <h3 className="text-sm font-medium mb-2">
                        Webster Packs
                      </h3>
                      {packs.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No webster packs found
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                          {packs.map((pack) => (
                            <div
                              key={pack.id}
                              className="flex items-center justify-between p-2 rounded-md bg-[#0d121f]"
                            >
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-blue-400" />
                                <span className="text-sm">
                                  {pack.pack_name}
                                </span>
                              </div>
                              <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                {pack.status || "Active"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#1a2133] rounded-lg p-4">
                      <h3 className="text-sm font-medium mb-2">
                        Collection Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">
                            Total Collections
                          </span>
                          <span className="font-medium">
                            {collections.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">
                            Total Packs
                          </span>
                          <span className="font-medium">
                            {collections.reduce(
                              (total, c) => total + (c.pack_count || 1),
                              0,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">
                            Blister Packs
                          </span>
                          <span className="font-medium">
                            {
                              collections.filter(
                                (c) =>
                                  !c.pack_type || c.pack_type === "blister",
                              ).length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Sachets</span>
                          <span className="font-medium">
                            {
                              collections.filter(
                                (c) => c.pack_type === "sachet",
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="collections" className="mt-4">
                <CustomerCollectionsList customerId={customerId} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-white">Customer not found</div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleViewFullDashboard}
          >
            View Full Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDialog;
