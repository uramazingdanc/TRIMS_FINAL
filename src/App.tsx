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
import ApplyRoom from "./pages/tenant/ApplyRoom";
import TenantPayments from "./pages/tenant/Payments";
import TenantMaintenance from "./pages/tenant/Maintenance";
import TenantProfile from "./pages/tenant/Profile";
import NotFound from "./pages/NotFound";
import Rules from "./pages/Rules";

// Layouts
import { TenantLayout } from "@/components/tenant/TenantLayout";
import { ParentLayout } from "@/components/parent/ParentLayout";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { SchoolLayout } from "@/components/school/SchoolLayout";
import { NotificationSystem } from "@/components/notifications/NotificationSystem";

// Role-specific pages
import ParentDashboard from "./pages/parent/Dashboard";
import StaffDashboard from "./pages/staff/Dashboard";
import SchoolDashboard from "./pages/school/Dashboard";

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
              
              {/* Protected Tenant Routes */}
              <Route path="tenant" element={
                <ProtectedRoute allowedRoles={['tenant']}>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="*" element={<TenantLayout />}>
                  <Route index element={<Navigate to="/tenant/dashboard" />} />
                  <Route path="dashboard" element={<TenantDashboard />} />
                  <Route path="apply-room" element={<ApplyRoom />} />
                  <Route path="payments" element={<TenantPayments />} />
                  <Route path="maintenance" element={<TenantMaintenance />} />
                  <Route path="profile" element={<TenantProfile />} />
                </Route>
              </Route>
              
              {/* Protected Parent Routes */}
              <Route path="parent" element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="*" element={<ParentLayout />}>
                  <Route index element={<Navigate to="/parent/dashboard" />} />
                  <Route path="dashboard" element={<ParentDashboard />} />
                  <Route path="student-info" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Student Information</h1><p>Detailed student information will appear here.</p></div>} />
                  <Route path="payments" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Payments</h1><p>Payment history and status.</p></div>} />
                  <Route path="messages" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Messages</h1><p>Communication with management.</p></div>} />
                </Route>
              </Route>
              
              {/* Protected Staff Routes */}
              <Route path="staff" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="*" element={<StaffLayout />}>
                  <Route index element={<Navigate to="/staff/dashboard" />} />
                  <Route path="dashboard" element={<StaffDashboard />} />
                  <Route path="maintenance" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Maintenance Requests</h1><p>All maintenance requests.</p></div>} />
                  <Route path="work-orders" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Work Orders</h1><p>Manage work orders.</p></div>} />
                  <Route path="facilities" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Facilities</h1><p>Facility management.</p></div>} />
                  <Route path="reports" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Reports</h1><p>Staff reports.</p></div>} />
                </Route>
              </Route>
              
              {/* Protected School Routes */}
              <Route path="school" element={
                <ProtectedRoute allowedRoles={['school']}>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="*" element={<SchoolLayout />}>
                  <Route index element={<Navigate to="/school/dashboard" />} />
                  <Route path="dashboard" element={<SchoolDashboard />} />
                  <Route path="students" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Students</h1><p>Student housing list.</p></div>} />
                  <Route path="occupancy" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Occupancy</h1><p>Occupancy tracking.</p></div>} />
                  <Route path="reports" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Reports</h1><p>Institutional reports.</p></div>} />
                  <Route path="analytics" element={<div className="animate-fade-in"><h1 className="text-2xl font-bold mb-6">Analytics</h1><p>Analytics and insights.</p></div>} />
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