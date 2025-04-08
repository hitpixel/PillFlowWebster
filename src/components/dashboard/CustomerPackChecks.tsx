import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import { Package } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CustomerPackChecksProps {
  customerId: string;
}

interface PackCheck {
  id: string;
  pack_id: string;
  check_date: string;
  checked_by: string;
  notes: string | null;
  status: string;
}

const CustomerPackChecks: React.FC<CustomerPackChecksProps> = ({
  customerId,
}) => {
  const [packChecks, setPackChecks] = useState<PackCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPackChecks = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!customerId) {
        setError("Missing customer ID");
        setLoading(false);
        return;
      }

      // Fetch pack checks for this customer
      const { data, error } = await supabase
        .from("pack_checks")
        .select("*")
        .eq("customer_id", customerId)
        .order("check_date", { ascending: false });

      if (error) throw error;
      setPackChecks(data || []);
    } catch (err: any) {
      console.error("Error loading pack checks:", err);
      setError(err.message || "Failed to load pack checks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      loadPackChecks();
    } else {
      setError("Missing customer ID");
      setLoading(false);
    }
  }, [customerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-white">Loading pack checks...</div>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Pack Checks</CardTitle>
          <CardDescription className="text-gray-400">
            All webster pack checks for this customer
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-[#1e2738] bg-[#1a2133] text-gray-300 hover:bg-[#232d42] hover:text-white"
          onClick={loadPackChecks}
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
      <CardContent>
        {packChecks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No pack checks found for this customer
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#1e2738]">
                <tr>
                  <th className="text-left p-2 text-gray-400">Date</th>
                  <th className="text-left p-2 text-gray-400">Pack ID</th>
                  <th className="text-left p-2 text-gray-400">Notes</th>
                  <th className="text-left p-2 text-gray-400">Checked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2738]">
                {packChecks.map((check) => (
                  <tr key={check.id} className="hover:bg-[#1a2133]">
                    <td className="p-2">
                      {new Date(
                        check.check_date || check.created_at,
                      ).toLocaleString("en-AU", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <Package className="h-3.5 w-3.5 mr-1 text-blue-400" />
                        <span>{check.pack_id || "Unknown Pack"}</span>
                        {check.status !== "completed" && (
                          <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      {check.notes ? (
                        <span className="text-blue-400 italic">
                          "{check.notes}"
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-2">
                      <span className="font-medium">{check.checked_by}</span>
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

export default CustomerPackChecks;
