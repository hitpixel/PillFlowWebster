import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import { supabase } from "../../../supabase/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Package,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, subMonths } from "date-fns";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [collections, setCollections] = useState([]);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collectionStats, setCollectionStats] = useState([]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch customer details
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", id)
          .single();

        if (customerError) throw customerError;
        setCustomer(customerData);

        // Fetch customer's webster packs
        const { data: packsData, error: packsError } = await supabase
          .from("webster_packs")
          .select("*")
          .eq("customer_id", id)
          .order("pack_name");

        if (packsError) throw packsError;
        setPacks(packsData || []);

        // Fetch customer's collections
        const { data: collectionsData, error: collectionsError } =
          await supabase
            .from("collections")
            .select("*")
            .eq("customer_id", id)
            .order("collection_date", { ascending: false });

        if (collectionsError) throw collectionsError;
        setCollections(collectionsData || []);

        // Generate collection stats for the chart (last 6 months)
        const today = new Date();
        const sixMonthsAgo = subMonths(today, 6);

        // Initialize monthly data
        const monthlyData = {};
        for (let i = 0; i < 6; i++) {
          const monthDate = subMonths(today, i);
          const monthKey = format(monthDate, "yyyy-MM");
          monthlyData[monthKey] = { month: monthKey, collections: 0, packs: 0 };
        }

        // Count collections by month
        collectionsData?.forEach((collection) => {
          const date = parseISO(collection.collection_date);
          const monthKey = format(date, "yyyy-MM");

          if (monthlyData[monthKey]) {
            monthlyData[monthKey].collections += 1;
            monthlyData[monthKey].packs += collection.pack_count || 1;
          }
        });

        // Convert to array and sort by month
        const statsArray = Object.values(monthlyData).sort((a, b) =>
          a.month.localeCompare(b.month),
        );
        setCollectionStats(statsArray);
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Customer Details">
        <div className="flex justify-center items-center h-64">
          <div className="text-white">Loading customer data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Customer Details">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-400">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout title="Customer Details">
        <div className="flex justify-center items-center h-64">
          <div className="text-white">Customer not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Customer Details">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/customers")}
              className="bg-[#1a2133] border-[#1e2738] text-gray-300 hover:bg-[#232d42] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-white">
              {customer.full_name}
            </h1>
          </div>
          <Badge
            className={`${!customer.status || customer.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
          >
            {!customer.status || customer.status === "active"
              ? "Active"
              : "Inactive"}
          </Badge>
        </div>

        {/* Customer Profile Card */}
        <Card className="bg-[#0d121f] text-white border-[#1e2738]">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-2 border-[#1e2738]">
                  <AvatarImage
                    src={
                      customer.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.full_name}`
                    }
                    alt={customer.full_name}
                  />
                  <AvatarFallback className="bg-[#1a2133] text-2xl">
                    {customer.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-semibold">
                  {customer.full_name}
                </h2>
                <p className="text-sm text-gray-400">
                  ID: {customer.id.substring(0, 8)}
                </p>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300">{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300">{customer.address}</span>
                  </div>
                )}
                {customer.date_of_birth && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300">
                      DOB:{" "}
                      {new Date(customer.date_of_birth).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Packs:</span>
                  <span className="font-semibold">{packs.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Collections:</span>
                  <span className="font-semibold">{collections.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Last Collection:</span>
                  <span className="font-semibold">
                    {collections.length > 0
                      ? new Date(
                          collections[0].collection_date,
                        ).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="collections" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a2133]">
            <TabsTrigger
              value="collections"
              className="data-[state=active]:bg-[#232d42]"
            >
              <Package className="mr-2 h-4 w-4" />
              Collections History
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#232d42]"
            >
              <User className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collections" className="space-y-4 mt-4">
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
                          <th className="text-left p-2 text-gray-400">
                            Pack ID
                          </th>
                          <th className="text-left p-2 text-gray-400">Type</th>
                          <th className="text-left p-2 text-gray-400">Count</th>
                          <th className="text-left p-2 text-gray-400">
                            Collected By
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2738]">
                        {collections.map((collection) => (
                          <tr
                            key={collection.id}
                            className="hover:bg-[#1a2133]"
                          >
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
                            <td className="p-2">
                              {collection.pack_count || 1}
                            </td>
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-4">
            <Card className="bg-[#0d121f] text-white border-[#1e2738]">
              <CardHeader>
                <CardTitle>Collection Trends</CardTitle>
                <CardDescription className="text-gray-400">
                  Monthly collection activity over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {collectionStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={collectionStats}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorCollections"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorPacks"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2738" />
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          tickFormatter={(value) => {
                            const date = parseISO(`${value}-01`);
                            return format(date, "MMM yyyy");
                          }}
                        />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a2133",
                            border: "1px solid #1e2738",
                            borderRadius: "6px",
                            color: "#ffffff",
                          }}
                          labelFormatter={(value) => {
                            const date = parseISO(`${value}-01`);
                            return format(date, "MMMM yyyy");
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="collections"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorCollections)"
                          name="Collections"
                        />
                        <Area
                          type="monotone"
                          dataKey="packs"
                          stroke="#10b981"
                          fillOpacity={0.5}
                          fill="url(#colorPacks)"
                          name="Packs"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No collection data available
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-center gap-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-300">Collections</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-300">Packs</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-[#0d121f] text-white border-[#1e2738]">
                <CardHeader>
                  <CardTitle>Webster Packs</CardTitle>
                  <CardDescription className="text-gray-400">
                    Active webster packs for this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {packs.length === 0 ? (
                    <div className="text-center py-4 text-gray-400">
                      No webster packs found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {packs.map((pack) => (
                        <div
                          key={pack.id}
                          className="flex items-center justify-between p-2 rounded-md bg-[#1a2133]"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-400" />
                            <span>{pack.pack_name}</span>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {pack.status || "Active"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#0d121f] text-white border-[#1e2738]">
                <CardHeader>
                  <CardTitle>Collection Summary</CardTitle>
                  <CardDescription className="text-gray-400">
                    Statistics about customer's collections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Collections</span>
                      <span className="font-medium">{collections.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">
                        Total Packs Collected
                      </span>
                      <span className="font-medium">
                        {collections.reduce(
                          (total, c) => total + (c.pack_count || 1),
                          0,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Blister Packs</span>
                      <span className="font-medium">
                        {
                          collections.filter(
                            (c) => !c.pack_type || c.pack_type === "blister",
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Sachets</span>
                      <span className="font-medium">
                        {
                          collections.filter((c) => c.pack_type === "sachet")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">First Collection</span>
                      <span className="font-medium">
                        {collections.length > 0
                          ? new Date(
                              collections[
                                collections.length - 1
                              ].collection_date,
                            ).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDetails;
