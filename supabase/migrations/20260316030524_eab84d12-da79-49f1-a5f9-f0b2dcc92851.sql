
-- Allow donors to delete their own missions (for cancel)
CREATE POLICY "Donors can delete own missions" ON public.missions
  FOR DELETE TO authenticated
  USING (donor_user_id = auth.uid());
