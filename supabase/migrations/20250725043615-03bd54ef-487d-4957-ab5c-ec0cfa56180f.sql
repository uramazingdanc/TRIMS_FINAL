-- Fix security issues detected by linter

-- Fix search_path for the existing function
CREATE OR REPLACE FUNCTION public.handle_room_assignment()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Also fix the existing handle_new_user function if it exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'tenant')
  );
  RETURN NEW;
END;
$$;