
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, 
  LockKeyhole, 
  BarChart4, 
  Bell, 
  FileText, 
  Wallet,
  Users,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  const redirectToDashboard = () => {
    if (user?.role === 'admin') {
      return '/admin/dashboard';
    }
    return '/tenant/dashboard';
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-tmis-primary via-blue-500 to-tmis-secondary py-24 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 left-3/4 w-1/3 h-1/3 bg-blue-300/10 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-0 left-1/4 w-1/4 h-1/4 bg-blue-200/10 rounded-full blur-3xl animate-[pulse_12s_ease-in-out_infinite]"></div>
        </div>

        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm border border-white/20 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span>Next-Gen Boarding House Management</span>
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-center leading-tight">
              <span className="animate-fade-in inline-block">Tenant</span>{" "}
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-[fade-in_0.5s_ease-out_0.2s_both]">Management</span>{" "}
              <span className="animate-[fade-in_0.5s_ease-out_0.4s_both] inline-block">System</span>
            </h1>
            
            <p className="text-xl mb-10 text-white/90 text-center animate-[fade-in_0.5s_ease-out_0.6s_both]">
              Modern boarding house management for ATCCAS. Simplifying tenant, payment, and maintenance workflows into one sleek platform.
            </p>
            
            {isAuthenticated && (
              <div className="flex justify-center animate-[fade-in_0.5s_ease-out_0.8s_both]">
                <Button size="lg" className="bg-white text-tmis-primary hover:bg-white/90 group transition-all duration-300 transform hover:scale-105" asChild>
                  <Link to={redirectToDashboard()}>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-16 animate-[fade-in_0.5s_ease-out_1s_both]">
            <a 
              href="#features" 
              className="flex flex-col items-center text-white/80 hover:text-white transition-colors"
            >
              <span className="text-sm font-medium mb-2">Discover More</span>
              <ArrowDown className="h-5 w-5 animate-bounce" />
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-tmis-dark mb-4 animate-fade-in">
              Key Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-[fade-in_0.5s_ease-out_0.2s_both]">
              Our platform streamlines boarding house management with these powerful features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-8px] animate-[fade-in_0.5s_ease-out_0.3s_both]">
              <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-tmis-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tenant Management</h3>
              <p className="text-muted-foreground">
                Easily track tenant data, leases, and room assignments all in one place.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-8px] animate-[fade-in_0.5s_ease-out_0.4s_both]">
              <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Building2 className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Room Management</h3>
              <p className="text-muted-foreground">
                Monitor room availability and maintenance status in real-time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-8px] animate-[fade-in_0.5s_ease-out_0.5s_both]">
              <div className="bg-amber-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Wallet className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Payment Tracking</h3>
              <p className="text-muted-foreground">
                Record payments, generate invoices, and send automatic reminders.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-8px] animate-[fade-in_0.5s_ease-out_0.6s_both]">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Bell className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Notifications</h3>
              <p className="text-muted-foreground">
                Automated alerts for payments, lease renewals, and announcements.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-8px] animate-[fade-in_0.5s_ease-out_0.7s_both]">
              <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Digital Agreements</h3>
              <p className="text-muted-foreground">
                Manage lease agreements and important documents in one secure location.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-8px] animate-[fade-in_0.5s_ease-out_0.8s_both]">
              <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <BarChart4 className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Visual Analytics</h3>
              <p className="text-muted-foreground">
                Get insights with visual reports on occupancy, revenue, and maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin/Tenant Features */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-tmis-dark mb-4 animate-fade-in">
              Tailored For Everyone
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-[fade-in_0.5s_ease-out_0.2s_both]">
              Customized features for both administrators and tenants
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Admin Features */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 transform transition-all duration-500 hover:scale-[1.02] animate-[fade-in_0.5s_ease-out_0.3s_both]">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-tmis-primary text-white p-3 rounded-lg">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold">For Administrators</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Complete tenant registration and management</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Track room assignments and maintenance schedules</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Manage payment records and generate financial reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Send notifications and announcements to tenants</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Generate occupancy and revenue analytics dashboards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Manage boarding house policies and regulations</span>
                </li>
              </ul>
            </div>

            {/* Tenant Features */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 transform transition-all duration-500 hover:scale-[1.02] animate-[fade-in_0.5s_ease-out_0.5s_both]">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-tmis-secondary text-white p-3 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold">For Tenants</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>View and update personal information</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Access lease agreements and boarding house policies</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Submit and track maintenance requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>View payment history and upcoming due dates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Receive important announcements and notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Download receipts and important documents</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-tmis-primary via-blue-600 to-tmis-secondary text-white">
        <div className="container mx-auto px-4 text-center relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
            <div className="absolute bottom-0 left-1/4 w-1/3 h-1/3 bg-blue-300/10 rounded-full blur-3xl animate-[pulse_15s_ease-in-out_infinite]"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-6 animate-fade-in">Ready to Get Started?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto text-white/90 animate-[fade-in_0.5s_ease-out_0.3s_both]">
              Join TMIS today and experience streamlined boarding house management at ATCCAS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-[fade-in_0.5s_ease-out_0.5s_both]">
              {isAuthenticated ? (
                <Button size="lg" className="bg-white text-tmis-primary hover:bg-white/90 group transition-all duration-300 transform hover:scale-105" asChild>
                  <Link to={redirectToDashboard()}>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="bg-white text-tmis-primary hover:bg-white/90 group transition-all duration-300 transform hover:scale-105" asChild>
                    <Link to="/login">
                      Login
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105" asChild>
                    <Link to="/register">
                      Register
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-tmis-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="animate-[fade-in_0.5s_ease-out_0.2s_both]">
              <h3 className="text-lg font-bold mb-4">TMIS</h3>
              <p className="text-gray-300 text-sm">
                Tenant Management and Information System for ATCCAS Boarding House.
              </p>
            </div>
            <div className="animate-[fade-in_0.5s_ease-out_0.3s_both]">
              <h4 className="text-md font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div className="animate-[fade-in_0.5s_ease-out_0.4s_both]">
              <h4 className="text-md font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div className="animate-[fade-in_0.5s_ease-out_0.5s_both]">
              <h4 className="text-md font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Email: info@atccas-tmis.com</li>
                <li>Phone: (123) 456-7890</li>
                <li>Address: 123 Main St, Anytown</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400 animate-[fade-in_0.5s_ease-out_0.6s_both]">
            <p>© {new Date().getFullYear()} TMIS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
