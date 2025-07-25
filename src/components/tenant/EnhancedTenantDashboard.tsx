import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TenantsTable, RoomsTable, PaymentsTable, MaintenanceRequestsTable } from '@/types/supabase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/Spinner';
import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie,
  Cell
} from 'recharts';
import { 
  Search, 
  DollarSign, 
  Home, 
  Bell, 
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench,
  MessageSquare,
  User,
  FileText,
  Settings,
  HelpCircle,
  Moon,
  Sun,
  TrendingUp,
  Building,
  Phone,
  Mail,
  MapPin,
  Star,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  currentBalance: number;
  lastPayment: { amount: number; date: string; method: string };
  rentBreakdown: { baseRent: number; utilities: number; lateFees: number };
  openTickets: number;
  leaseInfo: {
    startDate: string;
    endDate: string;
    unit: string;
    status: string;
    daysLeft: number;
  };
}

interface NotificationItem {
  id: string;
  message: string;
  type: 'payment' | 'maintenance' | 'announcement' | 'system';
  time: string;
  seen: boolean;
}

interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'urgent';
  submittedAt: string;
  resolvedAt?: string;
}

const EnhancedTenantDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    currentBalance: 0,
    lastPayment: { amount: 0, date: '', method: '' },
    rentBreakdown: { baseRent: 0, utilities: 0, lateFees: 0 },
    openTickets: 0,
    leaseInfo: {
      startDate: '',
      endDate: '',
      unit: '',
      status: '',
      daysLeft: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [maintenanceTitle, setMaintenanceTitle] = useState('');
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchTenantData();
    }
  }, [user]);

  const fetchTenantData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch tenant data
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          *,
          rooms(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (tenantError) throw tenantError;
      
      if (!tenantData) {
        toast({
          title: 'Welcome! 👋',
          description: 'Please complete your tenant registration first.',
          variant: 'destructive',
        });
        return;
      }

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch maintenance requests
      const { data: maintenance, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false });

      if (maintenanceError) throw maintenanceError;

      // Calculate stats
      const currentBalance = Number(tenantData.balance) || 0;
      const lastPayment = payments?.[0] || { amount: 0, payment_date: '', payment_method: '' };
      const openTickets = maintenance?.filter(m => m.status !== 'resolved').length || 0;
      
      // Calculate lease days left
      const leaseEndDate = new Date(tenantData.lease_end_date);
      const today = new Date();
      const daysLeft = Math.ceil((leaseEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      setStats({
        currentBalance,
        lastPayment: {
          amount: Number(lastPayment.amount) || 0,
          date: lastPayment.payment_date || '',
          method: lastPayment.payment_method || ''
        },
        rentBreakdown: {
          baseRent: Number(tenantData.rooms?.price_per_month) || 0,
          utilities: 500, // Mock data
          lateFees: currentBalance > 0 ? 200 : 0 // Mock late fee
        },
        openTickets,
        leaseInfo: {
          startDate: tenantData.lease_start_date,
          endDate: tenantData.lease_end_date,
          unit: tenantData.rooms?.number || 'Not assigned',
          status: tenantData.payment_status,
          daysLeft
        }
      });

      // Set payment history for chart
      const chartData = payments?.slice(0, 6).map(p => ({
        month: new Date(p.payment_date).toLocaleDateString('en', { month: 'short' }),
        amount: Number(p.amount)
      })) || [];
      setPaymentHistory(chartData);

      // Set maintenance tickets
      const tickets: MaintenanceTicket[] = maintenance?.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        status: m.status as any,
        priority: m.priority as any,
        submittedAt: m.created_at,
        resolvedAt: m.status === 'resolved' ? m.updated_at : undefined
      })) || [];
      setMaintenanceTickets(tickets);

      // Mock notifications
      setNotifications([
        {
          id: '1',
          message: '💰 Rent due in 3 days - ₱12,000',
          type: 'payment',
          time: '2 hours ago',
          seen: false
        },
        {
          id: '2',
          message: '🔧 Your maintenance request has been assigned',
          type: 'maintenance',
          time: '1 day ago',
          seen: false
        },
        {
          id: '3',
          message: '📢 Building maintenance this Sunday 9-11 AM',
          type: 'announcement',
          time: '3 days ago',
          seen: true
        }
      ]);

    } catch (error) {
      console.error('Error fetching tenant data:', error);
      toast({
        title: 'Oops! Something went wrong 😅',
        description: 'Could not load your dashboard. Let\'s try that again!',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const submitMaintenanceRequest = async () => {
    if (!user || !maintenanceTitle || !maintenanceDescription) return;

    try {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('id, room_id')
        .eq('user_id', user.id)
        .single();

      if (!tenantData) return;

      const { error } = await supabase
        .from('maintenance_requests')
        .insert({
          tenant_id: tenantData.id,
          room_id: tenantData.room_id,
          title: maintenanceTitle,
          description: maintenanceDescription,
          status: 'pending',
          priority: 'medium'
        });

      if (error) throw error;

      setIsMaintenanceDialogOpen(false);
      setMaintenanceTitle('');
      setMaintenanceDescription('');
      
      toast({
        title: '🔧 Request submitted!',
        description: 'We\'ll get right on that! You\'ll receive updates soon. ✨',
      });

      // Refresh data
      fetchTenantData();
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      toast({
        title: 'Submission failed 😕',
        description: 'Could not submit your request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner />
          <p className="text-muted-foreground">Loading your dashboard... Almost there! ⚡</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 space-y-8 transition-colors ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Hey there! 👋</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your personal dashboard. Here's what's happening with your place!
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
            className="animate-pulse"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <div className="relative">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notifications.filter(n => !n.seen).length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                  {notifications.filter(n => !n.seen).length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Current Balance */}
        <Card className="glass-card hover-lift animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <h3 className={`text-3xl font-bold ${stats.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₱{stats.currentBalance.toLocaleString()}
                </h3>
                <div className="flex items-center mt-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-sm text-muted-foreground">
                    {stats.currentBalance > 0 ? 'Payment due soon' : 'All caught up! 🎉'}
                  </span>
                </div>
              </div>
              <div className="bg-red-100 p-3 rounded-full animate-float">
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Room Info */}
        <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Your Room</p>
                <h3 className="text-3xl font-bold">{stats.leaseInfo.unit}</h3>
                <div className="flex items-center mt-2">
                  <MapPin className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-500">Home sweet home! 🏠</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full animate-float" style={{ animationDelay: '1s' }}>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lease Status */}
        <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lease Status</p>
                <h3 className="text-3xl font-bold">{stats.leaseInfo.daysLeft}</h3>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">days remaining</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full animate-float" style={{ animationDelay: '2s' }}>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card className="glass-card hover-lift animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                <h3 className="text-3xl font-bold">{stats.openTickets}</h3>
                <div className="flex items-center mt-2">
                  <Wrench className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-500">
                    {stats.openTickets === 0 ? 'All good! ✨' : 'In progress'}
                  </span>
                </div>
              </div>
              <div className="bg-orange-100 p-3 rounded-full animate-float" style={{ animationDelay: '3s' }}>
                <Wrench className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Overview */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                💳 Billing Overview
                <Badge variant="secondary" className="ml-2">
                  {stats.currentBalance > 0 ? 'Payment Due' : 'Paid Up'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Base Rent</p>
                    <p className="text-xl font-bold">₱{stats.rentBreakdown.baseRent.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Utilities</p>
                    <p className="text-xl font-bold">₱{stats.rentBreakdown.utilities.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Late Fees</p>
                    <p className="text-xl font-bold text-red-600">₱{stats.rentBreakdown.lateFees.toLocaleString()}</p>
                  </div>
                </div>
                
                {stats.currentBalance > 0 && (
                  <Button 
                    className="w-full"
                    onClick={() => setIsPaymentDialogOpen(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now - ₱{stats.currentBalance.toLocaleString()}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment History Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>📊 Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₱${value / 1000}k`} />
                  <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Payment']} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>⚡ Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => setIsMaintenanceDialogOpen(true)}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Admin
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View Lease
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                🔔 Recent Updates
                <Badge variant="secondary">{notifications.filter(n => !n.seen).length} new</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification, index) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg border animate-slide-in-right ${
                      !notification.seen ? 'bg-blue-50 border-blue-200' : 'bg-muted/50'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Tickets */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>🔧 Your Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {maintenanceTickets.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">All good! No issues reported. ✨</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenanceTickets.slice(0, 3).map((ticket) => (
                    <div key={ticket.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{ticket.title}</p>
                        <Badge 
                          variant={ticket.status === 'resolved' ? 'default' : 'secondary'}
                          className={getPriorityColor(ticket.priority)}
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>💳 Make Payment</DialogTitle>
            <DialogDescription>
              Pay your outstanding balance of ₱{stats.currentBalance.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-amount">Payment Amount (₱)</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={stats.currentBalance.toString()}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Payment Method</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gcash">GCash</SelectItem>
                  <SelectItem value="bpi">BPI Online</SelectItem>
                  <SelectItem value="paymaya">PayMaya</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              <CheckCircle className="h-4 w-4 mr-2" />
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Request Dialog */}
      <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>🔧 Report Maintenance Issue</DialogTitle>
            <DialogDescription>
              Tell us what's wrong and we'll get it fixed ASAP!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="issue-title">What's the issue?</Label>
              <Input
                id="issue-title"
                value={maintenanceTitle}
                onChange={(e) => setMaintenanceTitle(e.target.value)}
                placeholder="e.g., Leaky faucet in bathroom"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="issue-description">Tell us more</Label>
              <textarea
                id="issue-description"
                value={maintenanceDescription}
                onChange={(e) => setMaintenanceDescription(e.target.value)}
                placeholder="Describe the problem in detail..."
                className="mt-1 w-full p-3 border rounded-md h-24 resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaintenanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitMaintenanceRequest}
              disabled={!maintenanceTitle || !maintenanceDescription}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedTenantDashboard;