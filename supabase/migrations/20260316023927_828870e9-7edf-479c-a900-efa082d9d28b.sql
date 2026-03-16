
-- Add new columns to blood_requests
ALTER TABLE public.blood_requests 
  ADD COLUMN IF NOT EXISTS requester_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS requester_mobile text DEFAULT '',
  ADD COLUMN IF NOT EXISTS zilla text DEFAULT '',
  ADD COLUMN IF NOT EXISTS upozilla text DEFAULT '';

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_id uuid REFERENCES public.blood_requests(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  blood_type text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- System can insert notifications (via trigger with security definer)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add upozilla column to donors table for matching
ALTER TABLE public.donors
  ADD COLUMN IF NOT EXISTS zilla text DEFAULT '',
  ADD COLUMN IF NOT EXISTS upozilla text DEFAULT '';

-- Create function to auto-notify matching donors
CREATE OR REPLACE FUNCTION public.notify_matching_donors()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert notification for each donor with matching blood_type and upozilla
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
$$;

-- Create trigger on blood_requests insert
CREATE TRIGGER on_blood_request_created
  AFTER INSERT ON public.blood_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_matching_donors();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
