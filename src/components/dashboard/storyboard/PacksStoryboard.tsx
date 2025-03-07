import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { patients } from "@/data/patients";
import { supabase } from "../../../../supabase/supabase";
import { getCustomers, getWebsterPacks } from "@/lib/api";

const PacksStoryboard = () => {
  const [barcode, setBarcode] = useState("");
  const [initial, setInitial] = useState("");
  const [isScanned, setIsScanned] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayScans, setTodayScans] = useState(0);
  const [pendingScans, setPendingScans] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [packs, setPacks] = useState([]);

  const fetchRecentScans = async () => {
    try {
      // Get today's date in ISO format for filtering
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Load recent collections with all possible fields for the current user's customers only
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("collections")
        .select(
          `
            id, 
            collection_date, 
            collected_by, 
            status,
            packs_id,
            pack_id,
            customer_id,
            customers!inner(id, full_name, user_id),
            webster_packs(id, pack_name, customer_id)
          `,
        )
        .eq("customers.user_id", userId)
        .order("collection_date", { ascending: false })
        .limit(15);

      if (collectionsError) {
        console.error("Error fetching collections:", collectionsError);
        return [];
      }

      console.log("Fetched collections:", collectionsData);

      // Format recent scans
      const formattedScans = await Promise.all(
        collectionsData.map(async (collection) => {
          // Get the pack ID from packs_id field first, then fallback to pack_id, then webster_packs.id
          const packId =
            collection.packs_id ||
            collection.pack_id ||
            collection.webster_packs?.id ||
            "";

          // Get customer name from the joined customers data
          let customerName = collection.customers?.full_name || "Unknown";

          // Get pack name from the joined webster_packs data or create a generic name from the ID
          const packName =
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
            time: new Date(collection.collection_date).toLocaleString(),
            packName: `${customerName} - ${packName}`,
            collectionId: collection.id,
            date: new Date(collection.collection_date),
          };
        }),
      );

      console.log("Formatted scans:", formattedScans);
      return formattedScans;
    } catch (err) {
      console.error("Error fetching recent scans:", err);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        if (!userId) {
          throw new Error("User not authenticated");
        }

        // Fetch recent scans
        const scans = await fetchRecentScans();
        setRecentScans(scans);

        // Get all packs for statistics for the current user's customers only
        const { data: packsData } = await supabase
          .from("webster_packs")
          .select("*, customers!inner(user_id)")
          .eq("customers.user_id", userId);

        setPacks(packsData || []);

        // Today's scans will be calculated directly in the render method
        // using the recentScans array and filtering by today's date

        // Calculate pending scans
        const pending = packsData
          ? packsData.filter(
              (pack) =>
                !pack.last_collection_date ||
                new Date(pack.last_collection_date) <
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            ).length
          : 0;
        setPendingScans(pending);

        // Calculate completion rate
        if (packsData && packsData.length > 0) {
          const completed = packsData.filter(
            (pack) =>
              pack.last_collection_date &&
              new Date(pack.last_collection_date) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          ).length;
          setCompletionRate(Math.round((completed / packsData.length) * 100));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        // Fallback to static data if API fails
        const staticScans = patients.flatMap((patient) =>
          patient.packs.map((pack) => ({
            id: pack.id,
            time: pack.time,
            packName: `${patient.name} - ${pack.name}`,
          })),
        );
        setRecentScans(staticScans);
        setTodayScans(12);
        setPendingScans(3);
        setCompletionRate(96);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up an interval to refresh the data every 15 seconds
    const intervalId = setInterval(() => {
      fetchRecentScans().then((scans) => {
        setRecentScans(scans);

        // Update today's scan count
        const today = new Date().toDateString();
        const todayCount = scans.filter(
          (scan) => new Date(scan.time).toDateString() === today,
        ).length;
        setTodayScans(todayCount);
      });
    }, 15000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0e17]">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto bg-[#0a0e17] p-4 md:p-6">
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

            <div className="grid gap-6 md:grid-cols-1">
              {/* Scan-out Form */}
              <Card className="bg-[#0d121f] text-white border-[#1e2738] overflow-visible">
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
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full text-gray-400 hover:text-white"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                    {searchTerm && (
                      <div className="mt-2 rounded-md bg-[#1a2133] p-2 max-h-60 overflow-y-auto z-50 relative w-full">
                        {patients
                          .filter((patient) => {
                            if (searchTerm === "") return true;

                            const search = searchTerm.toLowerCase();
                            const fullName = patient.name.toLowerCase();
                            const nameParts = fullName.split(" ");
                            const id = patient.id.toLowerCase();

                            return (
                              fullName.includes(search) ||
                              id.includes(search) ||
                              nameParts.some((part) => part.includes(search))
                            );
                          })
                          .map((patient) => (
                            <div
                              key={patient.id}
                              className="flex items-center justify-between p-2 hover:bg-[#232d42] rounded cursor-pointer"
                              onClick={() => {
                                setSelectedPatient(patient);
                                // Auto-select the first pack for this patient
                                const patientPack = patient.packs[0];
                                if (patientPack) {
                                  setBarcode(patientPack.id);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                  {patient.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div>
                                  <div className="text-sm font-medium">
                                    {patient.name}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    ID: {patient.id}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-400 hover:text-blue-300 h-7"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent parent onClick from firing
                                  setSelectedPatient(patient);
                                  // Auto-select the first pack for this patient
                                  const patientPack = patient.packs[0];
                                  if (patientPack) {
                                    setBarcode(patientPack.id);
                                  }
                                }}
                              >
                                Select
                              </Button>
                            </div>
                          ))}
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
                      <form className="space-y-4 mt-4">
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
                        <Button
                          type="button"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={isScanned || !barcode || !initial}
                          onClick={async () => {
                            if (!barcode || !initial) return;

                            try {
                              setIsScanned(true);

                              // Get current user
                              const { data: userData } =
                                await supabase.auth.getUser();
                              const userId = userData?.user?.id;

                              if (!userId) {
                                throw new Error("User not authenticated");
                              }

                              // Always create a collection record with the barcode
                              // No validation needed - any barcode is accepted
                              const { data, error } = await supabase
                                .from("collections")
                                .insert({
                                  packs_id: barcode, // Store as text directly in packs_id field
                                  collection_date: new Date().toISOString(),
                                  collected_by: initial,
                                  status: "completed",
                                  customer_id: selectedPatient?.id || null,
                                  created_at: new Date().toISOString(),
                                  updated_at: new Date().toISOString(),
                                  pack_type: "blister", // Default pack type
                                  pack_count: 1, // Default pack count
                                  user_id: userId, // Associate with current user
                                })
                                .select()
                                .single();

                              if (error) throw error;

                              console.log("Collection created:", data);

                              // Refresh scans from database after successful insert
                              const updatedScans = await fetchRecentScans();
                              setRecentScans(updatedScans);

                              // Update statistics
                              setTodayScans(todayScans + 1);

                              // Reset form after 2 seconds
                              setTimeout(() => {
                                setIsScanned(false);
                                setBarcode("");
                                setInitial("");
                              }, 2000);
                            } catch (err) {
                              console.error("Error saving collection:", err);
                              setIsScanned(false);
                            }
                          }}
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
                    {loading ? (
                      <span className="text-gray-500">...</span>
                    ) : (
                      recentScans.filter(
                        (scan) =>
                          new Date(scan.time).toDateString() ===
                          new Date().toDateString(),
                      ).length
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {loading
                      ? "Loading..."
                      : `Out of ${packs.length} total packs`}
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
                  <div className="text-3xl font-bold">{pendingScans}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {loading ? "Loading..." : "Due today"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0d121f] text-white border-[#1e2738]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Weekly Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completionRate}%</div>
                  <p className="text-xs text-green-400 mt-1">
                    {loading
                      ? "Loading..."
                      : completionRate >= 95
                        ? "Above target (95%)"
                        : "Below target (95%)"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PacksStoryboard;
