-- Create pack_checks table for tracking webster pack checks
CREATE TABLE IF NOT EXISTS public.pack_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pack_id TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    check_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    checked_by TEXT,
    notes TEXT,
    status TEXT DEFAULT 'completed',
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for pack_checks table
ALTER TABLE public.pack_checks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own pack checks
DROP POLICY IF EXISTS "Users can view their own pack checks" ON public.pack_checks;
CREATE POLICY "Users can view their own pack checks" 
    ON public.pack_checks 
    FOR SELECT 
    USING (user_id = auth.uid());

-- Create policy to allow users to insert their own pack checks
DROP POLICY IF EXISTS "Users can insert their own pack checks" ON public.pack_checks;
CREATE POLICY "Users can insert their own pack checks" 
    ON public.pack_checks 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- Create policy to allow users to update their own pack checks
DROP POLICY IF EXISTS "Users can update their own pack checks" ON public.pack_checks;
CREATE POLICY "Users can update their own pack checks" 
    ON public.pack_checks 
    FOR UPDATE 
    USING (user_id = auth.uid());

-- Create policy to allow users to delete their own pack checks
DROP POLICY IF EXISTS "Users can delete their own pack checks" ON public.pack_checks;
CREATE POLICY "Users can delete their own pack checks" 
    ON public.pack_checks 
    FOR DELETE 
    USING (user_id = auth.uid());

-- Enable realtime for this table
alter publication supabase_realtime add table pack_checks;
