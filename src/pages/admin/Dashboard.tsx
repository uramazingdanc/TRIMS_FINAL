
import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Cell
} from 'recharts';
import {
  Building2,
  Users,
  DollarSign,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { tenants, rooms, payments, maintenanceRequests } from '@/services/mockData';
import { Link } from 'react-router-dom';

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeRooms: 0,
    totalRevenue: 0,
    pendingMaintenance: 0
  });

  const [occupancyData, setOccupancyData] = useState<{ name: string; value: number }[]>([]);
  
  const [revenueData, setRevenueData] = useState<{ month: string; amount: number }[]>([]);

  useEffect(() => {
    // Calculate dashboard statistics
    const totalTenants = tenants.length;
    
    const activeRooms = rooms.filter(room => room.status === 'occupied').length;
    
    const totalRevenue = payments
      .filter(payment => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const pendingMaintenance = maintenanceRequests
      .filter(req => req.status === 'open' || req.status === 'in progress')
      .length;

    setStats({
      totalTenants,
      activeRooms,
      totalRevenue,
      pendingMaintenance
    });

    // Prepare occupancy data for pie chart
    const occupied = rooms.filter(room => room.status === 'occupied').length;
    const available = rooms.filter(room => room.status === 'available').length;
    const maintenance = rooms.filter(room => room.status === 'maintenance').length;
    
    setOccupancyData([
      { name: 'Occupied', value: occupied },
      { name: 'Available', value: available },
      { name: 'Maintenance', value: maintenance },
    ]);

    // Prepare revenue data for bar chart (mocked data for last 6 months)
    setRevenueData([
      { month: 'Dec', amount: 15000 },
      { month: 'Jan', amount: 18000 },
      { month: 'Feb', amount: 14500 },
      { month: 'Mar', amount: 17000 },
      { month: 'Apr', amount: 21000 },
      { month: 'May', amount: 19500 },
    ]);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-tmis-dark">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your administrator dashboard overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-2 rounded-md">
                <Users className="h-6 w-6 text-tmis-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
                <h3 className="text-2xl font-bold">{stats.totalTenants}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 p-2 rounded-md">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupied Rooms</p>
                <h3 className="text-2xl font-bold">{stats.activeRooms}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-amber-100 p-2 rounded-md">
                <DollarSign className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">₱{stats.totalRevenue.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 p-2 rounded-md">
                <Wrench className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <h3 className="text-2xl font-bold">{stats.pendingMaintenance}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="occupancy" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="occupancy">Room Occupancy</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        <TabsContent value="occupancy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Occupancy Status</CardTitle>
              <CardDescription>
                Current distribution of room status across the boarding house.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} rooms`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>
                Financial performance over the last 6 months.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₱${value / 1000}k`} />
                  <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']} />
                  <Legend />
                  <Bar dataKey="amount" name="Revenue" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activities and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest updates and actions in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium">New tenant registered</p>
                <p className="text-sm text-muted-foreground">Jane Smith registered as a new tenant.</p>
                <p className="text-xs text-muted-foreground">Today, 9:32 AM</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-medium">Payment received</p>
                <p className="text-sm text-muted-foreground">John Doe made a payment of ₱8,000.</p>
                <p className="text-xs text-muted-foreground">Yesterday, 3:15 PM</p>
              </div>
              <div className="border-l-4 border-amber-500 pl-4 py-2">
                <p className="font-medium">Maintenance request updated</p>
                <p className="text-sm text-muted-foreground">AC repair request for Room 202 marked as in-progress.</p>
                <p className="text-xs text-muted-foreground">Yesterday, 10:45 AM</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="font-medium">Room status changed</p>
                <p className="text-sm text-muted-foreground">Room 103 status changed from maintenance to available.</p>
                <p className="text-xs text-muted-foreground">May 15, 2:20 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Commonly used administrative functions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button className="justify-between" asChild>
                <Link to="/admin/tenants/add">
                  Add New Tenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button className="justify-between" variant="outline" asChild>
                <Link to="/admin/rooms">
                  Manage Rooms
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button className="justify-between" variant="outline" asChild>
                <Link to="/admin/payments/record">
                  Record Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button className="justify-between" variant="outline" asChild>
                <Link to="/admin/maintenance">
                  View Maintenance Requests
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button className="justify-between" variant="outline" asChild>
                <Link to="/admin/reports">
                  Generate Reports
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
