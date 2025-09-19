import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Users, 
  LogOut,
  AlertTriangle,
  UserCheck,
  UserX,
  Video,
  RefreshCw
} from 'lucide-react';

interface Appointment {
  id: string;
  appointmentTime: string;
  symptoms: string;
  status: string;
  patient: { user: { firstName: string; lastName: string; phone: string; email: string } };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const DoctorDashboard: React.FC = () => {
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [historyStatus, setHistoryStatus] = useState<string>('');
  const [historyLimit, setHistoryLimit] = useState<number>(20);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAppointmentsAndStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch current user (for greeting)
      const userRes = await api.get('/api/auth/me');
      setUser(userRes.data);

      // Fetch current doctor's availability
      try {
        const profileRes = await api.get('/api/doctors/me');
        if (typeof profileRes.data?.isAvailable === 'boolean') {
          setIsAvailable(profileRes.data.isAvailable);
        }
      } catch (e) {
        // ignore profile fetch error, leave default
      }

      // Fetch pending appointments
      const pendingRes = await api.get('/api/appointments/pending');
      setPendingAppointments(pendingRes.data);

      // For today's confirmed appointments, we'd ideally have a separate endpoint or filter more robustly.
      // For now, let's assume a simple filter on all confirmed for today.
      // This part might need refinement depending on backend capabilities.
      const todaysConfirmedRes = await api.get('/api/appointments/today-confirmed');
      setTodaysAppointments(todaysConfirmedRes.data);

      // Initial fetch for appointment history with default filters
      await fetchHistory();

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    const params: any = {};
    if (historyStatus) params.status = historyStatus;
    if (historyLimit) params.limit = historyLimit;
    const historyRes = await api.get('/api/appointments/history', { params });
    setHistory(historyRes.data);
  };

  useEffect(() => {
    fetchAppointmentsAndStatus();
  }, [navigate]);

  const handleStatusToggle = async () => {
    const newStatus = !isAvailable;
    try {
      await api.put('/api/doctors/me/status', { isAvailable: newStatus });
      setIsAvailable(newStatus);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update availability');
      console.error(err);
    }
  };

  const handleAppointmentAction = async (appointmentId: string, action: 'approve' | 'reject') => {
    try {
      await api.put(`/api/appointments/${appointmentId}/${action}`);
      alert(`Appointment ${action}d successfully!`);
      fetchAppointmentsAndStatus(); // Refresh data
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${action} appointment`);
      console.error(err);
    }
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-blue-50/30 to-green-50/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading your dashboard...</p>
        <p className="text-muted-foreground text-sm mt-2">Please wait while we prepare your medical data</p>
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
              <h1 className="text-xl font-bold">Doctor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, Dr. {user?.lastName}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <label htmlFor="availability-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    id="availability-toggle" 
                    className="sr-only" 
                    checked={isAvailable} 
                    onChange={handleStatusToggle} 
                  />
                  <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ${isAvailable ? 'bg-primary' : 'bg-muted'}`}></div>
                  <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform duration-300 ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
                <span className="ml-2 text-sm font-medium">
                  {isAvailable ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" />Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <UserX className="h-3 w-3" />Unavailable
                    </Badge>
                  )}
                </span>
              </label>
            </div>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{pendingAppointments.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Today's Confirmed</p>
                <p className="text-2xl font-bold">{todaysAppointments.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Today</p>
                <p className="text-2xl font-bold">{pendingAppointments.length + todaysAppointments.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total History</p>
                <p className="text-2xl font-bold">{history.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Pending Appointment Requests</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                    <p className="text-muted-foreground">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <Card key={appointment.id} className="p-4 border-yellow-200 bg-yellow-50/50">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {appointment.patient.user.firstName} {appointment.patient.user.lastName}
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
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleAppointmentAction(appointment.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleAppointmentAction(appointment.id, 'reject')}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/consultation/${appointment.id}`}>
                                <Video className="mr-1 h-3 w-3" />
                                Start
                              </Link>
                            </Button>
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
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto p-4" 
                  onClick={handleStatusToggle}
                >
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 mr-3">
                      {isAvailable ? <UserCheck className="h-5 w-5 text-blue-600" /> : <UserX className="h-5 w-5 text-blue-600" />}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Toggle Availability</p>
                      <p className="text-sm text-muted-foreground">
                        Currently {isAvailable ? 'Available' : 'Unavailable'}
                      </p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Appointment History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-2xl">Appointment History</CardTitle>
              <div className="flex items-center gap-3">
                <select
                  value={historyStatus}
                  onChange={(e) => setHistoryStatus(e.target.value)}
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={historyLimit}
                  onChange={(e) => setHistoryLimit(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="w-24 border border-input rounded-md px-3 py-2 text-sm bg-background"
                  placeholder="Limit"
                />
                <Button size="sm" onClick={fetchHistory}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Apply
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No history records</h3>
                <p className="text-muted-foreground">Adjust filters to view more records</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((appointment) => (
                  <Card key={appointment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {appointment.patient.user.firstName} {appointment.patient.user.lastName}
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
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/consultation/${appointment.id}`}>
                          <Video className="mr-2 h-4 w-4" />
                          Open
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Confirmed Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Today's Confirmed Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No confirmed appointments today</h3>
                <p className="text-muted-foreground">Newly confirmed appointments will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysAppointments.map((appointment) => (
                  <Card key={appointment.id} className="p-4 border-blue-200 bg-blue-50/50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                          </h3>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          {new Date(appointment.appointmentTime).toLocaleTimeString()}
                        </div>
                        <div className="flex items-start text-sm">
                          <Activity className="mr-2 h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{appointment.symptoms}</span>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link to={`/consultation/${appointment.id}`}>
                          <Video className="mr-2 h-4 w-4" />
                          Start
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DoctorDashboard;
