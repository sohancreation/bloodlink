
-- Create mission status enum
CREATE TYPE public.mission_status AS ENUM ('accepted', 'departed', 'on_the_way', 'halfway', 'almost_there', 'arrived');

-- Create missions table for tracking donor missions
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  donor_user_id UUID NOT NULL,
  status mission_status NOT NULL DEFAULT 'accepted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Donors can view own missions" ON public.missions
  FOR SELECT TO authenticated
  USING (donor_user_id = auth.uid());

CREATE POLICY "Donors can insert own missions" ON public.missions
  FOR INSERT TO authenticated
  WITH CHECK (donor_user_id = auth.uid());

CREATE POLICY "Donors can update own missions" ON public.missions
  FOR UPDATE TO authenticated
  USING (donor_user_id = auth.uid());

CREATE POLICY "Requesters can view missions for their requests" ON public.missions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM blood_requests br
    JOIN hospitals h ON br.hospital_id = h.id
    WHERE br.id = missions.request_id AND h.user_id = auth.uid()
  ));

-- Trigger to update updated_at
CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to notify requester when a donor accepts a mission
CREATE OR REPLACE FUNCTION public.notify_requester_on_mission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  req RECORD;
  donor_name TEXT;
  donor_phone TEXT;
BEGIN
  -- Get request details
  SELECT * INTO req FROM blood_requests WHERE id = NEW.request_id;
  
  -- Get donor name and phone
  SELECT p.full_name, p.phone INTO donor_name, donor_phone
  FROM profiles p WHERE p.id = NEW.donor_user_id;

  -- Find the hospital user to notify
  IF req.hospital_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, request_id, title, message, blood_type)
    SELECT h.user_id, NEW.request_id,
      'মিশন গৃহীত / Mission Accepted',
      COALESCE(donor_name, 'A donor') || ' has accepted the mission for ' || req.blood_type || ' blood at ' || req.hospital_name ||
      CASE WHEN donor_phone IS NOT NULL AND donor_phone != '' THEN '. Contact: ' || donor_phone ELSE '' END,
      req.blood_type::text
    FROM hospitals h WHERE h.id = req.hospital_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_mission_created
  AFTER INSERT ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_requester_on_mission();
