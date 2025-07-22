
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/Spinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsSubmitting(true);
      const user = await login({ email, password });
      
      // Redirect to appropriate dashboard based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
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
            Tenant Management and Information System
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
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-tmis-secondary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input 
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-tmis-secondary hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
