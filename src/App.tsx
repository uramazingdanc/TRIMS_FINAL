import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/Dashboard";
import TenantsPage from "./pages/admin/Tenants";
import RoomsPage from "./pages/admin/Rooms";
import RoomManager from "./pages/admin/RoomManager";
import MaintenanceRequestsPage from "./pages/admin/Maintenance";
import TenantDashboard from "./pages/tenant/Dashboard";
import NotFound from "./pages/NotFound";
import Rules from "./pages/Rules";

// Layouts
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { NotificationSystem } from "@/components/notifications/NotificationSystem";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NotificationSystem />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="rules" element={<Rules />} />
              </Route>
              
              {/* Protected Admin Routes */}
              <Route path="admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="tenants" element={<TenantsPage />} />
                <Route path="rooms" element={<RoomsPage />} />
                <Route path="room-manager" element={<RoomManager />} />
                <Route path="maintenance" element={<MaintenanceRequestsPage />} />
                {/* Add payments route later */}
                <Route path="payments" element={<div className="container mx-auto py-6"><h1 className="text-3xl font-bold">Payments</h1><p className="mt-4">Payment management coming soon.</p></div>} />
              </Route>
              
              {/* Protected Tenant Routes - Use TenantLayout directly under the SiteHeader */}
              <Route path="tenant" element={
                <ProtectedRoute allowedRoles={['tenant']}>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="*" element={<TenantLayout />}>
                  <Route index element={<Navigate to="/tenant/dashboard" />} />
                  <Route path="dashboard" element={<TenantDashboard />} />
                  <Route path="payments" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Payments</h1><p>Your payment information will appear here. No pending payments at the moment.</p></div>} />
                  <Route path="maintenance" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Maintenance</h1><p>Submit and track maintenance requests here.</p></div>} />
                  <Route path="profile" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Profile</h1><p>Your profile information and settings.</p></div>} />
                </Route>
              </Route>
              
              {/* 404 - Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;