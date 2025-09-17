export type ComplaintStatus = 'Pending' | 'Resolved' | 'Forwarded' | 'Rejected';
export type ComplaintCategory = 'Academic' | 'Facilities' | 'Staff' | 'Other';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: Priority;
  status: ComplaintStatus;
  studentId: string;
  studentName: string;
  studentEmail: string;
  department: string;
  hodId?: string;
  coordinatorId?: string;
  resolution_detail?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export const fetchComplaints = async (): Promise<Complaint[]> => {
  const res = await fetch('/api/complaints');
  if (!res.ok) throw new Error('Failed to fetch complaints');
  return res.json();
};

export const createComplaint = async (complaint: Omit<Complaint, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'hodId' | 'coordinatorId' | 'resolutionDetail'>): Promise<Complaint> => {
  const res = await fetch('/api/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complaint),
  });
  if (!res.ok) throw new Error('Failed to create complaint');
  return res.json();
};

export const updateComplaintStatus = async (
  id: string,
  status: ComplaintStatus,
  resolutionDetail?: string
): Promise<Complaint> => {
  const res = await fetch('/api/complaints', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status, resolutionDetail }),
  });
  if (!res.ok) throw new Error('Failed to update complaint status');
  return res.json();
};

export const deleteComplaint = async (id: string): Promise<{ message: string }> => {
  const res = await fetch(`/api/complaints?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete complaint');
  return res.json();
};
