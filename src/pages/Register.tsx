import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/Spinner';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RoomsTable, TenantsTable } from '@/types/supabase';

interface Room {
  id: string;
  number: string;
  price_per_month: number;
  occupants: number;
  status: string;
}

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
  const [role, setRole] = useState<'admin' | 'tenant'>('tenant');
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
        confirmPassword: formData.confirmPassword,
        role: role
      });

      // Only create additional tenant data if the role is tenant and we need extra fields
      if (role === 'tenant' && (formData.address || formData.emergencyContact)) {
        try {
          // Find an available room
          const { data: availableRoom, error: roomError } = await supabase
            .from('rooms')
            .select('*')
            .eq('status', 'available')
            .limit(1)
            .single();
            
          if (roomError || !availableRoom) {
            toast({
              title: "No rooms available",
              description: "There are no available rooms at the moment. Please contact administration.",
              variant: "destructive"
            });
            return;
          }
          
          // Cast to correct type
          const roomData = availableRoom as RoomsTable;
          
          // Create tenant record
          const tenantData: Partial<TenantsTable> = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address || '(Not provided)',
            emergency_contact: formData.emergencyContact || '(Not provided)',
            lease_start_date: new Date().toISOString().split('T')[0],
            lease_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            room_id: roomData.id,
            payment_status: 'pending',
            balance: roomData.price_per_month || 0,
            user_id: user.id
          };
          
          const { error: tenantError } = await supabase
            .from('tenants')
            .insert({
              name: tenantData.name,
              email: tenantData.email,
              phone: tenantData.phone,
              address: tenantData.address,
              emergency_contact: tenantData.emergency_contact,
              lease_start_date: tenantData.lease_start_date,
              lease_end_date: tenantData.lease_end_date,
              room_id: tenantData.room_id,
              payment_status: tenantData.payment_status,
              balance: tenantData.balance,
              user_id: tenantData.user_id
            });
            
          if (tenantError) throw tenantError;
          
          // Update room status
          const updateRoomData = {
            status: 'occupied',
            occupants: (roomData.occupants || 0) + 1
          };
          
          await supabase
            .from('rooms')
            .update(updateRoomData)
            .eq('id', roomData.id);
          
          toast({
            title: "Tenant profile created",
            description: `Room ${roomData.number} has been assigned to you.`,
          });
        } catch (error) {
          console.error("Error creating tenant profile:", error);
          toast({
            title: "Error creating tenant profile",
            description: error instanceof Error ? error.message : "An unexpected error occurred",
            variant: "destructive"
          });
        }
      } else {
        // Admin registration - just show success message
        toast({
          title: "Admin account created",
          description: "Your admin account has been successfully created.",
        });
      }
      
      // Redirect to appropriate dashboard based on user role
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tmis-light to-white px-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-tmis-primary">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-3xl font-bold text-center text-tmis-primary">TMIS</CardTitle>
          <CardDescription className="text-center">
            Create a new account
          </CardDescription>
          <div className="mt-2 text-center">
            <Link to="/rules" className="text-xs text-tmis-secondary hover:underline">View Boarding House Rules and Regulations</Link>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Register as</Label>
              <RadioGroup value={role} onValueChange={(value: 'admin' | 'tenant') => setRole(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tenant" id="reg-tenant" />
                  <Label htmlFor="reg-tenant">Tenant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="reg-admin" />
                  <Label htmlFor="reg-admin">Admin</Label>
                </div>
              </RadioGroup>
            </div>

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
