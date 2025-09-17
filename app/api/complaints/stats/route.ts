import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const email = searchParams.get('email'); // student email
  const department = searchParams.get('department'); // HOD/Coordinator department

  if (!role) return NextResponse.json({ error: 'Missing role' }, { status: 400 });

  let query = supabaseServer.from('complaints').select('*');

  if (role === 'student' && email) {
    query = query.eq('student_email', email);
  } else if (role === 'hod' && department) {
    query = query.eq('status', 'Pending').eq('department', department);
  } else if (role === 'coordinator' && department) {
    query = query.eq('status', 'Forwarded').eq('department', department);
  }
  // Admin sees all complaints

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data || data.length === 0) {
    return NextResponse.json({
      total: 0,
      pending: 0,
      forwarded: 0,
      resolved: 0,
      rejected: 0,
      categories: {},
    });
  }

  // Compute stats
  const total = data.length;
  const pending = data.filter(c => c.status === 'Pending').length;
  const forwarded = data.filter(c => c.status === 'Forwarded').length;
  const resolved = data.filter(c => c.status === 'Resolved').length;
  const rejected = data.filter(c => c.status === 'Rejected').length;

  const categories = {
    Academic: data.filter(c => c.category === 'Academic').length,
    Facilities: data.filter(c => c.category === 'Facilities').length,
    Staff: data.filter(c => c.category === 'Staff').length,
    Other: data.filter(c => c.category === 'Other').length,
  };

  return NextResponse.json({ total, pending, forwarded, resolved, rejected, categories });
}
