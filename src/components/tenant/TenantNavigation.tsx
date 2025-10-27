
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wrench, 
  User,
  FileText
} from 'lucide-react';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/tenant/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Apply for Room',
    path: '/tenant/apply-room',
    icon: FileText
  },
  {
    name: 'Payments',
    path: '/tenant/payments',
    icon: CreditCard
  },
  {
    name: 'Maintenance',
    path: '/tenant/maintenance',
    icon: Wrench
  },
  {
    name: 'Profile',
    path: '/tenant/profile',
    icon: User
  }
];

export function TenantNavigation() {
  const location = useLocation();
  
  return (
    <div className="w-full bg-white border-b animate-fade-in">
      <nav className="container mx-auto px-4">
        <ul className="flex space-x-2 md:space-x-8">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center py-4 px-2 border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-tmis-primary text-tmis-primary font-medium' 
                      : 'border-transparent hover:text-tmis-primary hover:border-gray-300'
                  }`}
                >
                  <item.icon className={`h-4 w-4 mr-2 ${isActive ? 'text-tmis-primary' : ''}`} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
