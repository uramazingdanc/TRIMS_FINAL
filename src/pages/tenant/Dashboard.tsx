import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TenantsTable, RoomsTable, PaymentsTable, MaintenanceRequestsTable } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { 
  AlertCircle, 
  CalendarCheck, 
  CreditCard, 
  DollarSign, 
  FileText, 
  HomeIcon, 
  Wrench,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TenantNavigation } from '@/components/tenant/TenantNavigation';

const TenantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tenant, setTenant] = useState<TenantsTable | null>(null);
  const [room, setRoom] = useState<RoomsTable | null>(null);
  const [tenantPayments, setTenantPayments] = useState<PaymentsTable[]>([]);
  const [recentRequests, setRecentRequests] = useState<MaintenanceRequestsTable[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTenantData();
    }
  }, [user]);

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      
      // Get tenant data for current user
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*, rooms(*)')
        .eq('user_id', user?.id)
        .single();

      if (tenantError) {
        console.error('Tenant not found:', tenantError);
        return;
      }

      setTenant(tenantData);
      setRoom(tenantData.rooms);

      // Get tenant's payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('payment_date', { ascending: false });

      setTenantPayments(paymentsData || []);

      // Get tenant's maintenance requests
      const { data: requestsData } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false });

      setRecentRequests(requestsData || []);
      
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      toast({
        title: 'Error',
        description: 'Could not load your dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate days until next payment due
  const calculateDaysUntilDue = () => {
    if (!tenantPayments || tenantPayments.length === 0) return null;
    
    const nextPayment = tenantPayments.find(p => p.status === 'pending');
    if (!nextPayment) return null;
    
    const dueDate = new Date(nextPayment.payment_date);
    const today = new Date();
    
    // Set hours to 0 to compare just the dates
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { days: diffDays, payment: nextPayment };
  };

  const dueInfo = calculateDaysUntilDue();

  if (loading || !tenant) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-xl font-medium">Loading your dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we retrieve your information.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TenantNavigation />
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-tmis-dark">Tenant Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        {/* Alert for overdue payment */}
        {tenant.payment_status === 'overdue' && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-700">Overdue Payment</h3>
                  <p className="text-sm text-red-600">
                    You have an overdue payment of ₱{tenant.balance.toLocaleString()}. Please settle your balance as soon as possible to avoid late fees.
                  </p>
                  <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700" asChild>
                    <Link to="/tenant/payments">Pay Now</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Room Information and Next Payment Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Room Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <HomeIcon className="h-5 w-5 text-tmis-primary" />
                Your Room
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Room Number</span>
                  <span className="font-medium">{room?.number || 'Not assigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{room?.type || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="font-medium">₱{room?.price_per_month?.toLocaleString() || '0'}</span>
                </div>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Status</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="bg-muted">
                      {room ? 'Assigned' : 'No room assigned'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Lease Period</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>{tenant.lease_start_date}</span>
                  <span>to</span>
                  <span>{tenant.lease_end_date}</span>
                </div>
                <Progress
                  value={50} // Replace with actual progress calculation
                  className="h-2 mt-2"
                />
              </div>
            </CardFooter>
          </Card>

          {/* Next Payment Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-tmis-primary" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Balance</span>
                  <span className={`font-medium ${tenant.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₱{tenant.balance.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge 
                    className={
                      tenant.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                        : tenant.payment_status === 'overdue'
                        ? 'bg-red-100 text-red-800 hover:bg-red-100'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                    }
                  >
                    {tenant.payment_status === 'paid' ? 'Paid' : tenant.payment_status === 'overdue' ? 'Overdue' : 'Pending'}
                  </Badge>
                </div>
                <Separator />
                {dueInfo ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Next Payment Due</span>
                      <span className="font-medium">{dueInfo.payment.payment_date}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <CalendarCheck className="h-5 w-5 text-tmis-primary" />
                      <span className={`text-sm ${dueInfo.days < 0 ? 'text-red-600 font-medium' : dueInfo.days <= 5 ? 'text-amber-600 font-medium' : ''}`}>
                        {dueInfo.days < 0 
                          ? `${Math.abs(dueInfo.days)} days overdue` 
                          : dueInfo.days === 0 
                          ? 'Due today' 
                          : `${dueInfo.days} days until due`}
                      </span>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button asChild>
                        <Link to="/tenant/payments">Pay Now</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-muted-foreground">No upcoming payments due</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar and Maintenance Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Calendar Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-tmis-primary" />
                Calendar
              </CardTitle>
              <CardDescription>Important dates and events</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Recent Maintenance Requests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-tmis-primary" />
                Maintenance Requests
              </CardTitle>
              <CardDescription>Your recent maintenance requests</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                      <div>
                        <h4 className="font-medium">{request.title}</h4>
                        <p className="text-sm text-muted-foreground">{request.description.substring(0, 60)}{request.description.length > 60 ? '...' : ''}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            className={
                              request.status === 'completed' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                : request.status === 'in progress'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                            }
                          >
                            {request.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Submitted on {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/tenant/maintenance">
                        View All Requests
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-2">No maintenance requests found</p>
                  <Button asChild>
                    <Link to="/tenant/maintenance/new">Submit New Request</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex flex-col" asChild>
                <Link to="/tenant/payments">
                  <CreditCard className="h-6 w-6 mb-2" />
                  Make Payment
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col" asChild>
                <Link to="/tenant/maintenance/new">
                  <Wrench className="h-6 w-6 mb-2" />
                  Request Maintenance
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col" asChild>
                <Link to="/tenant/profile">
                  <FileText className="h-6 w-6 mb-2" />
                  View Lease
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col" asChild>
                <Link to="/tenant/profile/documents">
                  <FileText className="h-6 w-6 mb-2" />
                  Upload Documents
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TenantDashboard;
