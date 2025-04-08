import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface Payment {
  id: string;
  customer_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  stripe_checkout_id?: string;
  payment_intent?: string;
  error_message?: string;
}

interface PaymentHistoryProps {
  customerId?: string; // Optional - if provided, only show payments for this customer
  limit?: number; // Optional - limit the number of payments shown
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  customerId,
  limit = 10,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        // If customerId is provided, filter by customer_id
        if (customerId) {
          query = query.eq("customer_id", customerId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setPayments(data || []);
      } catch (err: any) {
        console.error("Error fetching payment history:", err);
        setError(err.message || "Failed to load payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [customerId, limit]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "succeeded":
        return (
          <Badge className="bg-green-500/20 text-green-400">Completed</Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>
        );
      case "failed":
        return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>;
      case "refunded":
        return (
          <Badge className="bg-purple-500/20 text-purple-400">Refunded</Badge>
        );
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-[#0d121f] text-white border-[#1e2738]">
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription className="text-gray-400">
          Recent payment transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
            {error}
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No payment history found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#1e2738]">
                <tr>
                  <th className="text-left p-2 text-gray-400">Date</th>
                  <th className="text-left p-2 text-gray-400">Amount</th>
                  <th className="text-left p-2 text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2738]">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#1a2133]">
                    <td className="p-2">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: payment.currency.toUpperCase(),
                      }).format(payment.amount)}
                    </td>
                    <td className="p-2">{getStatusBadge(payment.status)}</td>
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

export default PaymentHistory;
