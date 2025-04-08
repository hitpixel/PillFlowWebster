import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "../../../supabase/supabase";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the session_id from the URL query parameters
        const params = new URLSearchParams(location.search);
        const sessionId = params.get("session_id");

        if (!sessionId) {
          setPaymentDetails({
            status: "success",
            message: "Thank you for your payment!",
          });
          return;
        }

        // Verify the payment with Stripe through our Supabase Edge Function
        const { data, error: verifyError } = await supabase.functions.invoke(
          "supabase-functions-verify-payment",
          {
            body: { sessionId },
          },
        );

        if (verifyError) throw new Error(verifyError.message);

        setPaymentDetails(data);
      } catch (err: any) {
        console.error("Error verifying payment:", err);
        setError(
          err.message || "An error occurred while verifying your payment",
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search]);

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#0d121f] rounded-lg shadow-xl p-8 max-w-md w-full text-center border border-[#1e2738]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Payment Successful!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-300 mb-6"
        >
          {loading
            ? "Verifying your payment..."
            : error
              ? "Your payment was received, but we encountered an issue while updating our records."
              : paymentDetails?.message ||
                "Thank you for your purchase. You will receive a confirmation email shortly."}
        </motion.p>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-6 p-3 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col space-y-3"
        >
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/settings")}
            className="border-[#1e2738] bg-[#1a2133] text-gray-300 hover:bg-[#232d42] hover:text-white"
          >
            View Account Settings
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Success;
