
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Menu, Bell, X, User } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const {
    user,
    logout
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  return <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-tmis-primary">TRIMS</span>
          </Link>
        </div>
        
        {/* Desktop Menu */}
        {user && <nav className="hidden md:flex items-center gap-6">
            {user.role === 'admin' ? <>
                <Link to="/admin/dashboard" className="text-sm font-medium hover:text-tmis-primary">
                  Dashboard
                </Link>
                <Link to="/admin/tenants" className="text-sm font-medium hover:text-tmis-primary">
                  Tenants
                </Link>
                <Link to="/admin/rooms" className="text-sm font-medium hover:text-tmis-primary">
                  Rooms
                </Link>
                <Link to="/admin/payments" className="text-sm font-medium hover:text-tmis-primary">
                  Payments
                </Link>
                <Link to="/admin/maintenance" className="text-sm font-medium hover:text-tmis-primary">
                  Maintenance
                </Link>
              </> : <>
                {/* Tenant navigation handled by TenantLayout */}
              </>}
          </nav>}
        
        <div className="flex items-center gap-2">
          {user ? <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-tmis-accent" />
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <div className="text-sm">
                      <p className="font-medium">Payment Reminder</p>
                      <p className="text-muted-foreground text-xs">Your rent is due in 5 days</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="text-sm">
                      <p className="font-medium">Maintenance Update</p>
                      <p className="text-muted-foreground text-xs">Your request has been processed</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={user.role === 'admin' ? '/admin/profile' : '/tenant/profile'} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile menu button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </> : <div className="flex gap-2">
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>}
        </div>
      </div>
      
      {/* Mobile menu */}
      {user && <div className={cn("fixed inset-0 top-16 z-50 bg-white md:hidden", mobileMenuOpen ? "block" : "hidden")}>
          <nav className="flex flex-col p-4 space-y-4">
            {user.role === 'admin' ? <>
                <Link to="/admin/dashboard" className="text-sm font-medium p-2 hover:bg-gray-100 rounded" onClick={toggleMobileMenu}>
                  Dashboard
                </Link>
                <Link to="/admin/tenants" className="text-sm font-medium p-2 hover:bg-gray-100 rounded" onClick={toggleMobileMenu}>
                  Tenants
                </Link>
                <Link to="/admin/rooms" className="text-sm font-medium p-2 hover:bg-gray-100 rounded" onClick={toggleMobileMenu}>
                  Rooms
                </Link>
                <Link to="/admin/payments" className="text-sm font-medium p-2 hover:bg-gray-100 rounded" onClick={toggleMobileMenu}>
                  Payments
                </Link>
                <Link to="/admin/maintenance" className="text-sm font-medium p-2 hover:bg-gray-100 rounded" onClick={toggleMobileMenu}>
                  Maintenance
                </Link>
              </> : <>
                <Link to="/tenant/dashboard" className="text-sm font-medium p-2 hover:bg-gray-100 rounded" onClick={toggleMobileMenu}>
                  Dashboard
                </Link>
                <Link to="/tenant/payments" className="text-sm font-medium p-2 hover:bg-gray-100 rounded" onClick={toggleMobileMenu}>
                  Payments
                </Link>
                <Link to="/tenant/maintenance" className="text-sm font-medium p-2 hover:bg-gray-100 rounded" onClick={toggleMobileMenu}>
                  Maintenance
                </Link>
                <Link to="/tenant/profile" className="text-sm font-medium p-2 hover:bg-gray-100 rounded" onClick={toggleMobileMenu}>
                  Profile
                </Link>
              </>}
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </Button>
          </nav>
        </div>}
    </header>;
}
