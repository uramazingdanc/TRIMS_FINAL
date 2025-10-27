import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Building2,
  Users,
  DollarSign,
  Wrench,
  ArrowRight,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Home,
  Settings,
  Bell,
  Search,
  Filter,
  MoreVertical,
  UserPlus,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { TenantsTable, RoomsTable, PaymentsTable, MaintenanceRequestsTable } from '@/types/supabase';

interface DashboardStats {
  totalTenants: number;
  occupiedUnits: number;
  vacantUnits: number;
  totalRevenue: number;
  pendingPayments: number;
  maintenanceRequests: number;
  upcomingMoveOuts: number;
  occupancyRate: number;
}

interface ActivityItem {
  id: string;
  type: 'payment' | 'tenant' | 'maintenance' | 'system';
  message: string;
  time: string;
  icon: string;
  status?: string;
}

interface ToDoItem {
  id: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  dueDate?: string;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    maintenanceRequests: 0,
    upcomingMoveOuts: 0,
    occupancyRate: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [todos, setTodos] = useState<ToDoItem[]>([
    { id: '1', task: 'Approve new lease (Tenant: Anna M.)', priority: 'high', completed: false, dueDate: '2025-01-30' },
    { id: '2', task: 'Follow up maintenance (Unit 3C)', priority: 'medium', completed: false },
    { id: '3', task: 'Export billing for January', priority: 'low', completed: false }
  ]);
  
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data concurrently
      const [tenantsRes, roomsRes, paymentsRes, maintenanceRes] = await Promise.all([
        supabase.from('tenants').select('*'),
        supabase.from('rooms').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('maintenance_requests').select('*')
      ]);

      const tenants = tenantsRes.data || [];
      const rooms = roomsRes.data || [];
      const payments = paymentsRes.data || [];
      const maintenance = maintenanceRes.data || [];

      // Calculate stats
      const occupiedUnits = rooms.filter(room => room.status === 'occupied').length;
      const vacantUnits = rooms.filter(room => room.status === 'available').length;
      const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const pendingPayments = tenants.filter(t => t.payment_status === 'pending').length;
      const maintenanceRequests = maintenance.filter(m => m.status === 'pending').length;
      const occupancyRate = rooms.length > 0 ? (occupiedUnits / rooms.length) * 100 : 0;

      setStats({
        totalTenants: tenants.length,
        occupiedUnits,
        vacantUnits,
        totalRevenue,
        pendingPayments,
        maintenanceRequests,
        upcomingMoveOuts: 2, // Mock data
        occupancyRate
      });

      // Set chart data
      setOccupancyData([
        { name: 'Occupied', value: occupiedUnits, color: '#10B981' },
        { name: 'Vacant', value: vacantUnits, color: '#F59E0B' },
        { name: 'Maintenance', value: rooms.filter(r => r.status === 'maintenance').length, color: '#EF4444' }
      ]);

      // Mock revenue data for chart
      setRevenueData([
        { month: 'Aug', amount: 85000 },
        { month: 'Sep', amount: 92000 },
        { month: 'Oct', amount: 88000 },
        { month: 'Nov', amount: 96000 },
        { month: 'Dec', amount: 94000 },
        { month: 'Jan', amount: totalRevenue }
      ]);

      // Generate recent activities
      const activities: ActivityItem[] = [
        {
          id: '1',
          type: 'payment',
          message: '💰 Payment received from John Doe - ₱12,000',
          time: '2 mins ago',
          icon: '💰',
          status: 'completed'
        },
        {
          id: '2',
          type: 'tenant',
          message: '🆕 New tenant registered - Sarah Wilson',
          time: '1 hour ago',
          icon: '🆕'
        },
        {
          id: '3',
          type: 'maintenance',
          message: '🔧 Plumbing issue resolved in Unit 2A',
          time: '3 hours ago',
          icon: '✅',
          status: 'completed'
        },
        {
          id: '4',
          type: 'system',
          message: '📋 Monthly report generated successfully',
          time: '1 day ago',
          icon: '📋'
        }
      ];
      
      setRecentActivities(activities);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Just a sec, we're setting things up for you ☕</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Admin Dashboard 🏠</h1>
          <p className="text-muted-foreground mt-2">Hey there! Here's what's happening in your boarding house today.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search anything..." className="pl-10 w-64" />
          </div>
          <Button size="sm" className="animate-bounce-gentle">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card hover-lift animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
                <h3 className="text-3xl font-bold">{stats.totalTenants}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+2 this month</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full animate-float">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupied Units</p>
                <h3 className="text-3xl font-bold">{stats.occupiedUnits}</h3>
                <div className="mt-2">
                  <Progress value={stats.occupancyRate} className="h-2" />
                  <span className="text-sm text-muted-foreground">{stats.occupancyRate.toFixed(1)}% occupancy</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full animate-float" style={{ animationDelay: '1s' }}>
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <h3 className="text-3xl font-bold">₱{stats.totalRevenue.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+8.2% vs last month</span>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full animate-float" style={{ animationDelay: '2s' }}>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Issues</p>
                <h3 className="text-3xl font-bold">{stats.maintenanceRequests}</h3>
                <div className="flex items-center mt-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-500">Needs attention</span>
                </div>
              </div>
              <div className="bg-red-100 p-3 rounded-full animate-float" style={{ animationDelay: '3s' }}>
                <Wrench className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                📈 Revenue Trend
                <Badge variant="secondary" className="ml-2">Last 6 months</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₱${value / 1000}k`} />
                  <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                🔔 Recent Activities
                <Button variant="ghost" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className={`flex items-start space-x-3 p-3 rounded-lg border animate-slide-in-right`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <span className="text-lg">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    {activity.status && (
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Room Occupancy */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>🏘️ Room Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* To-Do List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>📋 Admin To-Do</CardTitle>
              <CardDescription>Keep track of your important tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50 transition-colors">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        todo.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                      }`}
                    >
                      {todo.completed && <CheckCircle className="h-3 w-3 text-white" />}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.task}
                      </p>
                      {todo.dueDate && (
                        <p className="text-xs text-muted-foreground">Due: {todo.dueDate}</p>
                      )}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(todo.priority)}`}></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>⚡ Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link to="/admin/tenants">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Tenants
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/rooms">
                  <Home className="h-4 w-4 mr-2" />
                  Room Management
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/maintenance">
                  <Wrench className="h-4 w-4 mr-2" />
                  Maintenance Requests
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;