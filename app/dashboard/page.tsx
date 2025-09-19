'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import DashboardLayout from '@/components/layout/dashboard-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Plus,
} from 'lucide-react';
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

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as User | undefined;

  const params = user
    ? new URLSearchParams({
        role: user.role,
        userId: user.id,
        department: user.department || '',
      }).toString()
    : '';

  // Fetch complaints and stats with SWR
  const {
    data: complaints,
    error: complaintsError,
    isLoading: complaintsLoading,
  } = useSWR<Complaint[]>(user ? `/api/complaints?${params}` : null, fetcher);

  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
  } = useSWR<Stats>(user ? `/api/complaints/stats?${params}` : null, fetcher);

  // Redirect unauthenticated users
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (status === 'loading' || statsLoading || complaintsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (complaintsError || statsError) {
    toast.error('Failed to load dashboard data');
    return null;
  }

  if (!session || !user || !stats) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500';
      case 'Forwarded':
        return 'bg-orange-500';
      case 'Resolved':
        return 'bg-green-500';
      case 'Rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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
            Here&apos;s what&apos;s happening with your complaints today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Complaints
              </CardTitle>
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
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.total > 0
                  ? Math.round((stats.resolved / stats.total) * 100)
                  : 0}
                %
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
            <Button
              onClick={() => router.push('/complaints/new')}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              File New Complaint
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/complaints')}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              View All Complaints
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
