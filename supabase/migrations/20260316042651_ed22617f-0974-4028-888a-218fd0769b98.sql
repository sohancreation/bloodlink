
-- Enum for credit transaction types
CREATE TYPE public.credit_transaction_type AS ENUM ('purchase', 'match_deduction', 'refund', 'signup_bonus');

-- Hospital credits balance table
CREATE TABLE public.hospital_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(hospital_id)
);
ALTER TABLE public.hospital_credits ENABLE ROW LEVEL SECURITY;

-- Credit transactions audit log
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  type public.credit_transaction_type NOT NULL,
  description text NOT NULL DEFAULT '',
  request_id uuid REFERENCES public.blood_requests(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Credit packages
CREATE TABLE public.credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL,
  price_bdt integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Credit purchase requests (pending admin approval)
CREATE TABLE public.credit_purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id uuid NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.credit_packages(id),
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT '',
  payment_reference text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.credit_purchase_requests ENABLE ROW LEVEL SECURITY;

-- RLS: hospital_credits
CREATE POLICY "Hospitals can view own credits" ON public.hospital_credits FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = hospital_credits.hospital_id AND hospitals.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all credits" ON public.hospital_credits FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: credit_transactions
CREATE POLICY "Hospitals can view own transactions" ON public.credit_transactions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = credit_transactions.hospital_id AND hospitals.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all transactions" ON public.credit_transactions FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: credit_packages (anyone authenticated can view active)
CREATE POLICY "Anyone can view active packages" ON public.credit_packages FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage packages" ON public.credit_packages FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: credit_purchase_requests
CREATE POLICY "Hospitals can view own purchase requests" ON public.credit_purchase_requests FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = credit_purchase_requests.hospital_id AND hospitals.user_id = auth.uid())
);
CREATE POLICY "Hospitals can create purchase requests" ON public.credit_purchase_requests FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = credit_purchase_requests.hospital_id AND hospitals.user_id = auth.uid())
);
CREATE POLICY "Admins can manage all purchase requests" ON public.credit_purchase_requests FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger: grant 5 free credits on hospital signup
CREATE OR REPLACE FUNCTION public.grant_signup_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.hospital_credits (hospital_id, balance) VALUES (NEW.id, 5);
  INSERT INTO public.credit_transactions (hospital_id, amount, type, description)
  VALUES (NEW.id, 5, 'signup_bonus', 'Welcome bonus: 5 free credits');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_hospital_insert_grant_credits
AFTER INSERT ON public.hospitals
FOR EACH ROW EXECUTE FUNCTION public.grant_signup_credits();

-- Trigger: deduct 1 credit on request fulfillment
CREATE OR REPLACE FUNCTION public.deduct_credit_on_fulfillment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'FULFILLED' AND OLD.status != 'FULFILLED' THEN
    UPDATE public.hospital_credits
    SET balance = balance - 1, updated_at = now()
    WHERE hospital_id = NEW.hospital_id AND balance > 0;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient credits to fulfill this request';
    END IF;

    INSERT INTO public.credit_transactions (hospital_id, amount, type, description, request_id)
    VALUES (NEW.hospital_id, -1, 'match_deduction', 'Credit deducted for fulfilled request', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_request_fulfilled_deduct_credit
BEFORE UPDATE OF status ON public.blood_requests
FOR EACH ROW EXECUTE FUNCTION public.deduct_credit_on_fulfillment();

-- Insert default credit packages
INSERT INTO public.credit_packages (name, credits, price_bdt) VALUES
  ('Starter', 10, 99),
  ('Standard', 30, 249),
  ('Premium', 75, 499);
