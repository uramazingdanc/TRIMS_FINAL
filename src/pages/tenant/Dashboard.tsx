
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { tenants, payments, maintenanceRequests, rooms } from '@/services/mockData';
import { Link } from 'react-router-dom';

const TenantDashboard = () => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [tenantPayments, setTenantPayments] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (user) {
      // Find tenant data based on user ID
      const currentTenant = tenants.find(t => t.userId === user.id);
      
      if (currentTenant) {
        setTenant(currentTenant);
        
        // Get tenant's room
        const tenantRoom = rooms.find(r => r.id === currentTenant.roomId);
        setRoom(tenantRoom);
        
        // Get tenant's payments
        const filteredPayments = payments
          .filter(p => p.tenantId === currentTenant.id)
          .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
        setTenantPayments(filteredPayments);
        
        // Get tenant's maintenance requests
        const filteredRequests = maintenanceRequests
          .filter(r => r.tenantId === currentTenant.id)
          .sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
        setRecentRequests(filteredRequests);
      }
    }
  }, [user]);

  // Calculate days until next payment due
  const calculateDaysUntilDue = () => {
    if (!tenantPayments || tenantPayments.length === 0) return null;
    
    const nextPayment = tenantPayments.find(p => p.status === 'pending' || p.status === 'overdue');
    if (!nextPayment) return null;
    
    const dueDate = new Date(nextPayment.dueDate);
    const today = new Date();
    
    // Set hours to 0 to compare just the dates
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { days: diffDays, payment: nextPayment };
  };

  const dueInfo = calculateDaysUntilDue();

  if (!tenant || !room) {
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
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-tmis-dark">Tenant Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
      </div>

      {/* Alert for overdue payment */}
      {tenant.paymentStatus === 'overdue' && (
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
                <span className="font-medium">{room.number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{room.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monthly Rent</span>
                <span className="font-medium">₱{room.pricePerMonth.toLocaleString()}</span>
              </div>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Amenities</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {room.amenities.map((amenity: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-muted">
                      {amenity}
                    </Badge>
                  ))}
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
                <span>{tenant.leaseStartDate}</span>
                <span>to</span>
                <span>{tenant.leaseEndDate}</span>
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
                    tenant.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                      : tenant.paymentStatus === 'overdue'
                      ? 'bg-red-100 text-red-800 hover:bg-red-100'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                  }
                >
                  {tenant.paymentStatus === 'paid' ? 'Paid' : tenant.paymentStatus === 'overdue' ? 'Overdue' : 'Pending'}
                </Badge>
              </div>
              <Separator />
              {dueInfo ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">Next Payment Due</span>
                    <span className="font-medium">{dueInfo.payment.dueDate}</span>
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
                          Submitted on {request.dateSubmitted}
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
  );
};

export default TenantDashboard;
