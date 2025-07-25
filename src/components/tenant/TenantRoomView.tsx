import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RoomsTable } from '@/types/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Spinner } from '@/components/Spinner';
import { 
  Search, 
  Home, 
  Users, 
  DollarSign, 
  MapPin,
  Building,
  Eye,
  Filter,
  Heart,
  Star,
  Wifi,
  Car,
  Coffee,
  Bath,
  Bed
} from 'lucide-react';

interface RoomWithDetails extends RoomsTable {
  isAssigned?: boolean;
  isMyRoom?: boolean;
}

const TenantRoomView = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<RoomWithDetails[]>([]);
  const [myRoom, setMyRoom] = useState<RoomWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriceRange, setFilterPriceRange] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchRoomsData();
    }
  }, [user]);

  const fetchRoomsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First, get tenant's assigned room
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          room_id,
          rooms(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (tenantError && tenantError.code !== 'PGRST116') throw tenantError;

      // Get all available rooms (for browsing)
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (roomsError) throw roomsError;

      // Process rooms data
      const processedRooms = roomsData?.map(room => ({
        ...room,
        isAssigned: tenantData?.room_id === room.id,
        isMyRoom: tenantData?.room_id === room.id
      })) || [];

      setRooms(processedRooms);
      
      // Set assigned room if exists
      if (tenantData?.rooms) {
        setMyRoom({
          ...tenantData.rooms as RoomsTable,
          isMyRoom: true,
          isAssigned: true
        });
      }

    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Oops! Something went wrong 😅',
        description: 'Could not load rooms data. Let\'s try that again!',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoomFeatures = (room: RoomWithDetails) => {
    const features = [];
    
    switch (room.type) {
      case 'single':
        features.push({ icon: Bed, label: 'Single Bed' });
        break;
      case 'double':
        features.push({ icon: Bed, label: 'Double Occupancy' });
        break;
      case 'triple':
        features.push({ icon: Users, label: 'Triple Share' });
        break;
      case 'quad':
        features.push({ icon: Users, label: 'Quad Share' });
        break;
    }
    
    // Add common features based on price range (mock logic)
    if ((room.price_per_month || 0) > 10000) {
      features.push({ icon: Wifi, label: 'Free WiFi' });
      features.push({ icon: Car, label: 'Parking' });
    }
    if ((room.price_per_month || 0) > 8000) {
      features.push({ icon: Bath, label: 'Private Bath' });
    } else {
      features.push({ icon: Bath, label: 'Shared Bath' });
    }
    
    return features;
  };

  const getStatusBadge = (room: RoomWithDetails) => {
    if (room.isMyRoom) {
      return <Badge className="bg-blue-100 text-blue-800">🏠 Your Room</Badge>;
    }
    if (room.status === 'available') {
      return <Badge className="bg-green-100 text-green-800">✅ Available</Badge>;
    }
    if (room.status === 'occupied') {
      return <Badge className="bg-red-100 text-red-800">🔴 Occupied</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-800">🔧 Maintenance</Badge>;
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || room.type === filterType;
    
    let matchesPrice = true;
    if (filterPriceRange !== 'all') {
      const price = room.price_per_month || 0;
      switch (filterPriceRange) {
        case 'budget':
          matchesPrice = price < 8000;
          break;
        case 'mid':
          matchesPrice = price >= 8000 && price < 12000;
          break;
        case 'premium':
          matchesPrice = price >= 12000;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesPrice;
  });

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
      <div>
        <h1 className="text-4xl font-bold gradient-text">Room Explorer 🏠</h1>
        <p className="text-muted-foreground mt-2">
          {myRoom 
            ? `Your cozy space: Room ${myRoom.room_number}! Check out other available options below.`
            : 'Discover available rooms in our boarding house! Find your perfect space.'}
        </p>
      </div>

      {/* My Room Section (if assigned) */}
      {myRoom && (
        <Card className="glass-card border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              🏠 Your Current Room
              <Badge className="ml-2 bg-blue-100 text-blue-800">Assigned</Badge>
            </CardTitle>
            <CardDescription>
              Your personal space in our boarding house! 🌟
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Room Number</span>
                  <span className="font-bold text-2xl text-blue-600">{myRoom.room_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Floor</span>
                  <span className="font-medium">Floor {myRoom.floor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Room Type</span>
                  <span className="font-medium capitalize">{myRoom.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="font-bold text-green-600">₱{myRoom.price_per_month?.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Room Features:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {getRoomFeatures(myRoom).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <feature.icon className="h-4 w-4 text-blue-600" />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
                {myRoom.description && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">About Your Room:</h4>
                    <p className="text-sm text-muted-foreground">{myRoom.description}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filter */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms by number, type, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 bg-background border">
                  <SelectValue placeholder="Room type" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">🛏️ Single</SelectItem>
                  <SelectItem value="double">👥 Double</SelectItem>
                  <SelectItem value="triple">👨‍👩‍👧 Triple</SelectItem>
                  <SelectItem value="quad">👨‍👩‍👧‍👦 Quad</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriceRange} onValueChange={setFilterPriceRange}>
                <SelectTrigger className="w-40 bg-background border">
                  <SelectValue placeholder="Price range" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="budget">💰 Budget (under ₱8k)</SelectItem>
                  <SelectItem value="mid">💳 Mid (₱8k-12k)</SelectItem>
                  <SelectItem value="premium">⭐ Premium (over ₱12k)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rooms Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {myRoom ? '🔍 Explore Other Rooms' : '🏠 Available Rooms'}
          </h2>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {filteredRooms.length} rooms
          </Badge>
        </div>

        {filteredRooms.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <div className="animate-float">
                <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No matching rooms found 🔍' : 'No rooms available right now 🏠'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Check back later for new room availability!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room, index) => (
              <Card 
                key={room.id} 
                className={`glass-card hover-lift animate-fade-in ${
                  room.isMyRoom ? 'border-blue-200 bg-blue-50/50' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2 text-primary" />
                      Room {room.room_number}
                    </CardTitle>
                    {getStatusBadge(room)}
                  </div>
                  <CardDescription>
                    Floor {room.floor} • {room.type} room
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Monthly Rent</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₱{room.price_per_month?.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Features:</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {getRoomFeatures(room).slice(0, 4).map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-1 text-xs">
                          <feature.icon className="h-3 w-3 text-primary" />
                          <span>{feature.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {room.description && (
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {room.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    {room.isMyRoom ? (
                      <Button className="w-full" variant="outline" disabled>
                        <Home className="h-4 w-4 mr-2" />
                        This is Your Room
                      </Button>
                    ) : room.status === 'available' ? (
                      <Button className="w-full" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        <Users className="h-4 w-4 mr-2" />
                        {room.status === 'occupied' ? 'Currently Occupied' : 'Under Maintenance'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Room Request Info */}
      {!myRoom && (
        <Card className="glass-card border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800 mb-2">
                  💡 Want to Request a Room?
                </h3>
                <p className="text-orange-700 text-sm mb-4">
                  Found a room you like? Contact the admin to request assignment! They'll help you with the process and answer any questions you have.
                </p>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <Heart className="h-4 w-4 mr-2" />
                  Contact Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantRoomView;