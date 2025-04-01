
import { useState, useEffect } from 'react';
import { tenants, rooms } from '@/services/mockData';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Eye, UserPlus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const TenantsPage = () => {
  const [tenantsList, setTenantsList] = useState(tenants);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // This effect would fetch tenants from API in a real app
    setTenantsList(tenants);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    
    if (!e.target.value.trim()) {
      setTenantsList(tenants);
      return;
    }
    
    const filteredTenants = tenants.filter(tenant => 
      tenant.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
      tenant.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
      tenant.phone.includes(e.target.value)
    );
    
    setTenantsList(filteredTenants);
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getRoomNumber = (roomId: string) => {
    const room = rooms.find(room => room.id === roomId);
    return room ? room.number : 'Not assigned';
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-tmis-dark">Tenants</h1>
          <p className="text-muted-foreground">Manage your tenant information</p>
        </div>
        <Button className="bg-tmis-primary hover:bg-tmis-primary/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Tenant
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tenants Directory</CardTitle>
              <CardDescription>
                List of all registered tenants in the boarding house
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tenants..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of all your tenants.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Lease Period</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenantsList.length > 0 ? (
                tenantsList.map((tenant) => (
                  <TableRow key={tenant.id} className="group">
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{getRoomNumber(tenant.roomId)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{tenant.email}</div>
                        <div className="text-muted-foreground">{tenant.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>From: {tenant.leaseStartDate}</div>
                        <div>To: {tenant.leaseEndDate}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPaymentStatusBadge(tenant.paymentStatus)}</TableCell>
                    <TableCell>₱{tenant.balance.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/tenants/${tenant.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No tenants found. {searchTerm && 'Try a different search term.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantsPage;
