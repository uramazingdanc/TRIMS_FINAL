import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RoomsTable, TenantsTable } from '@/types/supabase';
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/Spinner';
import { 
  Search, 
  Plus, 
  Edit, 
  UserPlus, 
  Home, 
  Filter,
  MoreVertical,
  MapPin,
  Users,
  DollarSign,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2
} from 'lucide-react';

interface RoomWithTenants extends RoomsTable {
  tenants?: TenantsTable[];
  tenant_count?: number;
}

const AdminRoomManagement = () => {
  const [rooms, setRooms] = useState<RoomWithTenants[]>([]);
  const [tenants, setTenants] = useState<TenantsTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');
  
  // Dialog states
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false);
  const [isAssignTenantDialogOpen, setIsAssignTenantDialogOpen] = useState(false);
  
  // Form states
  const [selectedRoom, setSelectedRoom] = useState<RoomWithTenants | null>(null);
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    floor: '',
    type: 'single',
    price_per_month: '',
    description: '',
    max_occupants: 1
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchRoomsAndTenants();
  }, []);

  const fetchRoomsAndTenants = async () => {
    try {
      setLoading(true);
      
      // Fetch rooms with tenant count
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select(`
          *,
          tenants!room_id(*)
        `)
        .order('room_number', { ascending: true });

      if (roomsError) throw roomsError;

      // Process rooms to add tenant count
      const processedRooms = roomsData?.map(room => ({
        ...room,
        tenant_count: room.tenants?.length || 0
      })) || [];

      setRooms(processedRooms);

      // Fetch unassigned tenants
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .is('room_id', null)
        .order('name', { ascending: true });

      if (tenantsError) throw tenantsError;
      setTenants(tenantsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Oops! Something went wrong 😅',
        description: 'Could not load rooms data. Let\'s try that again!',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    try {
      const { error } = await supabase
        .from('rooms')
        .insert({
          room_number: roomForm.room_number,
          floor: roomForm.floor,
          type: roomForm.type,
          price_per_month: parseFloat(roomForm.price_per_month),
          description: roomForm.description,
          max_occupants: roomForm.max_occupants,
          status: 'available',
          number: roomForm.room_number // Keep compatibility with existing number field
        });

      if (error) throw error;

      setIsAddRoomDialogOpen(false);
      setRoomForm({
        room_number: '',
        floor: '',
        type: 'single',
        price_per_month: '',
        description: '',
        max_occupants: 1
      });

      toast({
        title: '🏠 Room added successfully!',
        description: `Room ${roomForm.room_number} is now available for assignment! ✨`,
      });

      fetchRoomsAndTenants();
    } catch (error) {
      console.error('Error adding room:', error);
      toast({
        title: 'Room creation failed 😕',
        description: 'Could not create the room. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditRoom = async () => {
    if (!selectedRoom) return;

    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          room_number: roomForm.room_number,
          floor: roomForm.floor,
          type: roomForm.type,
          price_per_month: parseFloat(roomForm.price_per_month),
          description: roomForm.description,
          max_occupants: roomForm.max_occupants,
          number: roomForm.room_number // Keep compatibility
        })
        .eq('id', selectedRoom.id);

      if (error) throw error;

      setIsEditRoomDialogOpen(false);
      setSelectedRoom(null);

      toast({
        title: '✅ Room updated successfully!',
        description: `Room ${roomForm.room_number} details have been updated! 🎉`,
      });

      fetchRoomsAndTenants();
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: 'Update failed 😕',
        description: 'Could not update the room. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignTenant = async (tenantId: string) => {
    if (!selectedRoom) return;

    try {
      const { error } = await supabase
        .from('tenants')
        .update({ room_id: selectedRoom.id })
        .eq('id', tenantId);

      if (error) throw error;

      setIsAssignTenantDialogOpen(false);
      setSelectedRoom(null);

      toast({
        title: '🎉 Tenant assigned successfully!',
        description: `Tenant has been assigned to Room ${selectedRoom.room_number}! Welcome aboard! ✨`,
      });

      fetchRoomsAndTenants();
    } catch (error) {
      console.error('Error assigning tenant:', error);
      toast({
        title: 'Assignment failed 😕',
        description: 'Could not assign tenant to room. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnassignTenant = async (tenantId: string) => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ room_id: null })
        .eq('id', tenantId);

      if (error) throw error;

      toast({
        title: '📤 Tenant unassigned',
        description: 'Tenant has been unassigned from their room.',
      });

      fetchRoomsAndTenants();
    } catch (error) {
      console.error('Error unassigning tenant:', error);
      toast({
        title: 'Unassignment failed 😕',
        description: 'Could not unassign tenant. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (room: RoomWithTenants) => {
    setSelectedRoom(room);
    setRoomForm({
      room_number: room.room_number || '',
      floor: room.floor || '',
      type: room.type || 'single',
      price_per_month: room.price_per_month?.toString() || '',
      description: room.description || '',
      max_occupants: room.max_occupants || 1
    });
    setIsEditRoomDialogOpen(true);
  };

  const openAssignDialog = (room: RoomWithTenants) => {
    setSelectedRoom(room);
    setIsAssignTenantDialogOpen(true);
  };

  const getStatusBadge = (room: RoomWithTenants) => {
    const isAtCapacity = (room.tenant_count || 0) >= (room.max_occupants || 1);
    
    if (room.status === 'maintenance') {
      return <Badge className="bg-orange-100 text-orange-800">🔧 Maintenance</Badge>;
    }
    if (isAtCapacity) {
      return <Badge className="bg-red-100 text-red-800">🔴 Full</Badge>;
    }
    if ((room.tenant_count || 0) > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">🟡 Partial</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">🟢 Available</Badge>;
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesFloor = filterFloor === 'all' || room.floor === filterFloor;
    
    return matchesSearch && matchesStatus && matchesFloor;
  });

  const floors = [...new Set(rooms.map(room => room.floor).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner />
          <p className="text-muted-foreground">Loading rooms... Almost there! ⚡</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Room Management 🏠</h1>
          <p className="text-muted-foreground mt-2">
            Manage your boarding house rooms like a pro! {rooms.length} rooms to oversee.
          </p>
        </div>
        
        <Button 
          className="animate-bounce-gentle"
          onClick={() => setIsAddRoomDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Room
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass-card hover-lift animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                <h3 className="text-3xl font-bold">{rooms.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full animate-float">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <h3 className="text-3xl font-bold text-green-600">
                  {rooms.filter(r => r.status === 'available' && (r.tenant_count || 0) === 0).length}
                </h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full animate-float" style={{ animationDelay: '1s' }}>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                <h3 className="text-3xl font-bold text-blue-600">
                  {rooms.filter(r => (r.tenant_count || 0) > 0).length}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full animate-float" style={{ animationDelay: '2s' }}>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue Potential</p>
                <h3 className="text-3xl font-bold text-green-600">
                  ₱{rooms.reduce((sum, r) => sum + (r.price_per_month || 0), 0).toLocaleString()}
                </h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full animate-float" style={{ animationDelay: '3s' }}>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms by number or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-background border z-50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">🟢 Available</SelectItem>
                  <SelectItem value="occupied">🔴 Occupied</SelectItem>
                  <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterFloor} onValueChange={setFilterFloor}>
                <SelectTrigger className="w-32 bg-background border z-50">
                  <SelectValue placeholder="Floor" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Floors</SelectItem>
                  {floors.map(floor => (
                    <SelectItem key={floor} value={floor}>Floor {floor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🏘️ Room Directory</span>
            <Badge variant="secondary">{filteredRooms.length} rooms</Badge>
          </CardTitle>
          <CardDescription>
            Manage your boarding house rooms and tenant assignments! ✨
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-float">
                <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No matching rooms found 🔍' : 'No rooms yet! 🏗️'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Ready to add your first room? Let\'s get started!'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddRoomDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Room
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>🏠 Room</TableHead>
                    <TableHead>📊 Status</TableHead>
                    <TableHead>👥 Occupancy</TableHead>
                    <TableHead>💰 Rent</TableHead>
                    <TableHead>📝 Details</TableHead>
                    <TableHead>⚡ Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room, index) => (
                    <TableRow 
                      key={room.id} 
                      className="hover-lift animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold">
                            {room.room_number?.charAt(0) || 'R'}
                          </div>
                          <div>
                            <p className="font-medium">{room.room_number}</p>
                            <p className="text-sm text-muted-foreground">
                              Floor {room.floor} • {room.type}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(room)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{room.tenant_count || 0}/{room.max_occupants || 1}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-semibold">₱{room.price_per_month?.toLocaleString()}</span>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </TableCell>
                      
                      <TableCell>
                        <p className="text-sm">{room.description || 'No description'}</p>
                      </TableCell>
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border z-50">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(room)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Room
                            </DropdownMenuItem>
                            {(room.tenant_count || 0) < (room.max_occupants || 1) && tenants.length > 0 && (
                              <DropdownMenuItem onClick={() => openAssignDialog(room)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Assign Tenant
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Room
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

      {/* Add Room Dialog */}
      <Dialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>🏠 Add New Room</DialogTitle>
            <DialogDescription>
              Create a new room for your boarding house. Make it welcoming! ✨
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="room-number">Room Number *</Label>
                <Input
                  id="room-number"
                  value={roomForm.room_number}
                  onChange={(e) => setRoomForm({...roomForm, room_number: e.target.value})}
                  placeholder="e.g., 1A, 2B"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({...roomForm, floor: e.target.value})}
                  placeholder="e.g., 1, 2"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Room Type</Label>
                <Select 
                  value={roomForm.type} 
                  onValueChange={(value) => setRoomForm({...roomForm, type: value})}
                >
                  <SelectTrigger className="mt-1 bg-background border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="triple">Triple</SelectItem>
                    <SelectItem value="quad">Quad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="max-occupants">Max Occupants</Label>
                <Input
                  id="max-occupants"
                  type="number"
                  value={roomForm.max_occupants}
                  onChange={(e) => setRoomForm({...roomForm, max_occupants: parseInt(e.target.value) || 1})}
                  min="1"
                  max="4"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="rent">Monthly Rent (₱)</Label>
              <Input
                id="rent"
                type="number"
                value={roomForm.price_per_month}
                onChange={(e) => setRoomForm({...roomForm, price_per_month: e.target.value})}
                placeholder="e.g., 8000"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={roomForm.description}
                onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                placeholder="Describe the room features..."
                className="mt-1 h-20 resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddRoom}
              disabled={!roomForm.room_number || !roomForm.price_per_month}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditRoomDialogOpen} onOpenChange={setIsEditRoomDialogOpen}>
        <DialogContent className="glass-card max-w-md">
          <DialogHeader>
            <DialogTitle>✏️ Edit Room</DialogTitle>
            <DialogDescription>
              Update room details and make it even better! 🌟
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-room-number">Room Number *</Label>
                <Input
                  id="edit-room-number"
                  value={roomForm.room_number}
                  onChange={(e) => setRoomForm({...roomForm, room_number: e.target.value})}
                  placeholder="e.g., 1A, 2B"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-floor">Floor</Label>
                <Input
                  id="edit-floor"
                  value={roomForm.floor}
                  onChange={(e) => setRoomForm({...roomForm, floor: e.target.value})}
                  placeholder="e.g., 1, 2"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Room Type</Label>
                <Select 
                  value={roomForm.type} 
                  onValueChange={(value) => setRoomForm({...roomForm, type: value})}
                >
                  <SelectTrigger className="mt-1 bg-background border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="triple">Triple</SelectItem>
                    <SelectItem value="quad">Quad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-max-occupants">Max Occupants</Label>
                <Input
                  id="edit-max-occupants"
                  type="number"
                  value={roomForm.max_occupants}
                  onChange={(e) => setRoomForm({...roomForm, max_occupants: parseInt(e.target.value) || 1})}
                  min="1"
                  max="4"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-rent">Monthly Rent (₱)</Label>
              <Input
                id="edit-rent"
                type="number"
                value={roomForm.price_per_month}
                onChange={(e) => setRoomForm({...roomForm, price_per_month: e.target.value})}
                placeholder="e.g., 8000"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={roomForm.description}
                onChange={(e) => setRoomForm({...roomForm, description: e.target.value})}
                placeholder="Describe the room features..."
                className="mt-1 h-20 resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditRoom}
              disabled={!roomForm.room_number || !roomForm.price_per_month}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Update Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tenant Dialog */}
      <Dialog open={isAssignTenantDialogOpen} onOpenChange={setIsAssignTenantDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>👥 Assign Tenant</DialogTitle>
            <DialogDescription>
              Choose a tenant to assign to Room {selectedRoom?.room_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {tenants.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No unassigned tenants available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">{tenant.email}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignTenant(tenant.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignTenantDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoomManagement;