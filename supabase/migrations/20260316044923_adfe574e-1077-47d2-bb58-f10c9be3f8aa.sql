
-- Hospital subscriptions table
CREATE TABLE public.hospital_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  credits_per_month INTEGER NOT NULL,
  price_bdt INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT '',
  payment_reference TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hospital_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS: hospitals can view own
CREATE POLICY "Hospitals can view own subscriptions"
  ON public.hospital_subscriptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = hospital_subscriptions.hospital_id AND hospitals.user_id = auth.uid()));

-- RLS: hospitals can insert own
CREATE POLICY "Hospitals can create subscriptions"
  ON public.hospital_subscriptions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = hospital_subscriptions.hospital_id AND hospitals.user_id = auth.uid()));

-- RLS: admins can manage all
CREATE POLICY "Admins can manage all subscriptions"
  ON public.hospital_subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
