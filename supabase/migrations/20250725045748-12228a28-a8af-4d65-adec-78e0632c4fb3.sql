-- Enable realtime for rooms table
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;

-- Enable realtime for tenants table
ALTER TABLE public.tenants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;

-- Enable realtime for room_assignment_logs table
ALTER TABLE public.room_assignment_logs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_assignment_logs;