import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/Spinner';
import { v4 as uuidv4 } from 'uuid';
import { tenants, rooms, addDataItem, updateDataItem } from '@/services/mockData';
import { Tenant } from '@/types/tenant';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    emergencyContact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.phone) {
      setError('Phone number is required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setIsSubmitting(true);
      // Register the user - this will now use Supabase
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      if (!user || !user.id) {
        throw new Error('User registration failed. No user ID returned.');
      }
      
      // Create tenant profile in Supabase
      try {
        // Find an available room
        const { data: availableRoom } = await supabase
          .from('rooms')
          .select('*')
          .eq('status', 'available')
          .limit(1)
          .single();
          
        if (!availableRoom) {
          toast({
            title: "No rooms available",
            description: "There are no available rooms at the moment. Please contact administration.",
            variant: "destructive"
          });
          return;
        }
        
        // Create tenant record
        const { data: tenant, error } = await supabase
          .from('tenants')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address || '(Not provided)',
            emergency_contact: formData.emergencyContact || '(Not provided)',
            lease_start_date: new Date().toISOString().split('T')[0],
            lease_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            room_id: availableRoom.id,
            status: 'active',
            payment_status: 'pending',
            balance: availableRoom.price_per_month || 0,
            user_id: user.id
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update room status
        await supabase
          .from('rooms')
          .update({
            status: 'occupied',
            occupants: availableRoom.occupants + 1
          })
          .eq('id', availableRoom.id);
        
        toast({
          title: "Tenant profile created",
          description: `Room ${availableRoom.number} has been assigned to you.`,
        });
      } catch (error) {
        console.error("Error creating tenant profile:", error);
        toast({
          title: "Error creating tenant profile",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive"
        });
      }
      
      // Redirect to tenant dashboard
      navigate('/tenant/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tmis-light to-white px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-tmis-primary">TMIS</CardTitle>
          <CardDescription className="text-center">
            Create a new tenant account
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone"
                name="phone"
                type="tel"
                placeholder="09123456789"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Home Address</Label>
              <Input 
                id="address"
                name="address"
                placeholder="123 Main St, City"
                value={formData.address}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input 
                id="emergencyContact"
                name="emergencyContact"
                placeholder="Contact Name & Number"
                value={formData.emergencyContact}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-tmis-primary hover:bg-tmis-primary/90" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-tmis-secondary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
