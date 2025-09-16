<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Users, 
  UserCheck, 
  Shield, 
  AlertTriangle,
  LogOut,
  Settings,
  BarChart3,
  Database,
  Activity,
  Clock,
  CheckCircle,
  FileText,
  UserPlus,
  Search
} from 'lucide-react';

interface User {
=======
import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';

interface DoctorItem {
  id: string;
  specialization: string;
  experienceYears: number;
  qualifications: string;
  isAvailable: boolean;
  user: { id: string; firstName: string; lastName: string; email: string; phone: string };
}

interface PharmacyItem {
  id: string;
  name: string;
  address: string;
}

interface OverviewCounts {
  users: number;
  doctors: number;
  pharmacists: number;
  pharmacies: number;
  patients?: number;
}

type StatusBreakdown = {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
};

interface BookingPerDoctor {
  doctorId: string;
  name: string;
  email: string;
  total: number;
  statusBreakdown: StatusBreakdown;
}

interface BookingPerUser {
  patientId: string;
  name: string;
  email: string;
  total: number;
  statusBreakdown: StatusBreakdown;
}

interface AppointmentsSummary {
  totals: { total: number; pending: number; confirmed: number; completed: number; cancelled: number };
  bookingsPerDoctor: BookingPerDoctor[];
  bookingsPerUser: BookingPerUser[];
  recentAppointments: any[];
}

interface PharmacistItem {
>>>>>>> c3e3419378a6f0adb991f5e7117639f4ed97f144
  id: string;
  firstName: string;
  lastName: string;
  email: string;
<<<<<<< HEAD
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user data
        const userResponse = await api.get('/api/auth/me');
        setUser(userResponse.data);

      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-blue-50/30 to-green-50/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading admin dashboard...</p>
        <p className="text-muted-foreground text-sm mt-2">Please wait while we prepare system data</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-blue-50/30 to-green-50/30 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-green-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.firstName}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Administrator
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* System Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Doctors</p>
                <p className="text-2xl font-bold">89</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Daily Appointments</p>
                <p className="text-2xl font-bold">156</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold text-green-600">99.9%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">User Management</CardTitle>
                <CardDescription>Manage system users and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User management interface</h3>
                  <p className="text-muted-foreground mb-6">View and manage all system users</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Search Users
                    </Button>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start h-auto p-4" asChild>
                  <Link to="/admin/users">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 mr-3">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Manage Users</p>
                        <p className="text-sm text-muted-foreground">Add, edit, or remove users</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-4" asChild>
                  <Link to="/admin/reports">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 mr-3">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">System Reports</p>
                        <p className="text-sm text-muted-foreground">View analytics and reports</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-4" asChild>
                  <Link to="/admin/settings">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 mr-3">
                        <Settings className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">System Settings</p>
                        <p className="text-sm text-muted-foreground">Configure system parameters</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-4" asChild>
                  <Link to="/admin/database">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 mr-3">
                        <Database className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Database Management</p>
                        <p className="text-sm text-muted-foreground">Monitor database health</p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 mr-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-green-900">System Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">Server Status</span>
                    <Badge variant="success">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">Database</span>
                    <Badge variant="success">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-800">Last Backup</span>
                    <span className="text-xs text-green-600">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
                <p className="text-muted-foreground">System activities and logs will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">System Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-6">View detailed system metrics and usage statistics</p>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Full Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
=======
  phone: string;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [pharmacies, setPharmacies] = useState<PharmacyItem[]>([]);
  const [pharmacists, setPharmacists] = useState<PharmacistItem[]>([]);
  const [overview, setOverview] = useState<OverviewCounts | null>(null);
  const [summary, setSummary] = useState<AppointmentsSummary | null>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch admin overview, doctors, pharmacies and appointment summary in parallel
      const [overviewRes, doctorsRes, pharmaciesRes, summaryRes, pharmacistsRes] = await Promise.all([
        api.get('/api/admin/overview'),
        api.get('/api/admin/doctors'),
        api.get('/api/pharmacies'),
        api.get('/api/admin/appointments/summary'),
        api.get('/api/admin/pharmacists'),
      ]);

      setOverview(overviewRes.data || null);
      setDoctors(doctorsRes.data || []);
      setPharmacies(pharmaciesRes.data || []);
      setSummary(summaryRes.data || null);
      setPharmacists(pharmacistsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(d =>
      `${d.user.firstName} ${d.user.lastName}`.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q)
    );
  }, [search, doctors]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-2">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button onClick={loadData} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-2 rounded-lg mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm">Manage and monitor the platform overview</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/book-appointment" className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">Book Appointment</Link>
            <Link to="/pharmacy-locator" className="px-3 py-2 rounded-md border text-sm font-medium text-gray-700 hover:bg-gray-50">Pharmacy Locator</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Doctors</p>
                <p className="text-2xl font-bold text-gray-900">{overview?.doctors ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Patients</p>
                <p className="text-2xl font-bold text-gray-900">{overview?.patients ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pharmacies</p>
                <p className="text-2xl font-bold text-gray-900">{overview?.pharmacies ?? pharmacies.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.totals.pending ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confirmed Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.totals.confirmed ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Bookings per Doctor</h2>
              <p className="text-sm text-gray-600">Total and status-wise distribution</p>
            </div>
            <div className="p-6 overflow-x-auto">
              {!summary || summary.bookingsPerDoctor.length === 0 ? (
                <div className="text-gray-600">No booking data available.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.bookingsPerDoctor.map((b) => (
                      <tr key={b.doctorId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{b.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.total}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.statusBreakdown.pending}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.statusBreakdown.confirmed}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.statusBreakdown.cancelled}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.statusBreakdown.completed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Bookings per Patient</h2>
              <p className="text-sm text-gray-600">Total and status-wise distribution</p>
            </div>
            <div className="p-6 overflow-x-auto">
              {!summary || summary.bookingsPerUser.length === 0 ? (
                <div className="text-gray-600">No booking data available.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cancelled</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.bookingsPerUser.map((b) => (
                      <tr key={b.patientId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{b.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.total}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.statusBreakdown.pending}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.statusBreakdown.confirmed}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.statusBreakdown.cancelled}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{b.statusBreakdown.completed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Doctors table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Available Doctors</h2>
              <p className="text-sm text-gray-600">Showing doctors currently available for booking</p>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialization..."
              className="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="p-6 overflow-x-auto">
            {filteredDoctors.length === 0 ? (
              <div className="text-center text-gray-600 py-12">No doctors match your search.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDoctors.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">Dr. {d.user.firstName} {d.user.lastName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{d.specialization}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{d.experienceYears} yrs</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{d.user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Link to="/book-appointment" className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700">Book</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pharmacists list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pharmacists</h2>
            <p className="text-sm text-gray-600">Registered pharmacists on the platform</p>
          </div>
          <div className="p-6 overflow-x-auto">
            {pharmacists.length === 0 ? (
              <div className="text-gray-600">No pharmacists found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pharmacists.map((ph) => (
                    <tr key={ph.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{ph.firstName} {ph.lastName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{ph.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{ph.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pharmacies list */
        }
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Pharmacies</h2>
            <p className="text-sm text-gray-600">Registered pharmacies on the platform</p>
          </div>
          <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pharmacies.length === 0 ? (
              <div className="text-gray-600">No pharmacies found.</div>
            ) : (
              pharmacies.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900">{p.name}</div>
                  <div className="text-sm text-gray-700">{p.address}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
>>>>>>> c3e3419378a6f0adb991f5e7117639f4ed97f144
    </div>
  );
};

export default AdminDashboard;
