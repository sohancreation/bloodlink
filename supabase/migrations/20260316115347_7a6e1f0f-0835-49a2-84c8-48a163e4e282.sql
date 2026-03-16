-- 1. Fix hospital PII exposure: scope hospital profile access to related donors only
DROP POLICY IF EXISTS "Hospital and admin can view profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Hospitals can view profiles of related donors"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM missions m
    JOIN blood_requests br ON br.id = m.request_id
    JOIN hospitals h ON h.id = br.hospital_id
    WHERE m.donor_user_id = profiles.id AND h.user_id = auth.uid()
  )
);

-- 2. Fix mission donor_id spoofing
DROP POLICY IF EXISTS "Donors can insert own missions" ON public.missions;
CREATE POLICY "Donors can insert own missions"
ON public.missions FOR INSERT TO authenticated
WITH CHECK (
  donor_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM donors WHERE donors.id = missions.donor_id AND donors.user_id = auth.uid()
  )
);