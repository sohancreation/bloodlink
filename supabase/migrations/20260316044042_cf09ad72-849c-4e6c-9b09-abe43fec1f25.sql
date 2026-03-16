
-- Requester credits table
CREATE TABLE public.requester_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  balance integer NOT NULL DEFAULT 3,
  free_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.requester_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits" ON public.requester_credits FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own credits" ON public.requester_credits FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all requester credits" ON public.requester_credits FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Requester credit transactions
CREATE TABLE public.requester_credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type credit_transaction_type NOT NULL,
  description text NOT NULL DEFAULT '',
  request_id uuid REFERENCES public.blood_requests(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.requester_credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.requester_credit_transactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all requester transactions" ON public.requester_credit_transactions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Requester credit packages
CREATE TABLE public.requester_credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL,
  price_bdt integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.requester_credit_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active requester packages" ON public.requester_credit_packages FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage requester packages" ON public.requester_credit_packages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Requester purchase requests
CREATE TABLE public.requester_purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package_id uuid NOT NULL REFERENCES public.requester_credit_packages(id),
  payment_method text NOT NULL DEFAULT '',
  payment_reference text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.requester_purchase_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchase requests" ON public.requester_purchase_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own purchase requests" ON public.requester_purchase_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage all requester purchase requests" ON public.requester_purchase_requests FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger: grant 3 free credits on donor signup
CREATE OR REPLACE FUNCTION public.grant_requester_signup_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role = 'donor' THEN
    INSERT INTO public.requester_credits (user_id, balance) VALUES (NEW.id, 3)
    ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.requester_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 3, 'signup_bonus', 'Welcome bonus: 3 free blood request credits');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER grant_requester_credits_on_signup
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.grant_requester_signup_credits();

-- Trigger: deduct 1 requester credit on blood_requests insert (non-hospital)
CREATE OR REPLACE FUNCTION public.deduct_requester_credit_on_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_hospital boolean;
BEGIN
  -- Check if the user is a hospital (they use hospital credits instead)
  SELECT EXISTS (SELECT 1 FROM public.hospitals WHERE user_id = auth.uid()) INTO is_hospital;
  IF is_hospital THEN
    RETURN NEW;
  END IF;

  -- Deduct 1 credit from requester
  UPDATE public.requester_credits
  SET balance = balance - 1, updated_at = now()
  WHERE user_id = auth.uid() AND balance > 0;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits to create a blood request. Please purchase more credits.';
  END IF;

  INSERT INTO public.requester_credit_transactions (user_id, amount, type, description, request_id)
  VALUES (auth.uid(), -1, 'match_deduction', 'Credit deducted for blood request', NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER deduct_requester_credit_on_insert
AFTER INSERT ON public.blood_requests
FOR EACH ROW
EXECUTE FUNCTION public.deduct_requester_credit_on_request();

-- Seed requester credit packages
INSERT INTO public.requester_credit_packages (name, credits, price_bdt) VALUES
  ('Basic', 5, 29),
  ('Popular', 15, 69),
  ('Super Saver', 35, 129);

-- Updated_at triggers
CREATE TRIGGER update_requester_credits_updated_at BEFORE UPDATE ON public.requester_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requester_purchase_requests_updated_at BEFORE UPDATE ON public.requester_purchase_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
