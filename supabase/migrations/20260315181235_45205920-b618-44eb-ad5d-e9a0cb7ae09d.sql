-- Create enums
CREATE TYPE public.app_role AS ENUM ('donor', 'hospital', 'admin');
CREATE TYPE public.blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE public.urgency_level AS ENUM ('CRITICAL', 'URGENT', 'STABLE');
CREATE TYPE public.request_status AS ENUM ('OPEN', 'MATCHED', 'FULFILLED', 'CANCELLED');
CREATE TYPE public.donation_status AS ENUM ('pending', 'completed', 'cancelled');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  role app_role NOT NULL DEFAULT 'donor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Donors table
CREATE TABLE public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  blood_type blood_type NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  last_donation_date TIMESTAMPTZ,
  is_available BOOLEAN NOT NULL DEFAULT true,
  donation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available donors" ON public.donors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Donors can update own record" ON public.donors FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Donors can insert own record" ON public.donors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Hospitals table
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  contact_number TEXT,
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hospitals" ON public.hospitals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hospital can update own record" ON public.hospitals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Hospital can insert own record" ON public.hospitals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Blood requests table
CREATE TABLE public.blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  blood_type blood_type NOT NULL,
  units_needed INTEGER NOT NULL DEFAULT 1,
  urgency urgency_level NOT NULL DEFAULT 'STABLE',
  status request_status NOT NULL DEFAULT 'OPEN',
  patient_condition TEXT,
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  hospital_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view requests" ON public.blood_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hospital can create requests" ON public.blood_requests FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = hospital_id AND hospitals.user_id = auth.uid()));
CREATE POLICY "Hospital can update own requests" ON public.blood_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = hospital_id AND hospitals.user_id = auth.uid()));

-- Blood inventory table
CREATE TABLE public.blood_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  blood_type blood_type NOT NULL,
  units_available INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view inventory" ON public.blood_inventory FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hospital can manage own inventory" ON public.blood_inventory FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.hospitals WHERE hospitals.id = hospital_id AND hospitals.user_id = auth.uid()));

-- Donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.blood_requests(id) ON DELETE SET NULL,
  hospital_name TEXT NOT NULL DEFAULT '',
  blood_type blood_type NOT NULL,
  status donation_status NOT NULL DEFAULT 'pending',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors can view own donations" ON public.donations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.donors WHERE donors.id = donor_id AND donors.user_id = auth.uid()));
CREATE POLICY "Hospital can view donations for their requests" ON public.donations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.blood_requests br JOIN public.hospitals h ON br.hospital_id = h.id WHERE br.id = request_id AND h.user_id = auth.uid()));
CREATE POLICY "Donors can insert own donations" ON public.donations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.donors WHERE donors.id = donor_id AND donors.user_id = auth.uid()));
CREATE POLICY "Admins can view all donations" ON public.donations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'donor')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'donor')
  );

  IF COALESCE(NEW.raw_user_meta_data->>'role', 'donor') = 'donor' THEN
    INSERT INTO public.donors (user_id, blood_type, city, latitude, longitude)
    VALUES (
      NEW.id,
      COALESCE((NEW.raw_user_meta_data->>'blood_type')::blood_type, 'O+'),
      COALESCE(NEW.raw_user_meta_data->>'city', ''),
      COALESCE((NEW.raw_user_meta_data->>'latitude')::double precision, 24.3745),
      COALESCE((NEW.raw_user_meta_data->>'longitude')::double precision, 88.6042)
    );
  END IF;

  IF NEW.raw_user_meta_data->>'role' = 'hospital' THEN
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
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON public.donors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blood_requests_updated_at BEFORE UPDATE ON public.blood_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blood_inventory_updated_at BEFORE UPDATE ON public.blood_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();