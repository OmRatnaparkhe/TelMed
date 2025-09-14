import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

interface InventoryItem {
  stockId: string;
  medicineId: string;
  name: string;
  genericName: string;
  status: StockStatus;
  totalQuantity: number;
  soonestExpiry: string | null;
}

interface LowStockAlertItem {
  id: string;
  stockStatus: StockStatus;
  medicine: { id: string; name: string; genericName: string };
}

interface ExpiringBatchItem {
  id: string;
  medicine: { id: string; name: string; genericName: string };
  expiryDate: string;
  quantity: number;
}

interface PrescriptionItem {
  id: string;
  medicine: { id: string; name: string; genericName: string };
  quantity: number;
  instructions?: string;
}

interface Prescription {
  id: string;
  status: 'PENDING' | 'DISPENSED';
  createdAt: string;
  patient: { user: { firstName: string; lastName: string; email: string } };
  doctor: { user: { firstName: string; lastName: string; email: string } };
  items: PrescriptionItem[];
}

const PharmacistDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'prescriptions' | 'alerts'>('inventory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'ALL'>('ALL');
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [batchForm, setBatchForm] = useState({ medicineId: '', batchNumber: '', quantity: 0, expiryDate: '' });

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionStatus, setPrescriptionStatus] = useState<'ALL' | 'PENDING' | 'DISPENSED'>('ALL');

  // Alerts state
  const [lowStock, setLowStock] = useState<LowStockAlertItem[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<ExpiringBatchItem[]>([]);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<InventoryItem[]>('/api/pharmacy/inventory', {
        params: {
          search: search || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
        },
      });
      setInventory(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load inventory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    setError(null);
    try {
      const res = await api.get<{ lowStock: LowStockAlertItem[]; expiringSoon: any[] }>('/api/pharmacy/alerts/low-stock');
      setLowStock(res.data.lowStock || []);
      // Map expiringSoon to a typed structure
      const exp = (res.data.expiringSoon || []).map((b: any) => ({
        id: b.id,
        medicine: b.medicine,
        expiryDate: b.expiryDate,
        quantity: b.quantity,
      }));
      setExpiringSoon(exp);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load alerts');
    }
  };

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Prescription[]>('/api/pharmacy/prescriptions', {
        params: prescriptionStatus === 'ALL' ? undefined : { status: prescriptionStatus },
      });
      setPrescriptions(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load prescriptions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    } else if (activeTab === 'alerts') {
      fetchAlerts();
    } else if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const filteredInventory = useMemo(() => {
    const term = search.trim().toLowerCase();
    return inventory.filter((s) => {
      const matchesTerm = !term || s.name.toLowerCase().includes(term) || (s.genericName || '').toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  const handleUpdateStatus = async (stockId: string, newStatus: StockStatus) => {
    setUpdating((u) => ({ ...u, [stockId]: true }));
    setError(null);
    try {
      await api.put(`/api/pharmacy/stock/${stockId}`, { stockStatus: newStatus });
      setInventory((prev) => prev.map((item) => (item.stockId === stockId ? { ...item, status: newStatus } : item)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update stock status');
      console.error(err);
    } finally {
      setUpdating((u) => ({ ...u, [stockId]: false }));
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/api/pharmacy/batches', batchForm);
      setShowAddBatch(false);
      setBatchForm({ medicineId: '', batchNumber: '', quantity: 0, expiryDate: '' });
      // refresh inventory
      fetchInventory();
      // refresh alerts (expiry might change)
      fetchAlerts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create batch');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading pharmacist dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-amber-600 p-2 rounded-lg mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h6v6M12 7h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pharmacist Dashboard</h1>
              <p className="text-gray-600 text-sm">Manage inventory, prescriptions and alerts</p>
            </div>
          </div>
          <div>
            <button onClick={() => {
              if (activeTab === 'inventory') fetchInventory();
              if (activeTab === 'alerts') fetchAlerts();
              if (activeTab === 'prescriptions') fetchPrescriptions();
            }} className="px-3 py-2 rounded-md bg-amber-600 text-white text-sm font-medium hover:bg-amber-700">Refresh</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex gap-2">
            <button className={`px-3 py-1.5 rounded-md text-sm ${activeTab==='inventory' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-800'}`} onClick={() => setActiveTab('inventory')}>Inventory</button>
            <button className={`px-3 py-1.5 rounded-md text-sm ${activeTab==='prescriptions' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-800'}`} onClick={() => setActiveTab('prescriptions')}>Prescriptions</button>
            <button className={`px-3 py-1.5 rounded-md text-sm ${activeTab==='alerts' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-800'}`} onClick={() => setActiveTab('alerts')}>Alerts</button>
          </div>

          {activeTab === 'inventory' && (
          <>
          <div className="p-6 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicine by name or generic name..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="ALL">All statuses</option>
                <option value="IN_STOCK">In stock</option>
                <option value="LOW_STOCK">Low stock</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
              </select>
            </div>
            <div className="flex items-center md:justify-end gap-2">
              <button onClick={fetchInventory} className="px-3 py-2 rounded-md bg-gray-800 text-white text-sm font-medium hover:bg-gray-900">Search</button>
              <button onClick={() => setShowAddBatch(true)} className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">Add Batch</button>
            </div>
          </div>

          <div className="p-6 overflow-x-auto">
            {filteredInventory.length === 0 ? (
              <div className="text-center text-gray-600 py-12">No stock items found.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generic</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Soonest Expiry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item) => (
                    <tr key={item.stockId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{item.genericName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{item.totalQuantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{item.soonestExpiry ? new Date(item.soonestExpiry).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          disabled={!!updating[item.stockId]}
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.stockId, e.target.value as StockStatus)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="IN_STOCK">In stock</option>
                          <option value="LOW_STOCK">Low stock</option>
                          <option value="OUT_OF_STOCK">Out of stock</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          disabled={!!updating[item.stockId]}
                          onClick={() => handleUpdateStatus(item.stockId, item.status)}
                          className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                        >
                          {updating[item.stockId] ? 'Saving...' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          </>
          )}

          {activeTab === 'prescriptions' && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <select value={prescriptionStatus} onChange={(e) => setPrescriptionStatus(e.target.value as any)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="ALL">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="DISPENSED">Dispensed</option>
                </select>
                <button onClick={fetchPrescriptions} className="px-3 py-2 rounded-md bg-gray-800 text-white text-sm font-medium hover:bg-gray-900">Filter</button>
              </div>
              {prescriptions.length === 0 ? (
                <div className="text-gray-600">No prescriptions found.</div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((p) => (
                    <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">{new Date(p.createdAt).toLocaleString()} · Dr. {p.doctor.user.firstName} {p.doctor.user.lastName} → {p.patient.user.firstName} {p.patient.user.lastName}</div>
                        <div>
                          <select value={p.status} onChange={async (e) => {
                            const newStatus = e.target.value as 'PENDING' | 'DISPENSED';
                            try {
                              await api.patch(`/api/pharmacy/prescriptions/${p.id}/status`, { status: newStatus });
                              setPrescriptions((prev) => prev.map((x) => x.id === p.id ? { ...x, status: newStatus } : x));
                            } catch (err: any) {
                              setError(err.response?.data?.error || 'Failed to update prescription');
                            }
                          }} className="border border-gray-300 rounded-lg px-2 py-1 text-sm">
                            <option value="PENDING">Pending</option>
                            <option value="DISPENSED">Dispensed</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-2">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Generic</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {p.items.map((it) => (
                              <tr key={it.id}>
                                <td className="px-3 py-2">{it.medicine.name}</td>
                                <td className="px-3 py-2">{it.medicine.genericName}</td>
                                <td className="px-3 py-2">{it.quantity}</td>
                                <td className="px-3 py-2">{it.instructions || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div className="border border-amber-200 rounded-lg">
                <div className="p-4 border-b bg-amber-50 text-amber-800 font-semibold">Low / Out of Stock</div>
                <div className="p-4 space-y-2 max-h-80 overflow-auto">
                  {lowStock.length === 0 ? (
                    <div className="text-gray-600">No low stock items.</div>
                  ) : lowStock.map((s) => (
                    <div key={s.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{s.medicine.name}</div>
                        <div className="text-sm text-gray-600">{s.medicine.genericName}</div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-amber-600 text-white">{s.stockStatus.replace('_',' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-red-200 rounded-lg">
                <div className="p-4 border-b bg-red-50 text-red-800 font-semibold">Expiring Soon (30 days)</div>
                <div className="p-4 space-y-2 max-h-80 overflow-auto">
                  {expiringSoon.length === 0 ? (
                    <div className="text-gray-600">No expiring batches.</div>
                  ) : expiringSoon.map((b) => (
                    <div key={b.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{b.medicine.name}</div>
                        <div className="text-sm text-gray-600">Qty: {b.quantity}</div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-red-600 text-white">{new Date(b.expiryDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Batch Modal */}
        {showAddBatch && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-4 border-b font-semibold">Add Batch</div>
              <form onSubmit={handleCreateBatch} className="p-4 space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Medicine ID</label>
                  <input value={batchForm.medicineId} onChange={(e) => setBatchForm({ ...batchForm, medicineId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" placeholder="medicineId" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Batch Number</label>
                  <input value={batchForm.batchNumber} onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Quantity</label>
                    <input type="number" value={batchForm.quantity} onChange={(e) => setBatchForm({ ...batchForm, quantity: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm" min={1} required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Expiry Date</label>
                    <input type="date" value={batchForm.expiryDate} onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddBatch(false)} className="px-3 py-2 rounded-md border text-sm">Cancel</button>
                  <button type="submit" className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacistDashboard;
