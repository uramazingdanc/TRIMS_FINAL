import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/Spinner';
import { Users, Home, TrendingUp, Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function SchoolDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    occupancyRate: 0,
  });
  const [roomTypeData, setRoomTypeData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchSchoolData();
    }
  }, [user]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);

      // Fetch tenants (students)
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('*');

      if (tenantsError) throw tenantsError;

      // Fetch rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*');

      if (roomsError) throw roomsError;

      // Calculate stats
      const totalStudents = tenants?.length || 0;
      const occupiedRooms = rooms?.filter((r) => r.status === 'occupied').length || 0;
      const availableRooms = rooms?.filter((r) => r.status === 'available').length || 0;
      const totalRooms = rooms?.length || 1;
      const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

      setStats({
        totalStudents,
        occupiedRooms,
        availableRooms,
        occupancyRate,
      });

      // Room type distribution
      const roomTypes = rooms?.reduce((acc: any, room) => {
        const type = room.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const roomTypeChartData = Object.entries(roomTypes || {}).map(([type, count]) => ({
        name: type,
        value: count,
      }));

      setRoomTypeData(roomTypeChartData);

      // Monthly occupancy trend (mock data for demo)
      setMonthlyData([
        { month: 'Jan', occupancy: 85 },
        { month: 'Feb', occupancy: 88 },
        { month: 'Mar', occupancy: 90 },
        { month: 'Apr', occupancy: 87 },
        { month: 'May', occupancy: 92 },
        { month: 'Jun', occupancy: occupancyRate },
      ]);
    } catch (error) {
      console.error('Error fetching school data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">School Dashboard</h1>
          <p className="text-muted-foreground">Student housing analytics and insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.occupiedRooms} of {stats.occupiedRooms + stats.availableRooms} rooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableRooms}</div>
            <p className="text-xs text-muted-foreground">Ready for occupancy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.occupiedRooms + stats.availableRooms}</div>
            <p className="text-xs text-muted-foreground">Total housing capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Trend</CardTitle>
            <CardDescription>Monthly occupancy rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="occupancy" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Type Distribution</CardTitle>
            <CardDescription>Breakdown by room type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roomTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roomTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Housing Summary</CardTitle>
          <CardDescription>Overview of student housing statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Housing Capacity</span>
              <span className="text-sm">{stats.occupiedRooms + stats.availableRooms} rooms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Occupied Units</span>
              <span className="text-sm">{stats.occupiedRooms} rooms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Available Units</span>
              <span className="text-sm">{stats.availableRooms} rooms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Occupancy Rate</span>
              <span className="text-sm font-bold">{stats.occupancyRate}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
