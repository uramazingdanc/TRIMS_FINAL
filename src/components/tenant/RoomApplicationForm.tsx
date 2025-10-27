import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RoomsTable } from '@/types/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { 
  Home, 
  Users, 
  DollarSign, 
  Check,
  Building
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const RoomApplicationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<RoomsTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<RoomsTable | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasTenant, setHasTenant] = useState(false);

  useEffect(() => {
    if (user) {
      checkExistingTenant();
      fetchAvailableRooms();
    }
  }, [user]);

  const checkExistingTenant = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('tenants')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setHasTenant(!!data);
    } catch (error) {
      console.error('Error checking tenant status:', error);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'available')
        .order('room_number', { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Could not load available rooms.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (room: RoomsTable) => {
    setSelectedRoom(room);
    setIsDialogOpen(true);
  };

  const submitApplication = async () => {
    if (!user || !selectedRoom) return;

    try {
      // Create tenant record
      const { error } = await supabase
        .from('tenants')
        .insert({
          user_id: user.id,
          name: user.name,
          email: user.email,
          room_id: selectedRoom.id,
          payment_status: 'pending',
          balance: 0,
        });

      if (error) throw error;

      toast({
        title: 'Application Submitted! 🎉',
        description: `Your application for Room ${selectedRoom.room_number} has been submitted. An admin will review it soon.`,
      });

      setIsDialogOpen(false);
      setHasTenant(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: 'Could not submit your application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (hasTenant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Room Application</CardTitle>
          <CardDescription>You already have a room assigned or an application pending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Application Already Submitted</p>
            <p className="text-muted-foreground mt-2">
              Please check your dashboard for your room assignment status.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Apply for a Room</CardTitle>
            <CardDescription>Browse available rooms and submit your application</CardDescription>
          </CardHeader>
        </Card>

        {rooms.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No Rooms Available</p>
                <p className="text-muted-foreground mt-2">
                  There are currently no rooms available. Please check back later.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Room {room.room_number}</CardTitle>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      Available
                    </Badge>
                  </div>
                  <CardDescription>Floor: {room.floor}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Home className="h-4 w-4" />
                        <span>Type</span>
                      </div>
                      <span className="font-medium capitalize">{room.type}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Capacity</span>
                      </div>
                      <span className="font-medium">{room.max_occupants} {room.max_occupants === 1 ? 'person' : 'people'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Monthly Rent</span>
                      </div>
                      <span className="font-bold text-lg">₱{room.price_per_month.toLocaleString()}</span>
                    </div>
                  </div>

                  {room.description && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">{room.description}</p>
                    </div>
                  )}

                  <Button 
                    className="w-full mt-4"
                    onClick={() => handleApply(room)}
                  >
                    Apply for This Room
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Room Application</DialogTitle>
            <DialogDescription>
              You are about to apply for Room {selectedRoom?.room_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room Number:</span>
                <span className="font-medium">{selectedRoom?.room_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{selectedRoom?.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Rent:</span>
                <span className="font-medium">₱{selectedRoom?.price_per_month.toLocaleString()}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              By submitting this application, you acknowledge that you have reviewed the room details 
              and agree to the rental terms. An administrator will review your application shortly.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitApplication}>
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoomApplicationForm;
