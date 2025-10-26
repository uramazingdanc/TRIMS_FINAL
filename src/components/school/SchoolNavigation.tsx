import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Users, TrendingUp, BarChart, FileText, LogOut } from 'lucide-react';

export function SchoolNavigation() {
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
            <Link to="/school/dashboard" className="font-bold text-xl">
              TRIMS - School
            </Link>
            <div className="hidden md:flex gap-4">
              <Link to="/school/dashboard">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/school/students">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Students
                </Button>
              </Link>
              <Link to="/school/occupancy">
                <Button variant="ghost" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Occupancy
                </Button>
              </Link>
              <Link to="/school/reports">
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </Link>
              <Link to="/school/analytics">
                <Button variant="ghost" size="sm">
                  <BarChart className="h-4 w-4 mr-2" />
                  Analytics
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
