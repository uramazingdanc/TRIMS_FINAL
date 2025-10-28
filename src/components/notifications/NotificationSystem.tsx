import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bell, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthOptional } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Notification = {
  id: string;
  title: string;
  description: string;
  type: 'payment' | 'maintenance' | 'announcement' | 'info';
  createdAt: string;
  read: boolean;
};

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { toast } = useToast();
  const auth = useAuthOptional();
  
  // Safety check - return null if auth context not available
  if (!auth) return null;
  
  const { user, isAuthenticated } = auth;

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    try {
      // Mock notifications based on role
      const mockNotifications: Notification[] = [];
      
      if (user?.role === 'tenant') {
        mockNotifications.push({
          id: '1',
          title: 'Payment Reminder',
          description: 'Your rent payment is due in 5 days',
          type: 'payment',
          createdAt: new Date().toISOString(),
          read: false
        });
        
        mockNotifications.push({
          id: '2',
          title: 'Maintenance Update',
          description: 'Your maintenance request has been approved',
          type: 'maintenance',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          read: true
        });
      } else if (user?.role === 'admin') {
        mockNotifications.push({
          id: '3',
          title: 'New Tenant',
          description: 'A new tenant has registered',
          type: 'info',
          createdAt: new Date().toISOString(),
          read: false
        });
        
        mockNotifications.push({
          id: '4',
          title: 'Maintenance Request',
          description: 'There is a new maintenance request',
          type: 'maintenance',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          read: false
        });
      }
      
      setNotifications(mockNotifications);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Don't render anything if not authenticated
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Notification Bell */}
      <div className="fixed top-20 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          className="relative rounded-full bg-white shadow-sm border-gray-200"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Notification Panel */}
      <div 
        className={cn(
          "fixed top-32 right-4 z-50 w-80 sm:w-96 transition-all duration-300 transform",
          showNotifications ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        )}
      >
        <Card className="border-t-4 border-t-tmis-primary shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              {unreadCount === 0 
                ? "You're all caught up!" 
                : `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="max-h-[70vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-3 rounded-lg relative pr-8",
                      notification.read ? "bg-gray-50" : "bg-tmis-primary/5 border-l-2 border-tmis-primary"
                    )}
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-5 w-5"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "h-2 w-2 rounded-full mt-2",
                        notification.read ? "bg-gray-300" : "bg-tmis-primary"
                      )}></div>
                      <div>
                        <h4 className="text-sm font-medium flex items-center gap-1">
                          {notification.title}
                          {!notification.read && (
                            <span className="text-[10px] bg-tmis-primary text-white px-1.5 rounded-full">New</span>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          {notifications.length > 0 && (
            <CardFooter className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}