import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { RoomsTable } from '@/types/supabase';

const tenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  room_id: z.string().min(1, 'Please select a room'),
  emergency_contact: z.string().optional(),
  lease_start: z.string().min(1, 'Lease start date is required'),
  lease_end: z.string().min(1, 'Lease end date is required'),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface AddTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddTenantDialog({ open, onOpenChange, onSuccess }: AddTenantDialogProps) {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<RoomsTable[]>([]);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      room_id: '',
      emergency_contact: '',
      lease_start: '',
      lease_end: '',
    },
  });

  // Fetch available rooms when dialog opens
  useState(() => {
    if (open) {
      fetchAvailableRooms();
    }
  });

  const fetchAvailableRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'available');

    if (error) {
      toast.error('Failed to fetch rooms');
      return;
    }

    setRooms(data || []);
  };

  const onSubmit = async (values: TenantFormValues) => {
    try {
      setLoading(true);

      const { error } = await supabase.from('tenants').insert([
        {
          name: values.name,
          email: values.email,
          phone: values.phone,
          room_id: values.room_id,
          emergency_contact: values.emergency_contact,
          lease_start: values.lease_start,
          lease_end: values.lease_end,
          payment_status: 'pending',
          balance: 0,
        },
      ]);

      if (error) throw error;

      // Update room status to occupied
      await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', values.room_id);

      toast.success('Tenant added successfully!');
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new tenant to the system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+63 912 345 6789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.room_number} - Floor {room.floor} (₱{Number(room.price_per_month).toLocaleString()}/mo)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="+63 912 345 6789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lease_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lease Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lease_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lease End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Tenant'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
