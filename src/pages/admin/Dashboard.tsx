
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
import { tenants, rooms, payments, maintenanceRequests, getAllDataItems } from '@/services/mockData';
import { Link } from 'react-router-dom';
import { Tenant, Room, Payment, MaintenanceRequest } from '@/types/tenant';

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
  const [tenantsList, setTenantsList] = useState<Tenant[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceRequest[]>([]);

  useEffect(() => {
    // Fetch real data from our data service
    const fetchData = async () => {
      try {
        const fetchedTenants = await getAllDataItems<Tenant>(tenants);
        const fetchedRooms = await getAllDataItems<Room>(rooms);
        const fetchedPayments = await getAllDataItems<Payment>(payments);
        const fetchedMaintenance = await getAllDataItems<MaintenanceRequest>(maintenanceRequests);
        
        setTenantsList(fetchedTenants);
        setRoomsList(fetchedRooms);
        setPaymentsList(fetchedPayments);
        setMaintenanceList(fetchedMaintenance);
        
        // Calculate dashboard statistics with fetched data
        const totalTenants = fetchedTenants.length;
        
        const activeRooms = fetchedRooms.filter(room => room.status === 'occupied').length;
        
        const totalRevenue = fetchedPayments
          .filter(payment => payment.status === 'paid')
          .reduce((sum, payment) => sum + payment.amount, 0);
        
        const pendingMaintenance = fetchedMaintenance
          .filter(req => req.status === 'open' || req.status === 'in progress')
          .length;

        setStats({
          totalTenants,
          activeRooms,
          totalRevenue,
          pendingMaintenance
        });

        // Prepare occupancy data for pie chart
        const occupied = fetchedRooms.filter(room => room.status === 'occupied').length;
        const available = fetchedRooms.filter(room => room.status === 'available').length;
        const maintenance = fetchedRooms.filter(room => room.status === 'maintenance').length;
        
        setOccupancyData([
          { name: 'Occupied', value: occupied },
          { name: 'Available', value: available },
          { name: 'Maintenance', value: maintenance },
        ]);

        // Calculate revenue data from actual payments (last 6 months)
        const today = new Date();
        const lastSixMonths: { [key: string]: number } = {};
        
        // Initialize the last 6 months with 0
        for (let i = 5; i >= 0; i--) {
          const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthName = month.toLocaleString('default', { month: 'short' });
          lastSixMonths[monthName] = 0;
        }
        
        // Sum up payments by month
        fetchedPayments
          .filter(payment => payment.status === 'paid' && payment.date)
          .forEach(payment => {
            const paymentDate = new Date(payment.date);
            const monthName = paymentDate.toLocaleString('default', { month: 'short' });
            
            // Only count payments from the last 6 months
            if (lastSixMonths.hasOwnProperty(monthName)) {
              lastSixMonths[monthName] += payment.amount;
            }
          });
        
        // Convert to array format for the chart
        const revenueChartData = Object.entries(lastSixMonths).map(([month, amount]) => ({
          month,
          amount
        }));
        
        setRevenueData(revenueChartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
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
        {/* Recent Activities - Now showing real tenant activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest updates and actions in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tenantsList.length > 0 ? (
                <>
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-medium">New tenant registered</p>
                    <p className="text-sm text-muted-foreground">
                      {tenantsList[tenantsList.length - 1].name} registered as a new tenant.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tenantsList[tenantsList.length - 1].leaseStartDate).toLocaleDateString()} 
                    </p>
                  </div>
                  
                  {paymentsList.length > 0 && (
                    <div className="border-l-4 border-green-500 pl-4 py-2">
                      <p className="font-medium">Payment received</p>
                      <p className="text-sm text-muted-foreground">
                        {tenantsList.find(t => t.id === paymentsList[paymentsList.length - 1].tenantId)?.name || 'A tenant'} 
                        made a payment of ₱{paymentsList[paymentsList.length - 1].amount.toLocaleString()}.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {paymentsList[paymentsList.length - 1].date ? 
                          new Date(paymentsList[paymentsList.length - 1].date).toLocaleDateString() : 
                          'Recently'}
                      </p>
                    </div>
                  )}
                  
                  {maintenanceList.length > 0 && (
                    <div className="border-l-4 border-amber-500 pl-4 py-2">
                      <p className="font-medium">Maintenance request updated</p>
                      <p className="text-sm text-muted-foreground">
                        {maintenanceList[maintenanceList.length - 1].title} for Room 
                        {roomsList.find(r => r.id === maintenanceList[maintenanceList.length - 1].roomId)?.number || ''} 
                        marked as {maintenanceList[maintenanceList.length - 1].status}.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(maintenanceList[maintenanceList.length - 1].dateSubmitted).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activities to display.
                </div>
              )}
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
