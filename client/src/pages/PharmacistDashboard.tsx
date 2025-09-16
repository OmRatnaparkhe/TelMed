import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, ChevronDown, LogOut, Package, Users, Activity, Clock } from 'lucide-react';

interface PharmacistData {
  name: string;
  pharmacy: string;
  license: string;
  email: string;
}

interface Order {
  id: string;
  patientName: string;
  medication: string;
  status: 'pending' | 'processing' | 'ready' | 'completed';
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

const PharmacistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pharmacistData, setPharmacistData] = useState<PharmacistData>({
    name: 'Yogiraj',
    pharmacy: 'Your Pharmacy',
    license: '',
    email: '',
  });
  const [showDropdown, setShowDropdown] = useState(false);

  // Mock data for recent orders
  const recentOrders: Order[] = [
    {
      id: '1',
      patientName: 'John Doe',
      medication: 'Amoxicillin 500mg',
      status: 'pending',
      timestamp: '2024-01-15 10:30 AM',
      priority: 'high'
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      medication: 'Lisinopril 10mg',
      status: 'processing',
      timestamp: '2024-01-15 09:45 AM',
      priority: 'medium'
    },
    {
      id: '3',
      patientName: 'Mike Johnson',
      medication: 'Metformin 850mg',
      status: 'ready',
      timestamp: '2024-01-15 08:20 AM',
      priority: 'low'
    }
  ];

  const fetchPharmacistData = async () => {
    try {
      // First try to get data from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const userRole = user.role || user.user?.role;
        if (userRole === 'PHARMACIST' || userRole === 'pharmacist') {
          const firstName = user.firstName || user.user?.firstName || 'Yogiraj';
          const lastName = user.lastName || user.user?.lastName || '';
          const fullName = lastName ? `${firstName} ${lastName}` : firstName;
          
          setPharmacistData({
            name: fullName,
            pharmacy: user.pharmacyName || user.user?.pharmacyName || 'Your Pharmacy',
            license: user.licenseNumber || user.user?.licenseNumber || '',
            email: user.email || user.user?.email || '',
          });
          return;
        }
      }

      // If no localStorage data, try to fetch from API
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const user = await response.json();
            const userRole = user.role || user.user?.role;
            if (userRole === 'PHARMACIST' || userRole === 'pharmacist') {
              const firstName = user.firstName || user.user?.firstName || 'Yogiraj';
              const lastName = user.lastName || user.user?.lastName || '';
              const fullName = lastName ? `${firstName} ${lastName}` : firstName;
              
              setPharmacistData({
                name: fullName,
                pharmacy: user.pharmacyName || user.user?.pharmacyName || 'Your Pharmacy',
                license: user.licenseNumber || user.user?.licenseNumber || '',
                email: user.email || user.user?.email || '',
              });
              return;
            }
          }
        } catch (apiError) {
          console.log('API call failed, using fallback');
        }
      }

      // Fallback data - use Yogiraj as requested
      setPharmacistData({
        name: 'Yogiraj',
        pharmacy: 'Your Pharmacy',
        license: '',
        email: '',
      });
      
    } catch (error) {
      console.error('Error fetching pharmacist data:', error);
      // Final fallback
      setPharmacistData({
        name: 'Yogiraj',
        pharmacy: 'Your Pharmacy',
        license: '',
        email: '',
      });
    }
  };

  useEffect(() => {
    fetchPharmacistData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">+5 new this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">+12% from yesterday</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15m</div>
              <p className="text-xs text-muted-foreground">-3m from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{order.patientName}</span>
                      <Badge className={getPriorityColor(order.priority)}>
                        {order.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{order.medication}</p>
                    <p className="text-xs text-gray-500">{order.timestamp}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">Recent prescription verifications and activities will appear here</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PharmacistDashboard;
