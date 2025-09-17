import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import supabase from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import { log } from 'node:console';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  // Uncomment if auth is required
  // if (!session) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      register_no,
      role,
      dept,
      roles (id, name),
      departments (id, name)
    `);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch profiles', details: error }, { status: 500 });
  }

  const profiles = data.map((profile: any) => ({
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    register_no: profile.register_no,
    role_id: profile.role,               // UUID of role
    department_id: profile.dept,   // UUID of department
    role: profile.roles?.name || null,  // Name of role
    department: profile.departments?.name || null,  // Name of department
  }));

  log('Fetched profiles:', profiles);

  return NextResponse.json({ profiles }, { status: 200 });
}
