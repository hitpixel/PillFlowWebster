import { supabase } from "../../supabase/supabase";
import { Database } from "./supabase-types";

type Customer = Database["public"]["Tables"]["customers"]["Row"];
type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

type WebsterPack = Database["public"]["Tables"]["webster_packs"]["Row"];
type WebsterPackInsert =
  Database["public"]["Tables"]["webster_packs"]["Insert"];
type WebsterPackUpdate =
  Database["public"]["Tables"]["webster_packs"]["Update"];

type Collection = Database["public"]["Tables"]["collections"]["Row"];
type CollectionInsert = Database["public"]["Tables"]["collections"]["Insert"];
type CollectionUpdate = Database["public"]["Tables"]["collections"]["Update"];

// Customer API
export const getCustomers = async (): Promise<Customer[]> => {
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Only fetch customers belonging to the current user
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", userId)
    .order("full_name");

  if (error) throw error;
  return data || [];
};

export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const createCustomer = async (
  customer: CustomerInsert,
): Promise<Customer> => {
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Add created_at, updated_at timestamps, user_id and handle date_of_birth
  const now = new Date().toISOString();
  const customerWithTimestamps = {
    ...customer,
    created_at: now,
    updated_at: now,
    user_id: userId,
    date_of_birth: customer.date_of_birth || null,
  };

  const { data, error } = await supabase
    .from("customers")
    .insert(customerWithTimestamps)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCustomer = async (
  id: string,
  updates: CustomerUpdate,
): Promise<Customer> => {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Webster Pack API
export const getWebsterPacks = async (): Promise<WebsterPack[]> => {
  const { data, error } = await supabase
    .from("webster_packs")
    .select("*")
    .order("pack_name");

  if (error) throw error;
  return data || [];
};

export const getWebsterPacksByCustomerId = async (
  customerId: string,
): Promise<WebsterPack[]> => {
  const { data, error } = await supabase
    .from("webster_packs")
    .select("*")
    .eq("customer_id", customerId)
    .order("pack_name");

  if (error) throw error;
  return data || [];
};

export const createWebsterPack = async (
  pack: WebsterPackInsert,
): Promise<WebsterPack> => {
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Add user_id to the pack
  const packWithUserId = {
    ...pack,
    user_id: userId,
  };

  const { data, error } = await supabase
    .from("webster_packs")
    .insert(packWithUserId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateWebsterPack = async (
  id: string,
  updates: WebsterPackUpdate,
): Promise<WebsterPack> => {
  const { data, error } = await supabase
    .from("webster_packs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Collection API
export const getCollections = async (): Promise<Collection[]> => {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("collection_date", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getCollectionsByPackId = async (
  packId: string,
): Promise<Collection[]> => {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("pack_id", packId)
    .order("collection_date", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createCollection = async (
  collection: CollectionInsert,
): Promise<Collection> => {
  // Get current user
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Add created_at and updated_at timestamps and user_id
  const now = new Date().toISOString();
  const collectionWithTimestamps = {
    ...collection,
    created_at: now,
    updated_at: now,
    user_id: userId,
  };

  console.log("Creating collection with data:", collectionWithTimestamps);

  const { data, error } = await supabase
    .from("collections")
    .insert(collectionWithTimestamps)
    .select()
    .single();

  if (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
  return data;
};

export const updateCollection = async (
  id: string,
  updates: CollectionUpdate,
): Promise<Collection> => {
  const { data, error } = await supabase
    .from("collections")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Dashboard Stats
export const getDashboardStats = async () => {
  // Get total customers - using direct fetch to avoid caching issues
  const { data: customersData, error: customersError } = await supabase
    .from("customers")
    .select("*")
    .limit(1000); // Add limit to ensure we get all records

  if (customersError) throw customersError;
  const totalCustomers = customersData?.length || 0;
  console.log("Fetched customers:", customersData);

  // Get active customers (all customers in the list) - same as total customers
  const activeCustomers = totalCustomers;

  // Get total collections - using direct fetch to avoid caching issues
  const { data: collectionsData, error: collectionsError } = await supabase
    .from("collections")
    .select("id")
    .limit(1000); // Add limit to ensure we get all records

  if (collectionsError) throw collectionsError;
  const totalCollections = collectionsData?.length || 0;

  // Get collections due this week
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const { count: dueCollections, error: dueError } = await supabase
    .from("webster_packs")
    .select("*", { count: "exact", head: true })
    .gte("next_collection_date", today.toISOString())
    .lte("next_collection_date", nextWeek.toISOString());

  if (dueError) throw dueError;

  // Log the final stats before returning
  const stats = {
    totalCustomers: totalCustomers || 0,
    activeCustomers: activeCustomers || 0,
    totalCollections: totalCollections || 0,
    dueCollections: dueCollections || 0,
    collectionRate:
      totalCollections && totalCustomers
        ? Math.round((totalCollections / (totalCustomers * 4)) * 100)
        : 0, // Calculate based on actual data
  };

  console.log("Returning dashboard stats:", stats);
  return stats;
};

// Recent Activity
export const getRecentActivity = async (limit = 5) => {
  // Get recent collections
  const { data: recentCollections, error: collectionsError } = await supabase
    .from("collections")
    .select(
      `
      id,
      collection_date,
      status,
      customer_id,
      pack_id,
      webster_packs(id, pack_name, customer_id),
      customers(id, full_name)
    `,
    )
    .order("collection_date", { ascending: false })
    .limit(limit);

  if (collectionsError) throw collectionsError;

  // Get recent customer additions
  const { data: recentCustomers, error: customersError } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (customersError) throw customersError;

  return {
    recentCollections: recentCollections || [],
    recentCustomers: recentCustomers || [],
  };
};
