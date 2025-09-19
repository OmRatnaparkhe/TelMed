import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BarChart3, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SummaryResponse {
  totals: { total: number; pending: number; confirmed: number; completed: number; cancelled: number };
  bookingsPerDoctor: Array<{ doctorId: string; name: string; email: string; total: number; statusBreakdown: { pending: number; confirmed: number; completed: number; cancelled: number } }>;
  bookingsPerUser: Array<{ patientId: string; name: string; email: string; total: number; statusBreakdown: { pending: number; confirmed: number; completed: number; cancelled: number } }>;
  recentAppointments: Array<{ id: string; appointmentTime: string; status: string; patient: { user: { firstName: string; lastName: string } }; doctor: { user: { firstName: string; lastName: string } } }>;
}

const AdminReports: React.FC = () => {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/admin/appointments/summary');
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'CONFIRMED': return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Confirmed</Badge>;
      case 'COMPLETED': return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>;
      case 'CANCELLED': return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Cancelled</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-green-50/30">
      <main className="container py-8 space-y-8">
        {/* Mobile Back to Admin */}
        <div className="sm:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6" /> Admin Reports</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appointments Summary</CardTitle>
            <CardDescription>Overall counts and breakdowns</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-muted border-t-primary mx-auto mb-3"></div>
                <p>Loading reports...</p>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-destructive mb-4">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {data && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{data.totals.total}</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold">{data.totals.pending}</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Confirmed</p><p className="text-2xl font-bold">{data.totals.confirmed}</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">{data.totals.completed}</p></CardContent></Card>
                  <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Cancelled</p><p className="text-2xl font-bold">{data.totals.cancelled}</p></CardContent></Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bookings per Doctor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="py-2 px-3">Doctor</th>
                              <th className="py-2 px-3">Email</th>
                              <th className="py-2 px-3">Total</th>
                              <th className="py-2 px-3">Pending</th>
                              <th className="py-2 px-3">Confirmed</th>
                              <th className="py-2 px-3">Completed</th>
                              <th className="py-2 px-3">Cancelled</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.bookingsPerDoctor.map((d) => (
                              <tr key={d.doctorId} className="border-b hover:bg-muted/30">
                                <td className="py-2 px-3">{d.name}</td>
                                <td className="py-2 px-3">{d.email}</td>
                                <td className="py-2 px-3">{d.total}</td>
                                <td className="py-2 px-3">{d.statusBreakdown.pending}</td>
                                <td className="py-2 px-3">{d.statusBreakdown.confirmed}</td>
                                <td className="py-2 px-3">{d.statusBreakdown.completed}</td>
                                <td className="py-2 px-3">{d.statusBreakdown.cancelled}</td>
                              </tr>
                            ))}
                            {data.bookingsPerDoctor.length === 0 && (
                              <tr><td className="py-6 px-3 text-center text-muted-foreground" colSpan={7}>No data</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Bookings per Patient</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="py-2 px-3">Patient</th>
                              <th className="py-2 px-3">Email</th>
                              <th className="py-2 px-3">Total</th>
                              <th className="py-2 px-3">Pending</th>
                              <th className="py-2 px-3">Confirmed</th>
                              <th className="py-2 px-3">Completed</th>
                              <th className="py-2 px-3">Cancelled</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.bookingsPerUser.map((p) => (
                              <tr key={p.patientId} className="border-b hover:bg-muted/30">
                                <td className="py-2 px-3">{p.name}</td>
                                <td className="py-2 px-3">{p.email}</td>
                                <td className="py-2 px-3">{p.total}</td>
                                <td className="py-2 px-3">{p.statusBreakdown.pending}</td>
                                <td className="py-2 px-3">{p.statusBreakdown.confirmed}</td>
                                <td className="py-2 px-3">{p.statusBreakdown.completed}</td>
                                <td className="py-2 px-3">{p.statusBreakdown.cancelled}</td>
                              </tr>
                            ))}
                            {data.bookingsPerUser.length === 0 && (
                              <tr><td className="py-6 px-3 text-center text-muted-foreground" colSpan={7}>No data</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.recentAppointments.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">No recent appointments</div>
                    ) : (
                      <div className="space-y-3">
                        {data.recentAppointments.map(a => (
                          <div key={a.id} className="p-3 rounded border flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">{a.patient.user.firstName} {a.patient.user.lastName} → Dr. {a.doctor.user.firstName} {a.doctor.user.lastName}</div>
                              <div className="text-xs text-muted-foreground">{new Date(a.appointmentTime).toLocaleString()}</div>
                            </div>
                            {getStatusBadge(a.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminReports;
