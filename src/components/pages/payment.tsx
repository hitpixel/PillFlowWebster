import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../dashboard/layout/DashboardLayout";
import StripeCheckout from "../payments/StripeCheckout";
import PaymentHistory from "../payments/PaymentHistory";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";

// Define available subscription plans
const subscriptionPlans = [
  {
    id: "basic",
    name: "Basic Plan",
    description: "Essential features for small pharmacies",
    price: 29.99,
    priceId: "price_1Qzqp1KfETfQdSQa5LhIku2VD", // Replace with your actual Stripe price ID
    features: [
      "Up to 50 customers",
      "Basic reporting",
      "Email support",
      "1 staff account",
    ],
  },
  {
    id: "professional",
    name: "Professional Plan",
    description: "Advanced features for growing pharmacies",
    price: 59.99,
    priceId: "price_1Qzqp1KfETfQdSQa5LhIku2VD", // Replace with your actual Stripe price ID
    features: [
      "Up to 200 customers",
      "Advanced reporting",
      "Priority email support",
      "3 staff accounts",
      "SMS notifications",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "Complete solution for large pharmacies",
    price: 99.99,
    priceId: "price_1Qzqp1KfETfQdSQa5LhIku2VD", // Replace with your actual Stripe price ID
    features: [
      "Unlimited customers",
      "Custom reporting",
      "24/7 phone support",
      "Unlimited staff accounts",
      "SMS notifications",
      "API access",
      "Dedicated account manager",
    ],
  },
];

const PaymentPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const [selectedPlan, setSelectedPlan] = useState(subscriptionPlans[0]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Find the selected plan based on the URL parameter
    if (planId) {
      const plan = subscriptionPlans.find((p) => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
      }
    }

    // Get the customer ID for the current user
    const fetchCustomerId = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data, error: fetchError } = await supabase
          .from("customers")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (fetchError) throw fetchError;
        if (data) {
          setCustomerId(data.id);
        } else {
          throw new Error("No customer record found for this user");
        }
      } catch (err: any) {
        console.error("Error fetching customer ID:", err);
        setError(err.message || "Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerId();
  }, [planId, user]);

  return (
    <DashboardLayout title="Payment">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="bg-[#1a2133] border-[#1e2738] text-gray-300 hover:bg-[#232d42] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Payment</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subscription Plans */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`bg-[#0d121f] text-white border-[#1e2738] cursor-pointer transition-all ${selectedPlan.id === plan.id ? "border-blue-500 ring-2 ring-blue-500/20" : "hover:border-gray-600"}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-gray-400 ml-1">/month</span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Checkout */}
          <div>
            {loading ? (
              <Card className="bg-[#0d121f] text-white border-[#1e2738]">
                <CardContent className="flex justify-center items-center h-40">
                  <Clock className="h-8 w-8 text-blue-500 animate-pulse" />
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="bg-[#0d121f] text-white border-[#1e2738]">
                <CardContent className="p-6">
                  <div className="p-4 bg-red-900/30 border border-red-800 rounded text-red-300 text-sm">
                    {error}
                  </div>
                  <Button
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                </CardContent>
              </Card>
            ) : customerId ? (
              <StripeCheckout
                customerId={customerId}
                priceId={selectedPlan.priceId}
                productName={selectedPlan.name}
                amount={selectedPlan.price}
                buttonText={`Subscribe to ${selectedPlan.name}`}
              />
            ) : null}
          </div>
        </div>

        {/* Payment History */}
        <div className="mt-8">
          {customerId && <PaymentHistory customerId={customerId} limit={5} />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentPage;
