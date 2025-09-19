import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminDatabase: React.FC = () => {
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Database className="h-6 w-6" /> Database Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Placeholder page for monitoring database health</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc list-inside text-muted-foreground">
              <li>Connection: Connected (from app perspective)</li>
              <li>Provider: SQLite (local dev)</li>
              <li>Next steps: add backups, migrations view, and integrity checks</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDatabase;
