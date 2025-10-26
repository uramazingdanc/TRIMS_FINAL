import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, User, CreditCard, MessageSquare, LogOut } from 'lucide-react';

export function ParentNavigation() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/parent/dashboard" className="font-bold text-xl">
              TRIMS - Parent
            </Link>
            <div className="hidden md:flex gap-4">
              <Link to="/parent/dashboard">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/parent/student-info">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Student Info
                </Button>
              </Link>
              <Link to="/parent/payments">
                <Button variant="ghost" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payments
                </Button>
              </Link>
              <Link to="/parent/messages">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
              </Link>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
