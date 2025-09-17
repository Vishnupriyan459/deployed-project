import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

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
  studentName: string;
  studentEmail: string;
  department: string;
  resolutionDetail?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

// GET - Fetch complaints based on role
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const email = searchParams.get('email'); // for student
  const department = searchParams.get('department'); // for HOD/Coordinator

  if (!role) return NextResponse.json({ error: 'Missing role' }, { status: 400 });

  let query = supabaseServer.from('complaints').select('*');

  if (role === 'student' && email) query = query.eq('student_email', email);
  else if (role === 'hod' && department) query = query.eq('status', 'Pending').eq('department', department);
  else if (role === 'coordinator' && department) query = query.eq('status', 'Forwarded').eq('department', department);
  // Admin sees all complaints

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

// POST - Create complaint (student only)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId,role, name, email, department, title, description, category, priority } = body;

  if (role !== 'student') return NextResponse.json({ error: 'Only students can create complaints' }, { status: 403 });

  const { data, error } = await supabaseServer
    .from('complaints')
    .insert({
      title,
      description,
      category,
      priority,
      status: 'Pending',
      student_name: name,
      student_email: email,
      student_id: userId,
      department,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PUT - Update complaint status
// export async function PUT(req: NextRequest) {
//   const body = await req.json();
//   const { role, id, status, resolutionDetail } = body;

//   let allowed = false;
//   if (role === 'hod' && ['Resolved', 'Forwarded'].includes(status)) allowed = true;
//   if (role === 'coordinator' && ['Resolved', 'Rejected'].includes(status)) allowed = true;
//   if (role === 'admin') allowed = true;

//   if (!allowed) return NextResponse.json({ error: 'Not allowed to update this status' }, { status: 403 });

//   const updates: any = { status, updated_at: new Date().toISOString() };
//   if (status === 'Resolved' || status === 'Rejected') {
//     updates.resolution_detail = resolutionDetail || null;
//     updates.resolved_at = new Date().toISOString();
//   }

//   const { data, error } = await supabaseServer
//     .from('complaints')
//     .update(updates)
//     .eq('id', id)
//     .select()
//     .single();

//   if (error) return NextResponse.json({ error: error.message }, { status: 500 });
//   return NextResponse.json(data);
// }
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { role, id, status, resolutionDetail } = body;

  // Check if user is allowed to update this status
  let allowed = false;
  if (role === 'Hod' && ['Resolved', 'Forwarded'].includes(status)) allowed = true;
  if (role === 'coordinator' && ['Resolved', 'Rejected'].includes(status)) allowed = true;
  if (role === 'admin') allowed = true;

  if (!allowed) {
    return NextResponse.json(
      { error: 'Not allowed to update this status' },
      { status: 403 }
    );
  }

  const updates: Partial<{ status: ComplaintStatus; resolution_detail: string | null; resolved_at: string; updated_at: string }> = {
    status,
    updated_at: new Date().toISOString(),
  };

  // Only set resolution details for Resolved or Rejected
  if (status === 'Resolved' || status === 'Rejected') {
    updates.resolution_detail = resolutionDetail || null;
    // updates.resolved_at = new Date();
  }

  const { data, error } = await supabaseServer
    .from('complaints')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}


// DELETE - Delete complaint (admin only)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const id = searchParams.get('id');

  if (role !== 'admin')
    return NextResponse.json({ error: 'Only admin can delete complaints' }, { status: 403 });

  if (!id)
    return NextResponse.json({ error: 'Missing complaint ID' }, { status: 400 });

  const { error } = await supabaseServer.from('complaints').delete().eq('id', id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ message: 'Complaint deleted successfully' });
};