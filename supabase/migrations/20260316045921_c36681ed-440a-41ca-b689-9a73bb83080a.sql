
-- Update deduction trigger to deduct 2 credits per post
CREATE OR REPLACE FUNCTION public.deduct_requester_credit_on_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_hospital boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.hospitals WHERE user_id = auth.uid()) INTO is_hospital;
  IF is_hospital THEN
    RETURN NEW;
  END IF;

  UPDATE public.requester_credits
  SET balance = balance - 2, updated_at = now()
  WHERE user_id = auth.uid() AND balance >= 2;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits (2 required per request). Please purchase more credits.';
  END IF;

  INSERT INTO public.requester_credit_transactions (user_id, amount, type, description, request_id)
  VALUES (auth.uid(), -2, 'match_deduction', 'Credits deducted for blood request (2 per post)', NEW.id);

  RETURN NEW;
END;
$$;
