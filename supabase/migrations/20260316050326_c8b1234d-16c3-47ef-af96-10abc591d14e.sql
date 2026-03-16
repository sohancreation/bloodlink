-- Ensure requester credits default to 10 for new rows
ALTER TABLE public.requester_credits
ALTER COLUMN balance SET DEFAULT 10;

-- Backfill missing requester credit rows for existing donor users
WITH inserted AS (
  INSERT INTO public.requester_credits (user_id, balance, free_used)
  SELECT p.id, 10, 0
  FROM public.profiles p
  LEFT JOIN public.requester_credits rc ON rc.user_id = p.id
  WHERE p.role = 'donor'::app_role
    AND rc.user_id IS NULL
  RETURNING user_id
)
INSERT INTO public.requester_credit_transactions (user_id, amount, type, description)
SELECT user_id, 10, 'signup_bonus'::credit_transaction_type, 'Welcome bonus backfill: 10 free blood request credits'
FROM inserted;

-- Make deduction trigger resilient if credit row is missing
CREATE OR REPLACE FUNCTION public.deduct_requester_credit_on_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_hospital boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.hospitals WHERE user_id = auth.uid()
  ) INTO is_hospital;

  IF is_hospital THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.requester_credits WHERE user_id = auth.uid()
  ) THEN
    INSERT INTO public.requester_credits (user_id, balance, free_used)
    VALUES (auth.uid(), 10, 0);

    INSERT INTO public.requester_credit_transactions (user_id, amount, type, description)
    VALUES (
      auth.uid(),
      10,
      'signup_bonus'::credit_transaction_type,
      'Welcome bonus auto-initialized: 10 free blood request credits'
    );
  END IF;

  UPDATE public.requester_credits
  SET balance = balance - 2,
      updated_at = now()
  WHERE user_id = auth.uid()
    AND balance >= 2;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits (2 required per request). Please purchase more credits.';
  END IF;

  INSERT INTO public.requester_credit_transactions (user_id, amount, type, description, request_id)
  VALUES (
    auth.uid(),
    -2,
    'match_deduction'::credit_transaction_type,
    'Credits deducted for blood request (2 per post)',
    NEW.id
  );

  RETURN NEW;
END;
$$;