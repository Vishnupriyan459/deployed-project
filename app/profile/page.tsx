'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ComplaintsCount {
  pending: number;
  resolved: number;
  rejected: number;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  register_no: string;
  role: string;
  dept: string;
  complaintsCount: ComplaintsCount;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.error) toast.error(data.error);
          else setProfile(data);
        })
        .catch(() => toast.error('Failed to load profile'))
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return toast.error('Fill all fields');

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message || 'Password updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Reset password to default
//   const handleResetPassword = async () => {
//     try {
//       const res = await fetch('/api/profile/reset-password', { method: 'POST' });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error);
//       toast.success(data.message || 'Password reset to default');
//     } catch (err: any) {
//       toast.error(err.message);
//     }
//   };
   const handleResetPassword = async () => {
  if (!profile) return; // <--- Add this
  try {
    const res = await fetch("/api/profile/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: profile.id }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    toast.success(data.message);
  } catch (err: any) {
    toast.error(err.message);
  }
};


  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <DashboardLayout>
      <div className="container max-w-2xl py-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>

        {/* Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {profile.full_name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Department:</strong> {profile.dept}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <p><strong>Register No:</strong> {profile.register_no}</p>
            <p>
              <strong>Complaints:</strong> Pending: {profile.complaintsCount.pending}, Resolved: {profile.complaintsCount.resolved}, Rejected: {profile.complaintsCount.rejected}
            </p>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleChangePassword} disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Reset Password */}
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleResetPassword}>
              Reset to Default (password123)
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
