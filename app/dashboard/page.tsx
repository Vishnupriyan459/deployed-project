'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, TrendingUp, Plus } from 'lucide-react';
import { User } from '@/lib/auth';
import { Complaint } from '@/lib/complaints';
import { toast } from 'sonner';

interface Stats {
  total: number;
  pending: number;
  forwarded: number;
  resolved: number;
  rejected: number;
  categories: Record<string, number>;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [userComplaints, setUserComplaints] = useState<Complaint[]>([]);

  const user = session?.user as User | undefined;

  const fetchDashboardData = async () => {
    try {
      if (!user) return;

      const params = new URLSearchParams({
        role: user.role,
        userId: user.id,
        department: user.department || '',
      });

      // Fetch complaints
      const res = await fetch(`/api/complaints?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch complaints');
      const complaints: Complaint[] = await res.json();
      setUserComplaints(complaints);

      // Fetch stats
      const statsRes = await fetch(`/api/complaints/stats?${params.toString()}`);
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData: Stats = await statsRes.json();
      setStats(statsData);

    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (user) fetchDashboardData();
  }, [user, status]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || !user || !stats) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-500';
      case 'Forwarded': return 'bg-orange-500';
      case 'Resolved': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-muted-foreground">
            Here`s what`s happening with your complaints today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.pending + stats.forwarded}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.resolved}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => router.push('/complaints/new')} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              File New Complaint
            </Button>
            <Button variant="outline" onClick={() => router.push('/complaints')} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              View All Complaints
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
