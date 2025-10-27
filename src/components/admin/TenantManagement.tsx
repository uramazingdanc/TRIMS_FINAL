import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TenantsTable, RoomsTable, ProfilesTable } from '@/types/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/Spinner';
import { Search, UserPlus, Edit, DollarSign, Home, Bell } from 'lucide-react';

interface TenantWithProfile extends TenantsTable {
  profiles?: ProfilesTable | null;
  rooms?: RoomsTable | null;
}

const TenantManagement = () => {
  const [tenants, setTenants] = useState<TenantWithProfile[]>([]);
  const [rooms, setRooms] = useState<RoomsTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithProfile | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTenantsAndRooms();
  }, []);

  const fetchTenantsAndRooms = async () => {
    try {
      setLoading(true);
      
      // Fetch tenants with profiles and rooms
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select(`
          *,
          profiles(*),
          rooms(*)
        `)
        .order('created_at', { ascending: false });

      if (tenantsError) throw tenantsError;

      // Fetch available rooms for assignments
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (roomsError) throw roomsError;

      setTenants((tenantsData as any) || []);
      setRooms(roomsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch tenant data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tenant.phone && tenant.phone.includes(searchTerm))
  );

  const updatePaymentStatus = async (tenantId: string, status: 'paid' | 'pending' | 'overdue') => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ payment_status: status })
        .eq('id', tenantId);

      if (error) throw error;

      await fetchTenantsAndRooms();
      
      toast({
        title: 'Success',
        description: `Payment status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Error',
        description: 'Could not update payment status.',
        variant: 'destructive',
      });
    }
  };

  const processPayment = async () => {
    if (!selectedTenant || !paymentAmount) return;

    try {
      const amount = parseFloat(paymentAmount);
      const newBalance = Math.max(0, selectedTenant.balance - amount);
      const newStatus = newBalance === 0 ? 'paid' : selectedTenant.payment_status;

      const { error } = await supabase
        .from('tenants')
        .update({ 
          balance: newBalance,
          payment_status: newStatus
        })
        .eq('id', selectedTenant.id);

      if (error) throw error;

      // Create payment record
      await supabase
        .from('payments')
        .insert({
          tenant_id: selectedTenant.id,
          amount: amount,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'cash',
        });

      await fetchTenantsAndRooms();
      setIsPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedTenant(null);
      
      toast({
        title: 'Payment Processed',
        description: `Payment of ₱${amount.toLocaleString()} has been recorded.`,
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Could not process payment.',
        variant: 'destructive',
      });
    }
  };

  const assignRoom = async (tenantId: string, roomId: string) => {
    try {
      // Update tenant's room assignment
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({ room_id: roomId })
        .eq('id', tenantId);

      if (tenantError) throw tenantError;

      // Update room occupancy (removed occupants column)
      await fetchTenantsAndRooms();
      
      toast({
        title: 'Room Assigned',
        description: 'Room has been successfully assigned to tenant.',
      });
    } catch (error) {
      console.error('Error assigning room:', error);
      toast({
        title: 'Error',
        description: 'Could not assign room.',
        variant: 'destructive',
      });
    }
  };

  const getMaxOccupants = (roomType: string) => {
    switch (roomType) {
      case 'single': return 1;
      case 'double': return 2;
      case 'triple': return 3;
      default: return 1;
    }
  };

  const sendNotification = async (tenantId: string, message: string) => {
    try {
      // In a real app, you would implement a notifications system
      // For now, we'll just show a toast
      toast({
        title: 'Notification Sent',
        description: `Notification sent to tenant: "${message}"`,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500 text-white">Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getRoomDisplay = (tenant: TenantWithProfile) => {
    return tenant.rooms ? tenant.rooms.room_number : 'Not assigned';
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-tmis-dark">Tenant Management</h1>
          <p className="text-muted-foreground">Manage tenants, payments, and room assignments</p>
        </div>
        <Button className="bg-tmis-primary hover:bg-tmis-primary/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Tenant
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tenants Directory</CardTitle>
              <CardDescription>
                Comprehensive tenant management and room assignments
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableCaption>Complete tenant management system.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id} className="group">
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-muted-foreground">{tenant.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getRoomDisplay(tenant)}</span>
                          {!tenant.room_id && (
                            <Select onValueChange={(value) => assignRoom(tenant.id, value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Assign" />
                              </SelectTrigger>
                              <SelectContent>
                                {rooms
                                  .filter(room => room.status === 'available')
                                  .map((room) => (
                                    <SelectItem key={room.id} value={room.id}>
                                      {room.room_number}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{tenant.phone || 'No phone'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentStatusBadge(tenant.payment_status)}
                          <Select onValueChange={(value) => updatePaymentStatus(tenant.id, value as any)}>
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Change" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={tenant.balance > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            ₱{tenant.balance.toLocaleString()}
                          </span>
                          {tenant.balance > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setIsPaymentDialogOpen(true);
                              }}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>From: {tenant.lease_start}</div>
                          <div>To: {tenant.lease_end}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendNotification(tenant.id, `Payment reminder for ${tenant.name}`)}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No tenants found. {searchTerm && 'Try a different search term.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedTenant?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              {selectedTenant && (
                <p className="text-sm text-muted-foreground mt-1">
                  Current balance: ₱{selectedTenant.balance.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processPayment}>
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TenantManagement;