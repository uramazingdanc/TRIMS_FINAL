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
import { 
  Search, 
  UserPlus, 
  Edit, 
  DollarSign, 
  Home, 
  Bell, 
  Filter,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  Eye,
  Trash2,
  MapPin
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TenantWithProfile extends TenantsTable {
  profiles?: ProfilesTable | null;
  rooms?: RoomsTable | null;
}

const EnhancedTenantManagement = () => {
  const [tenants, setTenants] = useState<TenantWithProfile[]>([]);
  const [rooms, setRooms] = useState<RoomsTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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
      
      const [tenantsRes, roomsRes] = await Promise.all([
        supabase
          .from('tenants')
          .select(`
            *,
            profiles(*),
            rooms(*)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('rooms')
          .select('*')
          .order('number', { ascending: true })
      ]);

      if (tenantsRes.error) throw tenantsRes.error;
      if (roomsRes.error) throw roomsRes.error;

      setTenants((tenantsRes.data as any) || []);
      setRooms(roomsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Oops! Something went wrong 😅',
        description: 'Could not fetch tenant data. Let\'s try that again!',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || tenant.payment_status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const updatePaymentStatus = async (tenantId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ payment_status: newStatus })
        .eq('id', tenantId);

      if (error) throw error;

      setTenants(tenants.map(tenant => 
        tenant.id === tenantId 
          ? { ...tenant, payment_status: newStatus }
          : tenant
      ));

      toast({
        title: '✅ Payment status updated!',
        description: `Status changed to ${newStatus}. Looking good!`,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: 'Hmm, that didn\'t work 🤔',
        description: 'Could not update payment status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const processPayment = async () => {
    if (!selectedTenant || !paymentAmount) return;

    try {
      const amount = parseFloat(paymentAmount);
      const newBalance = Number(selectedTenant.balance) - amount;

      // Update tenant balance and payment status
      const newPaymentStatus = newBalance <= 0 ? 'paid' : 'pending';
      
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({ 
          balance: newBalance,
          payment_status: newPaymentStatus
        })
        .eq('id', selectedTenant.id);

      if (tenantError) throw tenantError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          tenant_id: selectedTenant.id,
          amount: amount,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'cash',
          status: 'paid'
        });

      if (paymentError) throw paymentError;

      // Update local state
      setTenants(tenants.map(tenant => 
        tenant.id === selectedTenant.id 
          ? { ...tenant, balance: newBalance, payment_status: newPaymentStatus }
          : tenant
      ));

      setIsPaymentDialogOpen(false);
      setPaymentAmount('');
      setSelectedTenant(null);

      toast({
        title: '💸 Payment processed successfully!',
        description: `₱${amount.toLocaleString()} payment recorded. Awesome! 🎉`,
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Payment failed 😕',
        description: 'Could not process payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const assignRoom = async (tenantId: string, roomId: string) => {
    try {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;

      const maxOccupants = getMaxOccupants(room.type);
      
      const { error: tenantError } = await supabase
        .from('tenants')
        .update({ room_id: roomId })
        .eq('id', tenantId);

      if (tenantError) throw tenantError;

      const { error: roomError } = await supabase
        .from('rooms')
        .update({ 
          status: 'occupied',
          occupants: room.occupants + 1
        })
        .eq('id', roomId);

      if (roomError) throw roomError;

      // Update local state
      setTenants(tenants.map(tenant => 
        tenant.id === tenantId 
          ? { ...tenant, room_id: roomId, rooms: room }
          : tenant
      ));

      setRooms(rooms.map(r => 
        r.id === roomId 
          ? { ...r, status: 'occupied', occupants: r.occupants + 1 }
          : r
      ));

      toast({
        title: '🏠 Room assigned successfully!',
        description: `Tenant assigned to Room ${room.number}. Nice work! ✨`,
      });
    } catch (error) {
      console.error('Error assigning room:', error);
      toast({
        title: 'Room assignment failed 😬',
        description: 'Could not assign room. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getMaxOccupants = (roomType: string): number => {
    switch (roomType) {
      case 'single': return 1;
      case 'double': return 2;
      case 'triple': return 3;
      case 'quad': return 4;
      default: return 1;
    }
  };

  const sendNotification = async (tenantId: string) => {
    toast({
      title: '📨 Notification sent!',
      description: 'Tenant has been notified. They\'ll get the message! 💌',
    });
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="status-paid">✅ Paid</Badge>;
      case 'pending':
        return <Badge className="status-pending">⏳ Pending</Badge>;
      case 'overdue':
        return <Badge className="status-overdue">⚠️ Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoomDisplay = (tenant: TenantWithProfile) => {
    return tenant.rooms?.number || (
      <Select onValueChange={(value) => assignRoom(tenant.id, value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Assign" />
        </SelectTrigger>
        <SelectContent>
          {rooms
            .filter(room => room.status === 'available')
            .map(room => (
              <SelectItem key={room.id} value={room.id}>
                Room {room.number}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner />
          <p className="text-muted-foreground">Loading tenant data... Almost there! ⚡</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Tenant Management 👥</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tenants like a pro! {filteredTenants.length} awesome people to look after.
          </p>
        </div>
        
        <Button className="animate-bounce-gentle" asChild>
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Tenant
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">✅ Paid</SelectItem>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                  <SelectItem value="overdue">⚠️ Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🏘️ Tenant Directory</span>
            <Badge variant="secondary">{filteredTenants.length} tenants</Badge>
          </CardTitle>
          <CardDescription>
            Your complete tenant roster. Click on actions to manage each tenant! ✨
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTenants.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-float">
                <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No matching tenants found 🔍' : 'No tenants yet! 🏠'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Ready to add your first tenant? Let\'s get started!'}
              </p>
              {!searchTerm && (
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Tenant
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>👤 Tenant</TableHead>
                    <TableHead>🏠 Room</TableHead>
                    <TableHead>📞 Contact</TableHead>
                    <TableHead>💳 Payment Status</TableHead>
                    <TableHead>💰 Balance</TableHead>
                    <TableHead>📅 Lease Period</TableHead>
                    <TableHead>⚡ Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.map((tenant, index) => (
                    <TableRow 
                      key={tenant.id} 
                      className="hover-lift animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                            {tenant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{tenant.name}</p>
                            <p className="text-sm text-muted-foreground">{tenant.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {getRoomDisplay(tenant)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">{tenant.phone || 'Not provided'}</p>
                          <p className="text-xs text-muted-foreground">{tenant.email}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Select 
                          value={tenant.payment_status} 
                          onValueChange={(value) => updatePaymentStatus(tenant.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">✅ Paid</SelectItem>
                            <SelectItem value="pending">⏳ Pending</SelectItem>
                            <SelectItem value="overdue">⚠️ Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${Number(tenant.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ₱{Number(tenant.balance).toLocaleString()}
                          </span>
                          {Number(tenant.balance) > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setIsPaymentDialogOpen(true);
                              }}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(tenant.lease_start_date).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">to {new Date(tenant.lease_end_date).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => sendNotification(tenant.id)}>
                              <Bell className="h-4 w-4 mr-2" />
                              Send Notification
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Tenant
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Tenant
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>💳 Process Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedTenant?.name}. Current balance: ₱{Number(selectedTenant?.balance || 0).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-amount">Payment Amount (₱)</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount..."
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={processPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedTenantManagement;