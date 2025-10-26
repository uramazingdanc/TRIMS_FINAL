import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Wrench, ClipboardList, Building2, BarChart, LogOut } from 'lucide-react';

export function StaffNavigation() {
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
            <Link to="/staff/dashboard" className="font-bold text-xl">
              TRIMS - Staff
            </Link>
            <div className="hidden md:flex gap-4">
              <Link to="/staff/dashboard">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/staff/maintenance">
                <Button variant="ghost" size="sm">
                  <Wrench className="h-4 w-4 mr-2" />
                  Maintenance
                </Button>
              </Link>
              <Link to="/staff/work-orders">
                <Button variant="ghost" size="sm">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Work Orders
                </Button>
              </Link>
              <Link to="/staff/facilities">
                <Button variant="ghost" size="sm">
                  <Building2 className="h-4 w-4 mr-2" />
                  Facilities
                </Button>
              </Link>
              <Link to="/staff/reports">
                <Button variant="ghost" size="sm">
                  <BarChart className="h-4 w-4 mr-2" />
                  Reports
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
