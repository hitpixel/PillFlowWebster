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
} from "lucide-react";
import { supabase } from "../../../supabase/supabase";
import { getCustomers, getWebsterPacks, getCollections } from "@/lib/api";

const ScanOut = () => {
  const [barcode, setBarcode] = useState("");
  const [initial, setInitial] = useState("");
  const [isScanned, setIsScanned] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [packs, setPacks] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [packType, setPackType] = useState("blister");
  const [packCount, setPackCount] = useState(1);

  const loadRecentScans = async () => {
    try {
      // Load recent collections using the API function
      const collectionsData = await getCollections();
      // Limit to 15 most recent collections
      const recentCollections = collectionsData.slice(0, 15);
      console.log("Fetched collections:", collectionsData);

      // Format the scans
      const formattedScans = await Promise.all(
        recentCollections.map(async (collection) => {
          // Get customer name if available
          let customerName = collection.customers?.full_name || "Unknown";

          // Get pack ID from either packs_id or pack_id field
          const packId = collection.packs_id || collection.pack_id || "";

          // Get pack name or use the barcode
          let packName =
            collection.webster_packs?.pack_name ||
            `Pack ${packId.substring(0, 6)}`;

          // If we have customer_id but no joined data, fetch customer separately
          if (!collection.customers?.full_name && collection.customer_id) {
            const { data: customerData } = await supabase
              .from("customers")
              .select("full_name")
              .eq("id", collection.customer_id)
              .single();

            if (customerData) {
              customerName = customerData.full_name;
            }
          }

          return {
            id: packId,
            time: new Date(collection.collection_date).toLocaleString("en-AU", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            packName: `${customerName} - ${packName}`,
            collectionId: collection.id,
            packCount: collection.pack_count,
            packType: collection.pack_type,
          };
        }),
      );

      console.log("Formatted scans:", formattedScans);
      setRecentScans(formattedScans);
      setLoading(false);
    } catch (err) {
      console.error("Error loading recent scans:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load customers
        const customersData = await getCustomers();
        setCustomers(customersData);

        // Load webster packs
        const packsData = await getWebsterPacks();
        setPacks(packsData);

        // Load recent scans
        await loadRecentScans();
      } catch (err) {
        console.error("Error loading data:", err);
        // Don't set generic error message, only show specific errors
        setLoading(false);
      }
    };

    loadData();

    // Set up an interval to refresh the recent scans every 15 seconds
    const intervalId = setInterval(() => {
      loadRecentScans();
    }, 15000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode && initial) {
      try {
        setIsScanned(true);
        setError("");

        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Create a new collection record directly with the barcode
        const collectionData = {
          packs_id: barcode, // Store the barcode directly in packs_id (not pack_id)
          customer_id: selectedPatient?.id || null, // Use selected patient if available
          collection_date: new Date().toISOString(),
          collected_by: initial,
          status: "completed",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Add pack type and count directly to the table
          pack_type: packType,
          pack_count: packCount,
          user_id: userId, // Associate with current user
        };

        console.log("Creating collection with data:", collectionData);

        // Insert directly into collections table
        const { data: newCollection, error: collectionError } = await supabase
          .from("collections")
          .insert(collectionData)
          .select()
          .single();

        if (collectionError) {
          console.error("Error creating collection:", collectionError);
          setError("Failed to save scan. Please try again.");
          setIsScanned(false);
          return;
        }

        console.log("Created collection:", newCollection);

        // Refresh the recent scans from the database
        await loadRecentScans();

        // Refresh the data after a successful scan
        setTimeout(() => {
          loadRecentScans();
        }, 1000);

        // Reset form after 2 seconds
        setTimeout(() => {
          setIsScanned(false);
          setBarcode("");
          setInitial("");
          setError("");
        }, 2000);
      } catch (err) {
        console.error("Error scanning pack:", err);
        setError("An error occurred. Please try again.");
        setIsScanned(false);
      }
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    if (searchTerm === "") return true;

    const search = searchTerm.toLowerCase();
    const fullName = customer.full_name.toLowerCase();
    const nameParts = fullName.split(" ");
    const id = customer.id.toLowerCase();

    return (
      fullName.includes(search) ||
      id.includes(search) ||
      nameParts.some((part) => part.includes(search))
    );
  });

  return (
    <DashboardLayout title="Scan Out">
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Webster Pack Scan-Out
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
          {/* Scan-out Form */}
          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader>
              <CardTitle>Scan Out Webster Pack</CardTitle>
              <CardDescription className="text-gray-400">
                Scan or manually enter pack details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Patient Search Section */}
              <div className="mb-4">
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
                    onClick={() => setSearchTerm(searchTerm || " ")} // Force dropdown to show on click
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
                {searchTerm && (
                  <div className="mt-2 rounded-md bg-[#1a2133] p-2 max-h-60 overflow-y-auto z-50 relative w-full">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex items-center justify-between p-2 hover:bg-[#232d42] rounded cursor-pointer"
                          onClick={() => {
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
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300 h-7"
                            onClick={(e) => {
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
                      <Label htmlFor="pack-type">Pack Type</Label>
                      <select
                        id="pack-type"
                        className="w-full rounded-md bg-[#1a2133] border-[#1e2738] text-white p-2"
                        value={packType}
                        onChange={(e) => setPackType(e.target.value)}
                      >
                        <option value="blister">Blister Packs</option>
                        <option value="sachet">Sachets</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pack-count">Number of Packs</Label>
                      <select
                        id="pack-count"
                        className="w-full rounded-md bg-[#1a2133] border-[#1e2738] text-white p-2"
                        value={packCount}
                        onChange={(e) => setPackCount(parseInt(e.target.value))}
                      >
                        <option value="1">1 Pack (1 Week)</option>
                        <option value="2">2 Packs (2 Weeks)</option>
                        <option value="3">3 Packs (3 Weeks)</option>
                        <option value="4">4 Packs (4 Weeks)</option>
                        <option value="5">5 Packs (5 Weeks)</option>
                        <option value="6">6 Packs (6 Weeks)</option>
                      </select>
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
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isScanned || !barcode || !initial}
                    >
                      {isScanned ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Pack Scanned Successfully
                        </>
                      ) : (
                        "Scan Out Pack"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="scan">
                  <div className="flex flex-col items-center justify-center space-y-4 mt-4 p-6 border border-dashed border-[#1e2738] rounded-lg">
                    <QrCode className="h-16 w-16 text-blue-400 mb-2" />
                    <p className="text-center text-gray-400">
                      Position the barcode in front of your camera to scan
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Barcode className="mr-2 h-4 w-4" />
                      Activate Scanner
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Scans Card */}
          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader>
              <CardTitle>Recent Scan-Outs</CardTitle>
              <CardDescription className="text-gray-400">
                Recently scanned webster packs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {loading ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>Loading recent scans...</p>
                  </div>
                ) : recentScans.length > 0 ? (
                  recentScans.map((scan, index) => (
                    <div
                      key={scan.collectionId || index}
                      className="flex items-start space-x-4 p-3 rounded-lg bg-[#1a2133]"
                    >
                      <div className="rounded-full bg-blue-500/20 p-2">
                        <Package className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{scan.packName}</h4>
                          <span className="text-xs text-gray-400">
                            {scan.time}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-400">
                            Pack ID: {scan.id.substring(0, 8)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {scan.packCount ? (
                              <>
                                {scan.packCount}{" "}
                                {scan.packCount === 1 ? "week" : "weeks"} (
                                {scan.packType})
                              </>
                            ) : (
                              "No pack information available"
                            )}
                          </p>
                        </div>
                        <p className="text-sm text-blue-400 mt-1">
                          Next due:{" "}
                          {(() => {
                            const collectionDate = new Date(scan.time);
                            const nextDueDate = new Date(collectionDate);
                            nextDueDate.setDate(
                              collectionDate.getDate() +
                                (scan.packCount || 1) * 7,
                            );
                            return nextDueDate.toLocaleDateString("en-AU", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                            });
                          })()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p>No recent scans</p>
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
                Today's Scan-Outs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {
                  recentScans.filter(
                    (scan) =>
                      new Date(scan.time).toDateString() ===
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
                Pending Scan-Outs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {
                  packs.filter(
                    (pack) =>
                      !pack.last_collection_date ||
                      new Date(pack.last_collection_date) <
                        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  ).length
                }
              </div>
              <p className="text-xs text-gray-400 mt-1">Due today</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0d121f] text-white border-[#1e2738]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Weekly Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {packs.length > 0
                  ? Math.round(
                      (packs.filter(
                        (pack) =>
                          pack.last_collection_date &&
                          new Date(pack.last_collection_date) >
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                      ).length /
                        packs.length) *
                        100,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-green-400 mt-1">Above target (95%)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ScanOut;
