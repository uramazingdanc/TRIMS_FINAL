
import { Database } from '@/integrations/supabase/types';

// Define typed tables
export type ProfilesTable = Database['public']['Tables']['profiles']['Row'];
export type RoomsTable = Database['public']['Tables']['rooms']['Row'];
export type TenantsTable = Database['public']['Tables']['tenants']['Row'];
export type PaymentsTable = Database['public']['Tables']['payments']['Row'];
export type MaintenanceRequestsTable = Database['public']['Tables']['maintenance_requests']['Row'];
export type AnnouncementsTable = Database['public']['Tables']['announcements']['Row'];
export type InvoicesTable = Database['public']['Tables']['invoices']['Row'];
export type InvoiceItemsTable = Database['public']['Tables']['invoice_items']['Row'];
export type RoomAmenitiesTable = Database['public']['Tables']['room_amenities']['Row'];
