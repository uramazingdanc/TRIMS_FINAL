import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/Spinner';
import { User, Home, CreditCard, AlertCircle, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchParentData();
    }
  }, [user]);

  const fetchParentData = async () => {
    try {
      setLoading(true);

      // Fetch student/tenant information linked to this parent
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*, rooms(*)')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (tenantError) {
        console.error('Error fetching tenant:', tenantError);
      }

      setStudentInfo(tenantData);
      setRoomDetails(tenantData?.rooms);

      // Fetch payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', tenantData?.id)
        .order('due_date', { ascending: false })
        .limit(5);

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Fetch announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (announcementsError) throw announcementsError;
      setAnnouncements(announcementsData || []);
    } catch (error) {
      console.error('Error fetching parent data:', error);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Parent Dashboard</h1>
          <p className="text-muted-foreground">Monitor your student's housing information</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Name</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentInfo?.name || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">{studentInfo?.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Number</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomDetails?.number || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {roomDetails?.type || 'N/A'} - Floor {roomDetails?.floor || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${roomDetails?.price_per_month || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={studentInfo?.status === 'active' ? 'default' : 'secondary'}>
                {studentInfo?.status || 'N/A'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Information */}
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>Detailed information about your student</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-sm">{studentInfo?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Home Address</p>
              <p className="text-sm">{studentInfo?.address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
              <p className="text-sm">{studentInfo?.emergency_contact || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Move-in Date</p>
              <p className="text-sm">
                {studentInfo?.lease_start_date
                  ? new Date(studentInfo.lease_start_date).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Last 5 payment records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment records found</p>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">${payment.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getPaymentStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Announcements
          </CardTitle>
          <CardDescription>Latest updates from management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements</p>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="border-b pb-3 last:border-0">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">{announcement.title}</h4>
                    <Badge variant="outline">{announcement.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
