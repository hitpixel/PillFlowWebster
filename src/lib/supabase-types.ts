export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          status: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          status?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          status?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      webster_packs: {
        Row: {
          id: string;
          pack_name: string;
          customer_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          last_collection_date: string | null;
          next_collection_date: string | null;
        };
        Insert: {
          id?: string;
          pack_name: string;
          customer_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          last_collection_date?: string | null;
          next_collection_date?: string | null;
        };
        Update: {
          id?: string;
          pack_name?: string;
          customer_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          last_collection_date?: string | null;
          next_collection_date?: string | null;
        };
      };
      collections: {
        Row: {
          id: string;
          pack_id: string | null;
          collection_date: string;
          collected_by: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pack_id?: string | null;
          collection_date?: string;
          collected_by?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pack_id?: string | null;
          collection_date?: string;
          collected_by?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
