-- 1. Fix profiles UPDATE: prevent users from changing their own role
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()));

-- 2. Fix blood_requests INSERT: remove the overly permissive policy, replace with scoped one
DROP POLICY IF EXISTS "Authenticated users can create requests" ON public.blood_requests;
CREATE POLICY "Authenticated users can create own requests"
ON public.blood_requests
FOR INSERT
TO authenticated
WITH CHECK (
  -- Hospitals can only create requests for their own hospital
  (EXISTS (SELECT 1 FROM hospitals WHERE hospitals.id = blood_requests.hospital_id AND hospitals.user_id = auth.uid()))
  OR
  -- Donors: hospital_id must match a real hospital (validated by FK), but we track the creator
  (NOT EXISTS (SELECT 1 FROM hospitals WHERE hospitals.user_id = auth.uid()))
);

-- 3. Fix donor_live_locations SELECT: scope to donor themselves or related hospital
DROP POLICY IF EXISTS "Anyone can view live locations" ON public.donor_live_locations;
CREATE POLICY "Scoped live location access"
ON public.donor_live_locations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM missions m
    JOIN blood_requests br ON br.id = m.request_id
    JOIN hospitals h ON h.id = br.hospital_id
    WHERE m.id = donor_live_locations.mission_id
      AND h.user_id = auth.uid()
  )
);