'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { User } from '@/lib/auth';
import { Complaint, ComplaintStatus } from '@/lib/complaints';

export default function ComplaintsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ComplaintStatus>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus | ''>('');
  const [resolutionText, setResolutionText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);

  const user = session?.user as User | undefined;

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      const params = new URLSearchParams({
        role: user.role,
        userId: user.id,
        department: user.department || '',
      });
      const res = await fetch(`/api/complaints?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch complaints');
      const dataFromDB: any[] = await res.json();
      const mappedData: Complaint[] = dataFromDB.map(c => ({
        ...c,
        studentName: c.student_name,
      }));
      setComplaints(mappedData);
      setFilteredComplaints(mappedData);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteComplaint = async () => {
    if (!complaintToDelete || !user) return;

    try {
      const params = new URLSearchParams({
        role: user.role,
        id: complaintToDelete.id,
      });

      const res = await fetch(`/api/complaints?${params.toString()}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete complaint');
      }

      toast.success('Complaint deleted successfully');
      setDeleteDialogOpen(false);
      setComplaintToDelete(null);
      await fetchComplaints();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedComplaint || !user || !newStatus) return;
    if ((newStatus === 'Resolved' || newStatus === 'Rejected') && !resolutionText.trim()) {
      return toast.error('Please provide resolution details');
    }

    try {
      const res = await fetch('/api/complaints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedComplaint.id,
          status: newStatus,
          resolutionDetail: resolutionText,
          role: user.role,
          userId: user.id,
        }),
      });
      if (!res.ok) throw new Error('Failed to update status');

      toast.success('Status updated successfully');
      setSelectedComplaint(null);
      setNewStatus('');
      setResolutionText('');
      await fetchComplaints();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const canUpdateStatus = (complaint: Complaint) => {
    if (!user) return false;
    if (user.role === 'student') return false;
    if (user.role === 'admin') return true;
    if (user.role === 'Hod') return complaint.status === 'Pending';
    if (user.role === 'coordinator') return complaint.status === 'Forwarded';
    return false;
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (user) fetchComplaints();
  }, [user, status]);

  useEffect(() => {
    let filtered = complaints;
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(c => c.status === statusFilter);
    setFilteredComplaints(filtered);
  }, [searchTerm, statusFilter, complaints]);

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session || !user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{user.role === 'student' ? 'My Complaints' : 'Complaints'}</h1>
          {user.role === 'student' && (
            <Button onClick={() => router.push('/complaints/new')}>File New Complaint</Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search complaints by title, description, or student</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={val => setStatusFilter(val as any)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Forwarded">Forwarded</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Complaints ({filteredComplaints.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    {user.role !== 'student' && <TableHead>Student</TableHead>}
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                    {user.role === 'admin' && <TableHead>Delete</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>{c.title}</TableCell>
                      <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                      <TableCell><Badge>{c.priority}</Badge></TableCell>
                      <TableCell><Badge>{c.status}</Badge></TableCell>
                      {user.role !== 'student' && <TableCell>{c.studentName || 'student'}</TableCell>}
                      <TableCell>{format(new Date(c.created_at), 'PPP')}</TableCell>
                      <TableCell>
                        <Dialog open={selectedComplaint?.id === c.id} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(c)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl">
                            <DialogHeader>
                              <DialogTitle>{selectedComplaint?.title}</DialogTitle>
                              <DialogDescription>Complaint details and history</DialogDescription>
                            </DialogHeader>
                            {selectedComplaint && (
                              <div className="space-y-4">
                                <p><strong>Student:</strong> {selectedComplaint.studentName}</p>
                                <p><strong>Category:</strong> {selectedComplaint.category}</p>
                                <p><strong>Priority:</strong> {selectedComplaint.priority}</p>
                                <p>{selectedComplaint.description}</p>

                                {user.role === 'student' && ['Resolved', 'Rejected'].includes(selectedComplaint.status) && (
                                  <p className="mt-2"><strong>Resolution:</strong> {selectedComplaint.resolution_detail || 'No details provided'}</p>
                                )}

                                {canUpdateStatus(selectedComplaint) && (
                                  <div className="flex flex-col gap-2 mt-4">
                                    <label className="font-semibold">Update Status:</label>
                                    <Select
                                      value={newStatus}
                                      onValueChange={(val) => setNewStatus(val as ComplaintStatus)}
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(user.role === 'Hod'
                                          ? ['Forwarded', 'Resolved']
                                          : ['Resolved', 'Rejected']
                                        ).map(statusOption => (
                                          <SelectItem key={statusOption} value={statusOption}>
                                            {statusOption}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    {['Resolved', 'Rejected'].includes(newStatus) && (
                                      <Input
                                        placeholder="Enter resolution details"
                                        value={resolutionText}
                                        onChange={e => setResolutionText(e.target.value)}
                                      />
                                    )}
                                    <Button onClick={handleStatusUpdate}>Submit</Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>

                      {user.role === 'admin' && (
                        <TableCell>
                          <Dialog open={deleteDialogOpen && complaintToDelete?.id === c.id} onOpenChange={(open) => !open && setDeleteDialogOpen(false)}>
                            <DialogTrigger asChild>
                              <Button variant="destructive" size="sm" onClick={() => { setComplaintToDelete(c); setDeleteDialogOpen(true); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Complaint</DialogTitle>
                                <DialogDescription>Are you sure you want to delete this complaint? This action cannot be undone.</DialogDescription>
                              </DialogHeader>
                              <div className="flex gap-2 justify-end mt-4">
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDeleteComplaint}>Delete</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredComplaints.length === 0 && (
                <div className="text-center py-8">
                  <p>No complaints found</p>
                  {user.role === 'student' && (
                    <Button onClick={() => router.push('/complaints/new')}>File Your First Complaint</Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
