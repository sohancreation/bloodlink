-- 1. Fix requester_credits: Remove user UPDATE policy that allows setting arbitrary balance
DROP POLICY IF EXISTS "Users can update own credits" ON public.requester_credits;

-- 2. Fix profiles PII exposure: Replace blanket SELECT with own-profile-only + hospital/admin access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Hospital and admin can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'hospital'::app_role)
);

-- 3. Fix handle_new_user: reject client-supplied 'admin' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  safe_role app_role;
BEGIN
  safe_role := CASE
    WHEN (NEW.raw_user_meta_data->>'role') = 'hospital' THEN 'hospital'::app_role
    ELSE 'donor'::app_role
  END;

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    safe_role
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, safe_role);

  IF safe_role = 'donor' THEN
    INSERT INTO public.donors (user_id, blood_type, city, latitude, longitude)
    VALUES (
      NEW.id,
      COALESCE((NEW.raw_user_meta_data->>'blood_type')::blood_type, 'O+'),
      COALESCE(NEW.raw_user_meta_data->>'city', ''),
      COALESCE((NEW.raw_user_meta_data->>'latitude')::double precision, 24.3745),
      COALESCE((NEW.raw_user_meta_data->>'longitude')::double precision, 88.6042)
    );
  END IF;

  IF safe_role = 'hospital' THEN
    INSERT INTO public.hospitals (user_id, name, address, contact_number, latitude, longitude)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'hospital_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'address', ''),
      COALESCE(NEW.raw_user_meta_data->>'contact_number', ''),
      COALESCE((NEW.raw_user_meta_data->>'latitude')::double precision, 24.3745),
      COALESCE((NEW.raw_user_meta_data->>'longitude')::double precision, 88.6042)
    );
  END IF;

  RETURN NEW;
END;
$function$;