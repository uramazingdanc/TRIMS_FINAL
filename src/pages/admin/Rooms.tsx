
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RoomsTable } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
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
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/Spinner';
import { Link } from 'react-router-dom';

const RoomsPage = () => {
  const [roomsList, setRoomsList] = useState<RoomsTable[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('number', { ascending: true });

      if (error) throw error;
      setRoomsList(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch rooms.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredRooms = roomsList.filter(room => 
    room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-tmis-dark">Rooms</h1>
          <p className="text-muted-foreground">Manage your room inventory</p>
        </div>
        <Button className="bg-tmis-primary hover:bg-tmis-primary/90" asChild>
          <Link to="/admin/room-manager">
            <Plus className="mr-2 h-4 w-4" />
            Manage Rooms
          </Link>
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
                <TableHead>Capacity</TableHead>
                <TableHead>Occupants</TableHead>
                <TableHead>Price/Month</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.number}</TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell className="capitalize">{room.type}</TableCell>
                    <TableCell>
                      {room.type === 'single' ? 1 : room.type === 'double' ? 2 : 3}
                    </TableCell>
                    <TableCell>{room.occupants}</TableCell>
                    <TableCell>₱{room.price_per_month.toLocaleString()}</TableCell>
                    <TableCell>{getRoomStatusBadge(room.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
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
    </div>
  );
};

export default RoomsPage;
