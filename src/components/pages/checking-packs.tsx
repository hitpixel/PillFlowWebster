import React, { useState, useEffect } from "react";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Barcode,
  QrCode,
  Clipboard,
  CheckCircle,
  Package,
  Users,
  CheckSquare,
} from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { getWebsterPacks, getCustomers } from "@/lib/api";
import {
  getRecentPackChecks,
  createPackCheck,
  getPackCheckStats,
} from "@/lib/pack-checks-api";

const CheckingPacks = () => {
  const [barcode, setBarcode] = useState("");
  const [initial, setInitial] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [packs, setPacks] = useState([]);
  const [recentChecks, setRecentChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [userData, setUserData] = useState(null);

  const loadRecentChecks = async () => {
    try {
      setLoading(true);
      // Direct query to pack_checks table without joins
      const { data: checksData, error } = await supabase
        .from("pack_checks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      console.log("Fetched checks from Supabase:", checksData);

      if (!checksData || checksData.length === 0) {
        console.log("No pack checks found in the database");
        setRecentChecks([]);
        setLoading(false);
        return;
      }

      // Create dummy data if no real data exists
      if (checksData.length === 0) {
        const dummyChecks = [
          {
            id: "dummy1",
            packId: "pack123456",
            time: new Date().toLocaleString(),
            checkedBy: "JD",
            notes: "Test check",
            status: "completed",
            packName: "Morning Pack",
            customerName: "John Doe",
            customerDOB: "1980-01-01",
          },
        ];
        setRecentChecks(dummyChecks);
        setLoading(false);
        return;
      }

      // Get all customer data to map IDs to names
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("id, full_name, date_of_birth");

      if (customersError) {
        console.error("Error fetching customers:", customersError);
      }

      // Create a map of customer IDs to names for quick lookup
      const customerMap = {};
      customersData?.forEach((customer) => {
        customerMap[customer.id] = {
          name: customer.full_name,
          dob: customer.date_of_birth,
        };
      });

      // Format the checks with customer names
      const formattedChecks = checksData.map((check) => {
        // Look up the customer name from the map
        const customer = customerMap[check.customer_id] || {};

        return {
          id: check.id,
          packId: check.pack_id,
          time: new Date(check.check_date || check.created_at).toLocaleString(
            "en-AU",
            {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            },
          ),
          checkedBy: check.checked_by,
          notes: check.notes,
          status: check.status || "completed",
          packName: `Pack ${check.pack_id?.substring(0, 6) || "Unknown"}`,
          customerName: customer.name || "Unknown Customer",
          customerDOB: customer.dob,
        };
      });

      console.log("Formatted checks:", formattedChecks);
      setRecentChecks(formattedChecks);
      setLoading(false);
    } catch (err) {
      console.error("Error loading recent checks:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load customers directly from Supabase for immediate results
        const { data: userDataResponse } = await supabase.auth.getUser();
        setUserData(userDataResponse);
        const userId = userDataResponse?.user?.id;

        if (!userId) {
          console.warn("User not authenticated, but continuing to load data");
        }

        // Get customers
        const { data: customersData, error: customersError } = await supabase
          .from("customers")
          .select("*")
          .order("full_name");

        if (customersError) throw customersError;
        console.log("Loaded customers:", customersData);
        setCustomers(customersData || []);

        // Load webster packs
        const packsData = await getWebsterPacks();
        setPacks(packsData);

        // Load recent checks from Supabase
        await loadRecentChecks();
      } catch (err) {
        console.error("Error loading data:", err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up an interval to refresh the recent checks every 15 seconds
    const intervalId = setInterval(() => {
      loadRecentChecks();
    }, 15000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode && initial) {
      try {
        setIsChecked(true);
        setError("");

        // Get current user
        const { data: currentUser } = await supabase.auth.getUser();

        // Create a new pack check record
        const checkData = {
          pack_id: barcode.toString(),
          customer_id: selectedPatient?.id || null,
          check_date: new Date().toISOString(),
          checked_by: initial,
          notes: notes || null,
          status: "completed",
          user_id: currentUser?.user?.id, // Get fresh user ID
        };

        console.log("Creating pack check with data:", checkData);

        // Use the API function to create the pack check
        const newCheck = await createPackCheck(checkData);
        console.log("Created pack check:", newCheck);

        // Refresh the recent checks from the database
        await loadRecentChecks();

        // Reset form after 2 seconds
        setTimeout(() => {
          setIsChecked(false);
          setBarcode("");
          setInitial("");
          setNotes("");
          setError("");
        }, 2000);
      } catch (err) {
        console.error("Error checking pack:", err);
        setError(`Error: ${err.message || "An unknown error occurred"}`);
        setIsChecked(false);
      }
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm || searchTerm.trim() === "") return true;

    const search = searchTerm.toLowerCase().trim();
    const fullName = customer.full_name?.toLowerCase() || "";
    const nameParts = fullName.split(" ");
    const id = customer.id?.toLowerCase() || "";

    return (
      fullName.includes(search) ||
      id.includes(search) ||
      nameParts.some((part) => part.includes(search))
    );
  });

  return (
    <DashboardLayout title="Checking Packs">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Webster Pack Checking
          </h1>
          <Button
            variant="outline"
            className="border-[#1e2738] bg-[#1a2133] text-gray-300 hover:bg-[#232d42] hover:text-white"
          >
            <Package className="mr-2 h-4 w-4" />
            View All Packs
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Check Pack Form */}
          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader>
              <CardTitle>Check Webster Pack</CardTitle>
              <CardDescription className="text-gray-400">
                Scan or manually enter pack details to mark as checked
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Patient Search Section */}
              <div className="mb-4 relative">
                <Label htmlFor="patient-search" className="mb-2 block">
                  Patient Search
                </Label>
                <div className="relative">
                  <Input
                    id="patient-search"
                    placeholder="Search patient by name or ID"
                    className="bg-[#1a2133] border-[#1e2738] pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={() => {
                      // Force dropdown to show on click
                      setSearchTerm(" ");
                      // Force a re-render to show all customers
                      setTimeout(() => {
                        console.log("Showing all customers");
                      }, 10);
                    }}
                    autoComplete="off"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full text-gray-400 hover:text-white"
                    onClick={() => setSearchTerm(searchTerm || " ")} // Force dropdown to show on click
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </div>
                {selectedPatient && (
                  <div className="mt-2 p-2 bg-blue-500/10 rounded-md border border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        {selectedPatient.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          Selected: {selectedPatient.full_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {selectedPatient.id.substring(0, 8)}
                        </div>
                        {selectedPatient.date_of_birth && (
                          <div className="text-xs text-gray-400">
                            DOB:{" "}
                            {new Date(
                              selectedPatient.date_of_birth,
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-gray-400 hover:text-white h-7"
                        onClick={() => setSelectedPatient(null)}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                )}
                {(searchTerm || searchTerm === " ") && (
                  <div
                    className="mt-2 rounded-md bg-[#1a2133] p-2 max-h-60 overflow-y-auto z-50 absolute w-full shadow-lg"
                    style={{ maxWidth: "calc(100% - 2px)" }}
                  >
                    {customers.length === 0 ? (
                      <div className="p-2 text-gray-400 text-center">
                        Loading customers...
                      </div>
                    ) : filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex items-center justify-between p-2 hover:bg-[#232d42] rounded cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedPatient(customer);
                            setSearchTerm(""); // Clear search after selection
                            console.log("Selected customer:", customer);
                            // Get packs for this customer
                            const customerPacks = packs.filter(
                              (p) => p.customer_id === customer.id,
                            );
                            if (customerPacks.length > 0) {
                              setBarcode(customerPacks[0].id);
                              console.log(
                                "Auto-selected pack:",
                                customerPacks[0],
                              );
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                              {customer.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {customer.full_name}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {customer.id.substring(0, 8)}
                              </div>
                              {customer.date_of_birth && (
                                <div className="text-xs text-gray-400">
                                  DOB:{" "}
                                  {new Date(
                                    customer.date_of_birth,
                                  ).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 h-7"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation(); // Prevent parent onClick from firing
                              setSelectedPatient(customer);
                              setSearchTerm(""); // Clear search after selection
                              // Get packs for this customer
                              const customerPacks = packs.filter(
                                (p) => p.customer_id === customer.id,
                              );
                              if (customerPacks.length > 0) {
                                setBarcode(customerPacks[0].id);
                                console.log(
                                  "Auto-selected pack:",
                                  customerPacks[0],
                                );
                              }
                            }}
                          >
                            Select
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-400 text-center">
                        No customers found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#1a2133]">
                  <TabsTrigger
                    value="manual"
                    className="data-[state=active]:bg-[#232d42]"
                  >
                    <Clipboard className="mr-2 h-4 w-4" />
                    Manual Entry
                  </TabsTrigger>
                  <TabsTrigger
                    value="scan"
                    className="data-[state=active]:bg-[#232d42]"
                  >
                    <Barcode className="mr-2 h-4 w-4" />
                    Scan Barcode
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual">
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="initial">Pharmacist Initials</Label>
                      <Input
                        id="initial"
                        placeholder="Enter your initials"
                        className="bg-[#1a2133] border-[#1e2738]"
                        value={initial}
                        onChange={(e) => setInitial(e.target.value)}
                        required
                        maxLength={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Webster Pack ID</Label>
                      <Input
                        id="barcode"
                        placeholder="Enter pack ID or barcode"
                        className="bg-[#1a2133] border-[#1e2738]"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Check Notes (Optional)</Label>
                      <Input
                        id="notes"
                        placeholder="Enter any notes about this check"
                        className="bg-[#1a2133] border-[#1e2738]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    {selectedPatient && (
                      <div className="mt-4 space-y-2">
                        <Label>
                          Available Packs for {selectedPatient.full_name}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {packs
                            .filter(
                              (pack) => pack.customer_id === selectedPatient.id,
                            )
                            .map((pack) => (
                              <Button
                                key={pack.id}
                                variant="outline"
                                className={`justify-start text-left h-auto py-2 ${barcode === pack.id ? "bg-blue-500/20 border-blue-500" : "bg-[#1a2133] border-[#1e2738]"}`}
                                onClick={() => setBarcode(pack.id)}
                              >
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">
                                    {pack.pack_name}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    ID: {pack.id.substring(0, 8)}
                                  </span>
                                </div>
                              </Button>
                            ))}
                        </div>
                      </div>
                    )}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={isChecked || !barcode || !initial}
                      onClick={handleSubmit}
                    >
                      {isChecked ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Pack Checked Successfully
                        </>
                      ) : (
                        <>
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Mark Pack as Checked
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="scan">
                  <div className="flex flex-col items-center justify-center space-y-4 mt-4 p-6 border border-dashed border-[#1e2738] rounded-lg">
                    <QrCode className="h-16 w-16 text-green-400 mb-2" />
                    <p className="text-center text-gray-400">
                      Position the barcode in front of your camera to scan
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Barcode className="mr-2 h-4 w-4" />
                      Activate Scanner
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Checks Card */}
          <Card className="bg-[#0d121f] text-white border-[#1e2738] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Pack Checks</CardTitle>
                <CardDescription className="text-gray-400">
                  {recentChecks.length} checked webster packs from Supabase
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-[#1e2738] bg-[#1a2133] text-gray-300 hover:bg-[#232d42] hover:text-white"
                onClick={() => loadRecentChecks()}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M3 3v5h5"></path>
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                  <path d="M16 21h5v-5"></path>
                </svg>
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="space-y-4 h-full overflow-y-auto pr-2 max-h-[calc(100vh-350px)]">
                {loading ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>Loading recent checks...</p>
                  </div>
                ) : recentChecks && recentChecks.length > 0 ? (
                  recentChecks.map((check, index) => (
                    <div
                      key={check.id || index}
                      className="flex items-start space-x-4 p-3 rounded-lg bg-[#1a2133] hover:bg-[#232d42] transition-colors"
                    >
                      <div
                        className={`rounded-full p-2 ${check.status === "completed" ? "bg-green-500/20" : "bg-amber-500/20"}`}
                      >
                        <CheckSquare
                          className={`h-5 w-5 ${check.status === "completed" ? "text-green-400" : "text-amber-400"}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium flex items-center">
                              {check.customerName || "Unknown Customer"}
                              {check.status !== "completed" && (
                                <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                                  Pending
                                </span>
                              )}
                            </h4>
                            {check.customerDOB && (
                              <span className="text-xs text-gray-400 block">
                                DOB:{" "}
                                {new Date(
                                  check.customerDOB,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {check.time || "Unknown time"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 mt-2">
                          <div>
                            <p className="text-sm text-gray-400 flex items-center">
                              <Package className="h-3.5 w-3.5 mr-1 text-blue-400" />
                              <span className="font-medium text-blue-400">
                                {check.packName ||
                                  `Pack ${check.packId?.substring(0, 6) || "Unknown"}`}
                              </span>
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: {check.packId?.substring(0, 8) || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">
                              Checked by:{" "}
                              <span className="font-medium">
                                {check.checkedBy || "Unknown"}
                              </span>
                            </p>
                            {check.notes && (
                              <p className="text-xs text-blue-400 italic">
                                "{check.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No recent checks found in database</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Today's Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {
                  recentChecks.filter(
                    (check) =>
                      new Date(check.time).toDateString() ===
                      new Date().toDateString(),
                  ).length
                }
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Out of {packs.length} total packs
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Pending Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {packs.length - recentChecks.length > 0
                  ? packs.length - recentChecks.length
                  : 0}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Check Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {packs.length > 0
                  ? Math.round((recentChecks.length / packs.length) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-green-400 mt-1">Target: 100%</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CheckingPacks;
