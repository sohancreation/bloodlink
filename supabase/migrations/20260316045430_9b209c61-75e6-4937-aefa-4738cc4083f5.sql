
-- Update hospital signup bonus from 5 to 10
CREATE OR REPLACE FUNCTION public.grant_signup_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.hospital_credits (hospital_id, balance) VALUES (NEW.id, 10);
  INSERT INTO public.credit_transactions (hospital_id, amount, type, description)
  VALUES (NEW.id, 10, 'signup_bonus', 'Welcome bonus: 10 free credits');
  RETURN NEW;
END;
$$;

-- Update requester signup bonus from 3 to 10
CREATE OR REPLACE FUNCTION public.grant_requester_signup_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.role = 'donor' THEN
    INSERT INTO public.requester_credits (user_id, balance) VALUES (NEW.id, 10)
    ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.requester_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 10, 'signup_bonus', 'Welcome bonus: 10 free blood request credits');
  END IF;
  RETURN NEW;
END;
$$;
