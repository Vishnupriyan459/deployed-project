'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  roleName: string;
  deptName: string;
}

export default function TeamManagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<string>('');
  const user = session?.user as { role: string; department: string; id: string };

  const fetchProfiles = async () => {
    if (!user || user.role !== 'Hod') return;

    try {
      const res = await fetch(`/api/Team_manage?role=professor&department=${user.department}`);
      if (!res.ok) throw new Error('Failed to fetch professors');
      const data: Profile[] = await res.json();
      setProfiles(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCoordinatorUpdate = async () => {
    if (!selectedCoordinatorId) return toast.error('Please select a professor');

    try {
      const res = await fetch('/api/team_manage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinatorId: selectedCoordinatorId,
          hodId: user.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update coordinator');
      }

      toast.success('Coordinator updated successfully');
      setSelectedCoordinatorId('');
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (user?.role === 'Hod') fetchProfiles();
  }, [user, status]);

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session || user.role !== 'Hod') return <div className="text-center mt-10">Access Denied</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Team Management</h1>

        <Card>
          <CardHeader>
            <CardTitle>Professors in Department: {user.department}</CardTitle>
            <CardDescription>Select a professor to become the coordinator</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assign Coordinator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map(profile => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.full_name}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{profile.roleName}</TableCell>
                    <TableCell>
                      <Select value={selectedCoordinatorId} onValueChange={setSelectedCoordinatorId}>
                        <SelectTrigger className="w-60">
                          <SelectValue placeholder="Select Coordinator" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map(prof => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.full_name} ({prof.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4">
              <Button onClick={handleCoordinatorUpdate}>Set as Coordinator</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
