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
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
    </div>
  );
};

export default AdminDashboard;
