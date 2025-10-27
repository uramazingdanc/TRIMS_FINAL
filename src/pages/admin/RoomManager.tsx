
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RoomsTable, RoomAmenitiesTable } from '@/types/supabase';
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
import { Spinner } from '@/components/Spinner';
import { Search, Plus, Edit, Trash, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RoomManager = () => {
  const [rooms, setRooms] = useState<RoomsTable[]>([]);
  const [amenities, setAmenities] = useState<Record<string, RoomAmenitiesTable[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<RoomsTable>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  // Form fields for the new room dialog
  const [formData, setFormData] = useState({
    number: '',
    floor: '',
    type: 'single',
    price_per_month: 0,
    status: 'available',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data: roomsData, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number', { ascending: true });

      if (error) throw error;
      
      // Cast to proper type
      const typedRooms = roomsData as RoomsTable[];
      setRooms(typedRooms);
      
      // Fetch amenities for each room
      await fetchRoomAmenities(typedRooms);
      
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch rooms. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomAmenities = async (roomsList: RoomsTable[]) => {
    try {
      const amenitiesMap: Record<string, RoomAmenitiesTable[]> = {};
      
      for (const room of roomsList) {
        const { data: amenitiesData, error } = await supabase
          .from('room_amenities')
          .select('*')
          .eq('room_id', room.id);
          
        if (!error && amenitiesData) {
          amenitiesMap[room.id] = amenitiesData as RoomAmenitiesTable[];
        }
      }
      
      setAmenities(amenitiesMap);
    } catch (error) {
      console.error('Error fetching amenities:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredRooms = rooms.filter(room => 
    room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.floor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Basic validation
    let errors = { ...formErrors };
    if (name === 'price_per_month') {
      const price = Number(value);
      if (isNaN(price) || price <= 0) {
        errors[name] = 'Please enter a valid price';
      } else {
        delete errors[name];
      }
    } else if (name === 'number' && value.trim() === '') {
      errors[name] = 'Room number is required';
    } else {
      delete errors[name];
    }
    
    setFormErrors(errors);
    setFormData({ ...formData, [name]: name === 'price_per_month' ? Number(value) : value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddRoom = async () => {
    // Validate form
    let hasError = false;
    const errors: Record<string, string> = {};
    
    if (!formData.number.trim()) {
      errors.number = 'Room number is required';
      hasError = true;
    }
    
    if (!formData.floor.trim()) {
      errors.floor = 'Floor is required';
      hasError = true;
    }
    
    if (formData.price_per_month <= 0) {
      errors.price_per_month = 'Price must be greater than zero';
      hasError = true;
    }
    
    if (hasError) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Check if room number already exists in edit mode
      if (!isEditMode) {
        const { data: existingRoom } = await supabase
          .from('rooms')
          .select('id')
          .eq('room_number', formData.number)
          .maybeSingle();
          
        if (existingRoom) {
          setFormErrors({ number: 'Room with this number already exists' });
          return;
        }
      }
      
      if (isEditMode && currentRoom.id) {
        // Update existing room
        const { error } = await supabase
          .from('rooms')
          .update({
            room_number: formData.number,
            floor: formData.floor,
            type: formData.type as any,
            price_per_month: formData.price_per_month,
            status: formData.status as any
          })
          .eq('id', currentRoom.id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `Room ${formData.number} has been updated.`,
        });
      } else {
        // Add new room
        const { error } = await supabase
          .from('rooms')
          .insert({
            room_number: formData.number,
            floor: formData.floor,
            type: formData.type as any,
            price_per_month: formData.price_per_month,
            status: formData.status as any,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: `Room ${formData.number} has been added.`,
        });
      }
      
      // Reset form and close dialog
      setFormData({
        number: '',
        floor: '',
        type: 'single',
        price_per_month: 0,
        status: 'available',
      });
      setFormErrors({});
      setIsDialogOpen(false);
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      toast({
        title: 'Error',
        description: 'Could not save room. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditRoom = (room: RoomsTable) => {
    setCurrentRoom(room);
    setFormData({
      number: room.room_number,
      floor: room.floor,
      type: room.type,
      price_per_month: room.price_per_month,
      status: room.status,
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteRoom = async (room: RoomsTable) => {
    if (!confirm(`Are you sure you want to delete room ${room.room_number}?`)) {
      return;
    }
    
    try {
      // First check if room is occupied
      if (room.status === 'occupied') {
        toast({
          title: 'Cannot Delete',
          description: 'Room is currently occupied. Please relocate tenants first.',
          variant: 'destructive',
        });
        return;
      }
      
      // Delete room amenities first
      await supabase
        .from('room_amenities')
        .delete()
        .eq('room_id', room.id);
      
      // Then delete the room
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', room.id);
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Room ${room.room_number} has been deleted.`,
      });
      
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: 'Could not delete room. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openAddDialog = () => {
    setIsEditMode(false);
    setCurrentRoom({});
    setFormData({
      number: '',
      floor: '',
      type: 'single',
      price_per_month: 0,
      status: 'available',
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const getRoomStatusBadge = (status: string) => {
    switch (status) {
      case 'occupied':
        return <Badge>Occupied</Badge>;
      case 'available':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Available</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-tmis-dark">Room Manager</h1>
          <p className="text-muted-foreground">Add, edit and manage your room inventory</p>
        </div>
        <Button className="bg-tmis-primary hover:bg-tmis-primary/90" onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Room
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Room Directory</CardTitle>
              <CardDescription>
                List of all rooms in the boarding house
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
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
              <TableCaption>A list of all your rooms.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Floor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Occupants</TableHead>
                  <TableHead>Price/Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amenities</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.room_number}</TableCell>
                      <TableCell>{room.floor}</TableCell>
                      <TableCell className="capitalize">{room.type}</TableCell>
                      <TableCell>{room.max_occupants}</TableCell>
                      <TableCell>₱{room.price_per_month.toLocaleString()}</TableCell>
                      <TableCell>{getRoomStatusBadge(room.status)}</TableCell>
                      <TableCell>
                        {amenities[room.id]?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {amenities[room.id].map((amenity) => (
                              <Badge key={amenity.id} variant="outline" className="text-xs">
                                {amenity.amenity}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No amenities</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditRoom(room)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteRoom(room)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                      No rooms found. {searchTerm && 'Try a different search term.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Room Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the room details below.' : 'Enter the details for the new room.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="number" className="text-right">
                Room Number
              </Label>
              <div className="col-span-3">
                <Input
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className={formErrors.number ? "border-red-500" : ""}
                  placeholder="e.g. A101"
                />
                {formErrors.number && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.number}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="floor" className="text-right">
                Floor
              </Label>
              <div className="col-span-3">
                <Input
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  className={formErrors.floor ? "border-red-500" : ""}
                  placeholder="e.g. 1st Floor"
                />
                {formErrors.floor && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.floor}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Room Type
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange('type', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="triple">Triple</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price_per_month" className="text-right">
                Price/Month
              </Label>
              <div className="col-span-3">
                <Input
                  id="price_per_month"
                  name="price_per_month"
                  type="number"
                  value={formData.price_per_month.toString()}
                  onChange={handleInputChange}
                  className={formErrors.price_per_month ? "border-red-500" : ""}
                  placeholder="e.g. 5000"
                />
                {formErrors.price_per_month && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.price_per_month}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddRoom}>
              <Check className="mr-2 h-4 w-4" />
              {isEditMode ? 'Update Room' : 'Add Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManager;
