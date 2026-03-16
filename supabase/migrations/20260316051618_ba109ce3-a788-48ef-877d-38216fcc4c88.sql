-- Allow admins to delete donors
CREATE POLICY "Admins can delete donors" ON public.donors
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete hospitals
CREATE POLICY "Admins can delete hospitals" ON public.hospitals
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete notifications
CREATE POLICY "Admins can delete notifications" ON public.notifications
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert notifications
CREATE POLICY "Admins can insert notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete requester credits
CREATE POLICY "Admins can delete requester credits" ON public.requester_credits
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert requester credits
CREATE POLICY "Admins can insert requester credits" ON public.requester_credits
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete requester credit transactions
CREATE POLICY "Admins can delete requester credit transactions" ON public.requester_credit_transactions
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete hospital credits
CREATE POLICY "Admins can delete hospital credits" ON public.hospital_credits
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete credit transactions
CREATE POLICY "Admins can delete credit transactions" ON public.credit_transactions
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));