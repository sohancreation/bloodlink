-- Fix function search path mutable warnings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_matching_donors()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notifications (user_id, request_id, title, message, blood_type)
  SELECT 
    d.user_id,
    NEW.id,
    'জরুরি রক্তের অনুরোধ / Emergency Blood Request',
    NEW.requester_name || ' needs ' || NEW.blood_type || ' blood at ' || NEW.hospital_name || 
    CASE WHEN NEW.upozilla != '' THEN ' (' || NEW.upozilla || ', ' || NEW.zilla || ')' ELSE '' END ||
    CASE WHEN NEW.requester_mobile != '' THEN '. Contact: ' || NEW.requester_mobile ELSE '' END,
    NEW.blood_type::text
  FROM public.donors d
  WHERE d.blood_type::text = NEW.blood_type::text
    AND d.upozilla != ''
    AND NEW.upozilla != ''
    AND d.upozilla = NEW.upozilla
    AND d.is_available = true
    AND d.user_id != auth.uid();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_requester_on_mission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  req RECORD;
  donor_name TEXT;
  donor_phone TEXT;
BEGIN
  SELECT * INTO req FROM public.blood_requests WHERE id = NEW.request_id;
  SELECT p.full_name, p.phone INTO donor_name, donor_phone
  FROM public.profiles p WHERE p.id = NEW.donor_user_id;
  IF req.hospital_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, request_id, title, message, blood_type)
    SELECT h.user_id, NEW.request_id,
      'মিশন গৃহীত / Mission Accepted',
      COALESCE(donor_name, 'A donor') || ' has accepted the mission for ' || req.blood_type || ' blood at ' || req.hospital_name ||
      CASE WHEN donor_phone IS NOT NULL AND donor_phone != '' THEN '. Contact: ' || donor_phone ELSE '' END,
      req.blood_type::text
    FROM public.hospitals h WHERE h.id = req.hospital_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deduct_credit_on_fulfillment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.grant_signup_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.hospital_credits (hospital_id, balance) VALUES (NEW.id, 10);
  INSERT INTO public.credit_transactions (hospital_id, amount, type, description)
  VALUES (NEW.id, 10, 'signup_bonus', 'Welcome bonus: 10 free credits');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.grant_requester_signup_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role = 'donor' THEN
    INSERT INTO public.requester_credits (user_id, balance) VALUES (NEW.id, 10)
    ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.requester_credit_transactions (user_id, amount, type, description)
    VALUES (NEW.id, 10, 'signup_bonus', 'Welcome bonus: 10 free blood request credits');
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.deduct_requester_credit_on_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    VALUES (auth.uid(), 10, 'signup_bonus'::credit_transaction_type, 'Welcome bonus auto-initialized: 10 free blood request credits');
  END IF;
  UPDATE public.requester_credits
  SET balance = balance - 2, updated_at = now()
  WHERE user_id = auth.uid() AND balance >= 2;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits (2 required per request). Please purchase more credits.';
  END IF;
  INSERT INTO public.requester_credit_transactions (user_id, amount, type, description, request_id)
  VALUES (auth.uid(), -2, 'match_deduction'::credit_transaction_type, 'Credits deducted for blood request (2 per post)', NEW.id);
  RETURN NEW;
END;
$function$;