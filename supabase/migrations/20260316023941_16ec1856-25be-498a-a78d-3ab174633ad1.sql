
-- Fix the permissive insert policy - only the trigger function (security definer) should insert
DROP POLICY "System can insert notifications" ON public.notifications;

-- Allow donors to also create requests (not just hospitals)
CREATE POLICY "Authenticated users can create requests"
  ON public.blood_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);
