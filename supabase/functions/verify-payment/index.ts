import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import Stripe from "https://esm.sh/stripe@12.18.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Session ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if the payment was successful
    if (session.payment_status === "paid") {
      // Update the payment record in Supabase
      const { error: updateError } = await supabase
        .from("payments")
        .update({
          status: "completed",
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
          currency: session.currency || "usd",
          payment_intent: session.payment_intent?.toString() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_checkout_id", sessionId);

      if (updateError) {
        console.error("Error updating payment record:", updateError);
        // Continue anyway to provide a good user experience
      }

      return new Response(
        JSON.stringify({
          status: "success",
          message: "Your payment was successful! Thank you for your purchase.",
          paymentId: session.payment_intent,
          customerId: session.client_reference_id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } else {
      return new Response(
        JSON.stringify({
          status: "pending",
          message: "Your payment is being processed. Please check back later.",
          sessionId,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
