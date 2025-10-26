import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/Spinner';
import { Wrench, ClipboardList, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStaffData();
    }
  }, [user]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);

      // Fetch maintenance requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select('*, rooms(number), tenants(name)')
        .order('date_submitted', { ascending: false });

      if (requestsError) throw requestsError;
      setMaintenanceRequests(requestsData || []);

      // Mock work orders data until table is created
      const mockWorkOrders: any[] = [];
      setWorkOrders(mockWorkOrders);

      // Calculate stats from maintenance requests
      const pending = requestsData?.filter((r: any) => r.status === 'open').length || 0;
      const inProgress = requestsData?.filter((r: any) => r.status === 'in progress').length || 0;
      const completed = requestsData?.filter((r: any) => r.status === 'completed').length || 0;

      setStats({
        pending,
        inProgress,
        completed,
        total: requestsData?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching staff data:', error);
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
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage maintenance and work orders</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All work orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Active Work Orders</CardTitle>
          <CardDescription>Manage and track work orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No work orders found</p>
            ) : (
              workOrders.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{order.title}</h4>
                      <Badge variant={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{order.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Room: {order.maintenance_requests?.rooms?.number || 'N/A'}</span>
                      <span>Tenant: {order.maintenance_requests?.tenants?.name || 'N/A'}</span>
                      <span>Created: {new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Maintenance Requests</CardTitle>
          <CardDescription>New requests from tenants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No maintenance requests</p>
            ) : (
              maintenanceRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{request.title}</h4>
                      <Badge variant={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Room: {request.rooms?.number || 'N/A'}</span>
                      <span>Tenant: {request.tenants?.name || 'N/A'}</span>
                    </div>
                  </div>
                  <Badge>{request.status}</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
