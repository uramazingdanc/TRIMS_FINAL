-- Enhanced Room Management System for TMIS

-- First, let's enhance the existing rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS room_number TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS max_occupants INTEGER DEFAULT 1;

-- Update room_number from existing number field if it exists
UPDATE public.rooms SET room_number = number WHERE room_number IS NULL AND number IS NOT NULL;

-- Create room assignment logs table for audit trail
CREATE TABLE IF NOT EXISTS public.room_assignment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  room_id UUID NOT NULL REFERENCES public.rooms(id),
  action TEXT NOT NULL CHECK (action IN ('assign', 'unassign', 'transfer')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on room assignment logs
ALTER TABLE public.room_assignment_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms table (update existing or create new)
DROP POLICY IF EXISTS "Tenants can view available rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can manage all rooms" ON public.rooms;

-- Tenants can only view available rooms
CREATE POLICY "Tenants can view available rooms" 
ON public.rooms 
FOR SELECT 
USING (
  status = 'available' OR 
  (auth.uid() IN (SELECT user_id FROM public.tenants WHERE room_id = rooms.id))
);

-- Admins can manage all rooms
CREATE POLICY "Admins can manage all rooms" 
ON public.rooms 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for room assignment logs
CREATE POLICY "Admins can view all assignment logs" 
ON public.room_assignment_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can create assignment logs" 
ON public.room_assignment_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Function to automatically update room status and log assignments
CREATE OR REPLACE FUNCTION public.handle_room_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If room_id changed (assignment/unassignment/transfer)
  IF TG_OP = 'UPDATE' AND (OLD.room_id IS DISTINCT FROM NEW.room_id) THEN
    
    -- Unassign old room if there was one
    IF OLD.room_id IS NOT NULL THEN
      -- Check if room has other occupants
      IF (SELECT COUNT(*) FROM public.tenants WHERE room_id = OLD.room_id AND id != NEW.id) = 0 THEN
        UPDATE public.rooms SET status = 'available' WHERE id = OLD.room_id;
      END IF;
      
      -- Log unassignment
      INSERT INTO public.room_assignment_logs (tenant_id, room_id, action, notes)
      VALUES (NEW.id, OLD.room_id, 'unassign', 'Room unassigned via tenant update');
    END IF;
    
    -- Assign new room if there is one
    IF NEW.room_id IS NOT NULL THEN
      UPDATE public.rooms SET status = 'occupied' WHERE id = NEW.room_id;
      
      -- Log assignment
      INSERT INTO public.room_assignment_logs (tenant_id, room_id, action, notes)
      VALUES (NEW.id, NEW.room_id, 'assign', 'Room assigned via tenant update');
    END IF;
    
  END IF;
  
  -- If new tenant with room assignment
  IF TG_OP = 'INSERT' AND NEW.room_id IS NOT NULL THEN
    UPDATE public.rooms SET status = 'occupied' WHERE id = NEW.room_id;
    
    -- Log assignment
    INSERT INTO public.room_assignment_logs (tenant_id, room_id, action, notes)
    VALUES (NEW.id, NEW.room_id, 'assign', 'Room assigned to new tenant');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for room assignment handling
DROP TRIGGER IF EXISTS trigger_handle_room_assignment ON public.tenants;
CREATE TRIGGER trigger_handle_room_assignment
  AFTER INSERT OR UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_room_assignment();

-- Insert some sample rooms if none exist
INSERT INTO public.rooms (room_number, floor, type, status, price_per_month, description, max_occupants)
SELECT * FROM (VALUES
  ('1A', '1', 'single', 'available', 8000, 'Cozy single room with window view', 1),
  ('1B', '1', 'double', 'available', 12000, 'Spacious double room with shared bathroom', 2),
  ('2A', '2', 'single', 'available', 8500, 'Single room on second floor', 1),
  ('2B', '2', 'triple', 'available', 15000, 'Large triple room perfect for friends', 3),
  ('3A', '3', 'single', 'available', 9000, 'Premium single room with balcony', 1),
  ('3B', '3', 'quad', 'available', 18000, 'Spacious quad room with private bathroom', 4)
) AS new_rooms(room_number, floor, type, status, price_per_month, description, max_occupants)
WHERE NOT EXISTS (SELECT 1 FROM public.rooms LIMIT 1);