import { supabase } from "../../supabase/supabase";

// Pack Check API functions
export interface PackCheck {
  id: string;
  pack_id: string;
  customer_id: string | null;
  check_date: string;
  checked_by: string;
  notes: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  webster_packs?: { pack_name: string };
  customers?: { full_name: string; date_of_birth: string | null };
}

export interface PackCheckInsert {
  pack_id: string;
  customer_id?: string | null;
  check_date?: string;
  checked_by: string;
  notes?: string | null;
  status?: string;
  user_id?: string;
}

export const getPackChecks = async (): Promise<PackCheck[]> => {
  const { data, error } = await supabase
    .from("pack_checks")
    .select("*, webster_packs(*), customers(*)")
    .order("check_date", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getRecentPackChecks = async (limit = 50): Promise<PackCheck[]> => {
  // Get all recent pack checks without filtering by user_id
  console.log("Fetching recent pack checks without user filter");

  // First try with a simpler query without joins
  const { data, error } = await supabase
    .from("pack_checks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent pack checks:", error);
    throw error;
  }

  console.log(`Retrieved ${data?.length || 0} recent pack checks`);
  return data || [];
};

export const getPackChecksByPackId = async (
  packId: string,
): Promise<PackCheck[]> => {
  const { data, error } = await supabase
    .from("pack_checks")
    .select("*, webster_packs(*), customers(*)")
    .eq("pack_id", packId)
    .order("check_date", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createPackCheck = async (
  packCheck: PackCheckInsert,
): Promise<PackCheck> => {
  console.log("Submitting to pack_checks table:", packCheck);

  // Ensure we have a user_id
  if (!packCheck.user_id) {
    const { data: userData } = await supabase.auth.getUser();
    packCheck.user_id = userData?.user?.id;
  }

  // Insert the pack check record
  const { data, error } = await supabase
    .from("pack_checks")
    .insert({
      pack_id: packCheck.pack_id,
      customer_id: packCheck.customer_id,
      check_date: packCheck.check_date,
      checked_by: packCheck.checked_by,
      notes: packCheck.notes,
      status: packCheck.status || "completed",
      user_id: packCheck.user_id,
    })
    .select()
    .single();

  // Log the result for debugging
  console.log("Insert result:", { data, error });

  if (error) {
    console.error("Error creating pack check:", error);
    throw error;
  }
  return data;
};

export const getPackCheckStats = async () => {
  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISOString = today.toISOString();

  // Get tomorrow's date (for date range query)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISOString = tomorrow.toISOString();

  // Get today's checks
  const { data: todayChecks, error: todayChecksError } = await supabase
    .from("pack_checks")
    .select("id")
    .gte("check_date", todayISOString)
    .lt("check_date", tomorrowISOString);

  if (todayChecksError) throw todayChecksError;

  // Get all unique pack IDs that have been checked
  const { data: checkedPacks, error: checkedPacksError } = await supabase
    .from("pack_checks")
    .select("pack_id")
    .order("pack_id");

  if (checkedPacksError) throw checkedPacksError;

  // Get unique pack IDs
  const uniquePackIds = new Set();
  checkedPacks?.forEach((check) => uniquePackIds.add(check.pack_id));

  // Get total packs count
  const { count: totalPacks, error: packsCountError } = await supabase
    .from("webster_packs")
    .select("id", { count: "exact" });

  if (packsCountError) throw packsCountError;

  return {
    todayChecks: todayChecks?.length || 0,
    checkedPacksCount: uniquePackIds.size,
    totalPacks: totalPacks || 0,
    pendingChecks: (totalPacks || 0) - uniquePackIds.size,
    completionRate: totalPacks
      ? Math.round((uniquePackIds.size / totalPacks) * 100)
      : 0,
  };
};
