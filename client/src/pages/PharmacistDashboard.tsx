import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, ChevronDown, LogOut, Package, Users, Activity, Clock, CheckCircle, XCircle, Pill, AlertTriangle, MapPin, Home, BarChart3 } from 'lucide-react';
import LocationSetup from '../components/pharmacist/LocationSetup';
import InventoryManagement from '../components/pharmacist/InventoryManagement';
import ProfileManagement from '../components/pharmacist/ProfileManagement';

interface PharmacistData {
  name: string;
  pharmacy: string;
  email: string;
}

interface InventoryItem {
  stockId: string;
  medicineId: string;
  name: string;
  genericName?: string | null;
  status: string; // StockStatus
  totalQuantity: number;
  soonestExpiry: string | null;
}

interface LowStockAlertResponse {
  lowStock: Array<{ id: string; stockStatus: string; medicine: { name: string; genericName?: string | null } }>;
  expiringSoon: Array<{ id: string; expiryDate: string; medicine: { name: string; genericName?: string | null } }>;
}

interface PrescriptionItem {
  id: string;
  status: 'PENDING' | 'DISPENSED';
  createdAt: string;
  patient: { user: { firstName: string; lastName: string; email: string } };
  doctor: { user: { firstName: string; lastName: string; email: string } };
  items: Array<{ medicine: { id: string; name: string; genericName?: string | null }; dosageInstructions: string }>;
}

const PharmacistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pharmacistData, setPharmacistData] = useState<PharmacistData>({
    name: '',
    pharmacy: 'Your Pharmacy',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlertResponse | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'location' | 'profile'>('dashboard');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await api.get('/api/auth/me');
      if (me.data?.role !== 'PHARMACIST') {
        navigate('/unauthorized');
        return;
      }
      const fullName = [me.data.firstName, me.data.lastName].filter(Boolean).join(' ');
      setPharmacistData({
        name: fullName || 'Pharmacist',
        pharmacy: 'Your Pharmacy',
        email: me.data.email || '',
      });

      const [invRes, alertsRes, rxRes] = await Promise.all([
        api.get('/api/pharmacy/inventory'),
        api.get('/api/pharmacy/alerts/low-stock'),
        api.get('/api/pharmacy/prescriptions', { params: { status: 'PENDING' } }),
      ]);

      setInventory(invRes.data);
      setAlerts(alertsRes.data);
      setPrescriptions(rxRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load pharmacist data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacistData = async () => {
    await loadData();
  };

  useEffect(() => {
    fetchPharmacistData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getRxStatusBadge = (status: PrescriptionItem['status']) => {
    switch (status) {
      case 'PENDING': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'DISPENSED': return <Badge className="bg-green-100 text-green-800">Dispensed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const markPrescription = async (id: string, status: 'PENDING' | 'DISPENSED') => {
    try {
      await api.patch(`/api/pharmacy/prescriptions/${id}/status`, { status });
      await loadData();
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to update prescription status');
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Pharmacist Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{pharmacistData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{pharmacistData.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{pharmacistData.name}</div>
                      <div className="text-gray-500">{pharmacistData.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Home className="inline-block w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="inline-block w-4 h-4 mr-2" />
                Inventory
              </button>
              <button
                onClick={() => setActiveTab('location')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'location'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MapPin className="inline-block w-4 h-4 mr-2" />
                Location Setup
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="inline-block w-4 h-4 mr-2" />
                Profile
              </button>
            </nav>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-primary"></div>
          </div>
        )}
        {error && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" /> Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-600">{error}</p>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{prescriptions.filter(p => p.status === 'PENDING').length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting dispense</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inventory.length}</div>
                  <p className="text-xs text-muted-foreground">Tracked medicines</p>
                </CardContent>
              </Card>
              
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low/Out of Stock</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts ? alerts.lowStock.length : 0}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon (30d)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts ? alerts.expiringSoon.length : 0}</div>
              <p className="text-xs text-muted-foreground">Check batches</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No pending prescriptions</div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium">
                            {rx.patient.user.firstName} {rx.patient.user.lastName}
                          </h3>
                          {getRxStatusBadge(rx.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Prescribed by Dr. {rx.doctor.user.firstName} {rx.doctor.user.lastName}
                        </div>
                        <ul className="text-sm list-disc list-inside">
                          {rx.items.map((it, idx) => (
                            <li key={idx}>
                              {it.medicine.name}
                              {it.medicine.genericName ? ` (${it.medicine.genericName})` : ''} – {it.dosageInstructions}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col gap-2">
                        {rx.status === 'PENDING' ? (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => markPrescription(rx.id, 'DISPENSED')}>
                            <CheckCircle className="h-4 w-4 mr-1" /> Mark Dispensed
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => markPrescription(rx.id, 'PENDING')}>
                            <XCircle className="h-4 w-4 mr-1" /> Mark Pending
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </> 
    )}
    {activeTab === 'inventory' && (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <InventoryManagement />
      </div>
    )}
    {activeTab === 'location' && (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <LocationSetup />
      </div>
    )}
    {activeTab === 'profile' && (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <ProfileManagement />
      </div>
    )}
      </main>
    </div>
  );
};

export default PharmacistDashboard;
