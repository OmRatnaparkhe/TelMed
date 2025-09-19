import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminSettings: React.FC = () => {
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
          <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" /> System Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Placeholder page for future settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This section will include configuration options for roles, thresholds, notifications, and platform parameters.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminSettings;
