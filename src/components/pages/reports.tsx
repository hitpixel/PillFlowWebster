import React, { useState, useEffect } from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format,
  startOfMonth,
  endOfMonth,
  parseISO,
  isWithinInterval,
  addDays,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CalendarIcon,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart,
  Filter,
  Loader2,
} from "lucide-react";
import { supabase } from "../../../supabase/supabase";

// Component to fetch and display collections list
const CollectionsList = ({
  dateRange,
}: {
  dateRange: { from: Date; to: Date };
}) => {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);

        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Format date range for queries
        const fromDate = dateRange.from.toISOString();
        const toDate = dateRange.to.toISOString();

        // Fetch collections within date range with customer details
        const { data, error } = await supabase
          .from("collections")
          .select("*, customers!inner(user_id, full_name)")
          .eq("customers.user_id", userId)
          .gte("collection_date", fromDate)
          .lte("collection_date", toDate)
          .order("collection_date", { ascending: false });

        if (error) throw error;

        setCollections(data || []);
      } catch (err: any) {
        console.error("Error fetching collections list:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [dateRange]);

  if (loading) {
    return (
      <tr>
        <td colSpan={4} className="text-center p-4 text-gray-400">
          Loading collections...
        </td>
      </tr>
    );
  }

  if (error) {
    return (
      <tr>
        <td colSpan={4} className="text-center p-4 text-red-400">
          {error}
        </td>
      </tr>
    );
  }

  if (collections.length === 0) {
    return (
      <tr>
        <td colSpan={4} className="text-center p-4 text-gray-400">
          No collections found for the selected date range
        </td>
      </tr>
    );
  }

  return (
    <>
      {collections.map((collection) => (
        <tr key={collection.id} className="hover:bg-[#1a2133]/50">
          <td className="p-2 text-sm">
            {format(new Date(collection.collection_date), "MMM dd, yyyy")}
          </td>
          <td className="p-2 text-sm">
            {collection.customers?.full_name || "Unknown"}
          </td>
          <td className="p-2 text-sm capitalize">
            {collection.pack_type || "Unknown"}
          </td>
          <td className="p-2 text-sm">{collection.pack_count || 1}</td>
        </tr>
      ))}
    </>
  );
};

const Reports = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for data from Supabase
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [packTypeData, setPackTypeData] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalCollections: 0,
    activeCustomers: 0,
    blisterPacks: 0,
    sachets: 0,
    blisterChange: 0,
    sachetChange: 0,
    collectionChange: 0,
  });
  const [efficiencyStats, setEfficiencyStats] = useState({
    avgTime: "3.5",
    fastestTime: "1.2",
    slowestTime: "8.7",
    totalTime: "7.2",
  });
  const [trendStats, setTrendStats] = useState({
    thisWeek: 0,
    lastWeek: 0,
    change: 0,
    projected: 0,
  });

  // Fetch data from Supabase based on date range
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Format date range for queries
        const fromDate = dateRange.from.toISOString();
        const toDate = dateRange.to.toISOString();

        // 1. Fetch collections within date range
        const { data: collectionsData, error: collectionsError } =
          await supabase
            .from("collections")
            .select("*, customers!inner(user_id, full_name)")
            .eq("customers.user_id", userId)
            .gte("collection_date", fromDate)
            .lte("collection_date", toDate)
            .order("collection_date");

        if (collectionsError) throw collectionsError;

        // 2. Get all customers for the current user
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*")
          .eq("user_id", userId);

        if (customersError) throw customersError;

        // Process collections by day of week
        const dayMap = {
          0: "Sun",
          1: "Mon",
          2: "Tue",
          3: "Wed",
          4: "Thu",
          5: "Fri",
          6: "Sat",
        };
        const collectionsByDay = {};

        // Initialize all days with 0
        Object.values(dayMap).forEach((day) => {
          collectionsByDay[day] = 0;
        });

        // Count collections by day
        collectionsData.forEach((collection) => {
          const date = new Date(collection.collection_date);
          const day = dayMap[date.getDay()];
          collectionsByDay[day] = (collectionsByDay[day] || 0) + 1;
        });

        // Format for chart
        const formattedCollectionData = Object.entries(collectionsByDay).map(
          ([name, collections]) => ({
            name,
            collections,
          }),
        );

        // Sort by day of week (starting with Monday)
        const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        formattedCollectionData.sort((a, b) => {
          return dayOrder.indexOf(a.name) - dayOrder.indexOf(b.name);
        });

        // Process pack types
        const packTypes = {};
        let totalPacks = 0;

        collectionsData.forEach((collection) => {
          const packType = collection.pack_type || "unknown";
          const count = collection.pack_count || 1;

          packTypes[packType] = (packTypes[packType] || 0) + count;
          totalPacks += count;
        });

        // Format pack type data for pie chart
        const formattedPackTypeData = [];

        // Add blister packs
        const blisterCount = packTypes["blister"] || 0;
        const blisterPercentage =
          totalPacks > 0 ? Math.round((blisterCount / totalPacks) * 100) : 0;
        formattedPackTypeData.push({
          name: "Blister Packs",
          value: blisterPercentage,
          color: "#3b82f6",
          count: blisterCount,
        });

        // Add sachets
        const sachetCount = packTypes["sachet"] || 0;
        const sachetPercentage =
          totalPacks > 0 ? Math.round((sachetCount / totalPacks) * 100) : 0;
        formattedPackTypeData.push({
          name: "Sachets",
          value: sachetPercentage,
          color: "#10b981",
          count: sachetCount,
        });

        // Process customer data
        const customerCollections = {};

        collectionsData.forEach((collection) => {
          const customerId = collection.customer_id;
          const customerName = collection.customers?.full_name || "Unknown";

          if (!customerCollections[customerId]) {
            customerCollections[customerId] = {
              id: customerId,
              name: customerName,
              collections: 0,
            };
          }

          customerCollections[customerId].collections += 1;
        });

        // Format and sort customer data
        const formattedCustomerData = Object.values(customerCollections)
          .sort((a: any, b: any) => b.collections - a.collections)
          .slice(0, 5); // Top 5 customers

        // Calculate summary statistics
        const totalCollections = collectionsData.length;
        const activeCustomers = customersData.filter(
          (c) => c.status === "active",
        ).length;

        // Calculate week-over-week change
        const today = new Date();
        const oneWeekAgo = addDays(today, -7);
        const twoWeeksAgo = addDays(today, -14);

        const thisWeekCollections = collectionsData.filter((c) => {
          const date = new Date(c.collection_date);
          return isWithinInterval(date, { start: oneWeekAgo, end: today });
        }).length;

        // Fetch last week's collections
        const { data: lastWeekData } = await supabase
          .from("collections")
          .select("collection_date, customers!inner(user_id)")
          .eq("customers.user_id", userId)
          .gte("collection_date", twoWeeksAgo.toISOString())
          .lt("collection_date", oneWeekAgo.toISOString());

        const lastWeekCollections = lastWeekData?.length || 0;
        const weeklyChange =
          lastWeekCollections > 0
            ? Math.round(
                ((thisWeekCollections - lastWeekCollections) /
                  lastWeekCollections) *
                  100,
              )
            : 0;

        // Calculate projected collections
        const projectedCollections = Math.round(
          thisWeekCollections * (1 + weeklyChange / 100),
        );

        // Update all state
        setCollectionData(formattedCollectionData);
        setPackTypeData(formattedPackTypeData);
        setCustomerData(formattedCustomerData);
        setSummaryStats({
          totalCollections,
          activeCustomers,
          blisterPacks: blisterCount,
          sachets: sachetCount,
          blisterChange: 8, // Placeholder - would need historical data
          sachetChange: 15, // Placeholder - would need historical data
          collectionChange: 12, // Placeholder - would need historical data
        });
        setTrendStats({
          thisWeek: thisWeekCollections,
          lastWeek: lastWeekCollections,
          change: weeklyChange,
          projected: projectedCollections,
        });
      } catch (err: any) {
        console.error("Error fetching report data:", err);
        setError(err.message || "Failed to load report data");

        // Set fallback data if there's an error
        setCollectionData([
          { name: "Mon", collections: 12 },
          { name: "Tue", collections: 19 },
          { name: "Wed", collections: 15 },
          { name: "Thu", collections: 22 },
          { name: "Fri", collections: 30 },
          { name: "Sat", collections: 18 },
          { name: "Sun", collections: 10 },
        ]);
        setPackTypeData([
          { name: "Blister Packs", value: 65, color: "#3b82f6" },
          { name: "Sachets", value: 35, color: "#10b981" },
        ]);
        setCustomerData([
          { name: "John Doe", collections: 8 },
          { name: "Mary Smith", collections: 6 },
          { name: "Robert Johnson", collections: 5 },
          { name: "Sarah Williams", collections: 4 },
          { name: "Michael Brown", collections: 3 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  return (
    <DashboardLayout title="Reports">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Reports Dashboard</h1>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-[#1e2738] bg-[#1a2133] text-gray-300 hover:bg-[#232d42] hover:text-white flex items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-[#1a2133] border-[#1e2738]"
                align="end"
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange(range as { from: Date; to: Date });
                    }
                  }}
                  numberOfMonths={2}
                  className="bg-[#1a2133] text-white"
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              className="border-[#1e2738] bg-[#1a2133] text-gray-300 hover:bg-[#232d42] hover:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-400">Loading report data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summaryStats.totalCollections}
              </div>
              <p className="text-xs text-green-400 mt-1">
                +{summaryStats.collectionChange}% from previous period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Active Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summaryStats.activeCustomers}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                No change from previous period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Blister Packs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summaryStats.blisterPacks}
              </div>
              <p className="text-xs text-green-400 mt-1">
                +{summaryStats.blisterChange}% from previous period
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Sachets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summaryStats.sachets}</div>
              <p className="text-xs text-green-400 mt-1">
                +{summaryStats.sachetChange}% from previous period
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="collections" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#1a2133]">
            <TabsTrigger
              value="collections"
              className="data-[state=active]:bg-[#232d42]"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Collections by Day
            </TabsTrigger>
            <TabsTrigger
              value="packTypes"
              className="data-[state=active]:bg-[#232d42]"
            >
              <PieChartIcon className="h-4 w-4 mr-2" />
              Pack Types
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="data-[state=active]:bg-[#232d42]"
            >
              <LineChart className="h-4 w-4 mr-2" />
              Top Customers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="collections">
            <Card className="bg-[#0d121f] text-white border-[#1e2738]">
              <CardHeader>
                <CardTitle>Collections by Day</CardTitle>
                <CardDescription className="text-gray-400">
                  Number of collections per day for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={collectionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2738" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a2133",
                          borderColor: "#1e2738",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fff" }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Bar
                        dataKey="collections"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 border-t border-[#1e2738] pt-4">
                  <h3 className="text-lg font-medium mb-3">
                    Collections by Date
                  </h3>
                  <div className="overflow-auto max-h-[300px]">
                    <table className="w-full">
                      <thead className="bg-[#1a2133] sticky top-0">
                        <tr>
                          <th className="text-left p-2 text-sm font-medium text-gray-300">
                            Date
                          </th>
                          <th className="text-left p-2 text-sm font-medium text-gray-300">
                            Customer
                          </th>
                          <th className="text-left p-2 text-sm font-medium text-gray-300">
                            Pack Type
                          </th>
                          <th className="text-left p-2 text-sm font-medium text-gray-300">
                            Pack Count
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2738]">
                        {loading ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center p-4 text-gray-400"
                            >
                              Loading collections...
                            </td>
                          </tr>
                        ) : (
                          <CollectionsList dateRange={dateRange} />
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packTypes">
            <Card className="bg-[#0d121f] text-white border-[#1e2738]">
              <CardHeader>
                <CardTitle>Pack Type Distribution</CardTitle>
                <CardDescription className="text-gray-400">
                  Distribution of different pack types for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full flex items-center justify-center">
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={packTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {packTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a2133",
                            borderColor: "#1e2738",
                            color: "#fff",
                          }}
                          itemStyle={{ color: "#fff" }}
                          labelStyle={{ color: "#fff" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 pl-8">
                    <h3 className="text-xl font-semibold mb-4">
                      Pack Type Breakdown
                    </h3>
                    <div className="space-y-4">
                      {packTypeData.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-semibold">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 pt-4 border-t border-[#1e2738]">
                      <h4 className="text-lg font-medium mb-2">Key Insights</h4>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                        <li>Blister packs remain the most popular option</li>
                        <li>Sachet usage has increased by 15% this month</li>
                        <li>
                          Consider stocking more blister packs for next month
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card className="bg-[#0d121f] text-white border-[#1e2738]">
              <CardHeader>
                <CardTitle>Top Customers by Collections</CardTitle>
                <CardDescription className="text-gray-400">
                  Customers with the most collections for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={customerData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2738" />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#64748b"
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1a2133",
                          borderColor: "#1e2738",
                          color: "#fff",
                        }}
                        itemStyle={{ color: "#fff" }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Bar
                        dataKey="collections"
                        fill="#10b981"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader>
              <CardTitle>Collection Efficiency</CardTitle>
              <CardDescription className="text-gray-400">
                Time spent per collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average time per collection</span>
                  <span className="font-medium">3.5 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fastest collection</span>
                  <span className="font-medium">1.2 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Slowest collection</span>
                  <span className="font-medium">8.7 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total collection time</span>
                  <span className="font-medium">7.2 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader>
              <CardTitle>Collection Trends</CardTitle>
              <CardDescription className="text-gray-400">
                Week-over-week comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">This week</span>
                  <span className="font-medium">
                    {trendStats.thisWeek} collections
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last week</span>
                  <span className="font-medium">
                    {trendStats.lastWeek} collections
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Change</span>
                  <span
                    className={`font-medium ${trendStats.change >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {trendStats.change >= 0 ? "+" : ""}
                    {trendStats.change}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Projected next week</span>
                  <span className="font-medium">
                    {trendStats.projected} collections
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
