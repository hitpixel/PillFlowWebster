-- Drop the foreign key constraint that's causing issues
ALTER TABLE IF EXISTS public.pack_checks
    DROP CONSTRAINT IF EXISTS pack_checks_pack_id_fkey;

-- Make sure the user_id column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'pack_checks' 
                   AND column_name = 'user_id') THEN
        ALTER TABLE public.pack_checks ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Update RLS policies to use user_id directly
DROP POLICY IF EXISTS "Users can view their own pack checks" ON public.pack_checks;
CREATE POLICY "Users can view their own pack checks" 
    ON public.pack_checks 
    FOR SELECT 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own pack checks" ON public.pack_checks;
CREATE POLICY "Users can insert their own pack checks" 
    ON public.pack_checks 
    FOR INSERT 
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own pack checks" ON public.pack_checks;
CREATE POLICY "Users can update their own pack checks" 
    ON public.pack_checks 
    FOR UPDATE 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own pack checks" ON public.pack_checks;
CREATE POLICY "Users can delete their own pack checks" 
    ON public.pack_checks 
    FOR DELETE 
    USING (user_id = auth.uid());
