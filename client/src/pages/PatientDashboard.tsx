import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Heart, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity, 
  FileText, 
  MapPin, 
  QrCode, 
  LogOut,
  Plus,
  AlertTriangle
} from 'lucide-react';

interface Appointment {
  id: string;
  appointmentTime: string;
  symptoms: string;
  status: string;
  doctor: { user: { firstName: string; lastName: string } };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const PatientDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
        if (userResponse.data?.role && userResponse.data.role !== 'PATIENT') {
          navigate('/unauthorized');
          return;
        }

        // Fetch appointments
        try {
          const appointmentsResponse = await api.get('/api/appointments/my-appointments');
          setAppointments(appointmentsResponse.data);
        } catch (e: any) {
          const msg = e?.response?.data?.error || '';
          if (e?.response?.status === 404 && msg.includes('Patient profile not found')) {
            // Gracefully handle missing patient profile by showing empty state
            setAppointments([]);
          } else {
            throw e; // let outer catch handle other errors
          }
        }

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': 
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'CONFIRMED': 
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Confirmed</Badge>;
      case 'COMPLETED': 
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>;
      case 'CANCELLED': 
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Cancelled</Badge>;
      default: 
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-blue-50/30 to-green-50/30 p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading your dashboard...</p>
        <p className="text-muted-foreground text-sm mt-2">Please wait while we prepare your health data</p>
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
        <div className="container flex items-center justify-between min-h-16 py-2">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">TelMed Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Welcome back, {user?.firstName}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Your Patient QR Code</DialogTitle>
                  <DialogDescription>
                    Show this QR code to healthcare providers for quick identification
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center p-6">
                  {user && <QRCodeSVG value={user.id} size={200} level="H" includeMargin={true} />}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <p className="text-2xl font-bold">{appointments.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold">{appointments.filter(apt => apt.status === 'CONFIRMED').length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{appointments.filter(apt => apt.status === 'PENDING').length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{appointments.filter(apt => apt.status === 'COMPLETED').length}</p>
              </div>
            </CardContent>
          </Card>
          </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointments Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Your Appointments</CardTitle>
                  <Button asChild>
                    <Link to="/book-appointment">
                      <Plus className="mr-2 h-4 w-4" />
                      Book New
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
                    <p className="text-muted-foreground mb-6">Book your first appointment to get started with healthcare services</p>
                    <Button asChild>
                      <Link to="/book-appointment">
                        <Plus className="mr-2 h-4 w-4" />
                        Book Your First Appointment
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <Card key={appointment.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
                              </h3>
                              {getStatusBadge(appointment.status)}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="mr-2 h-4 w-4" />
                              {new Date(appointment.appointmentTime).toLocaleString()}
                            </div>
                            <div className="flex items-start text-sm">
                              <Activity className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                              <span>{appointment.symptoms}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start h-auto p-4" asChild>
                  <Link to="/symptom-checker">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 mr-3">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">AI Symptom Checker</p>
                        <p className="text-sm text-muted-foreground">Get instant health insights</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-4" asChild>
                  <Link to="/medical-history">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 mr-3">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Medical History</p>
                        <p className="text-sm text-muted-foreground">View your records</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto p-4" asChild>
                  <Link to="/pharmacy-locator">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 mr-3">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Find Pharmacy</p>
                        <p className="text-sm text-muted-foreground">Locate nearby pharmacies</p>
                      </div>
                    </div>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 mr-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <CardTitle className="text-destructive">Emergency Contact</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">In case of medical emergency, call:</p>
                <p className="text-2xl font-bold text-destructive">112</p>
                <p className="text-xs text-muted-foreground mt-2">Available 24/7 for immediate assistance</p>
              </CardContent>
            </Card>
          
        </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
