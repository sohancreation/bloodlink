
-- Table for live donor locations during missions
CREATE TABLE public.donor_live_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES public.donors(id) ON DELETE CASCADE,
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  latitude double precision NOT NULL DEFAULT 0,
  longitude double precision NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(donor_id, mission_id)
);

-- Enable RLS
ALTER TABLE public.donor_live_locations ENABLE ROW LEVEL SECURITY;

-- Donors can manage their own live location
CREATE POLICY "Donors can insert own location"
  ON public.donor_live_locations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Donors can update own location"
  ON public.donor_live_locations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Donors can delete own location"
  ON public.donor_live_locations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Everyone authenticated can view live locations
CREATE POLICY "Anyone can view live locations"
  ON public.donor_live_locations FOR SELECT
  TO authenticated
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_live_locations;
