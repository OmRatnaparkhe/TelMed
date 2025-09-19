import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, ArrowLeft } from 'lucide-react';

interface AdminUserItem {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-green-50/30">
      <main className="container py-8 space-y-6">
        {/* Mobile Back to Admin */}
        <div className="sm:hidden">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-muted border-t-primary mx-auto mb-3"></div>
                <p>Loading users...</p>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-destructive mb-4">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">Role</th>
                      <th className="py-2 px-3">Phone</th>
                      <th className="py-2 px-3">Created</th>
                      <th className="py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b hover:bg-muted/30">
                        <td className="py-2 px-3">{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</td>
                        <td className="py-2 px-3">{u.email}</td>
                        <td className="py-2 px-3">{u.role}</td>
                        <td className="py-2 px-3">{u.phone || '—'}</td>
                        <td className="py-2 px-3">{new Date(u.createdAt).toLocaleString()}</td>
                        <td className="py-2 px-3 text-right">
                          <Button size="sm" variant="outline" disabled>
                            Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td className="py-6 px-3 text-center text-muted-foreground" colSpan={6}>No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminUsers;
