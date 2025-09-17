import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/lib/supabaseServer';

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const roleName = searchParams.get('role');         // Example: 'professor'
//   const departmentName = searchParams.get('department'); // Example: 'Computer Science'

//   if (!roleName || !departmentName) {
//     return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
//   }

//   // Step 1: Get role UUID
//   const { data: roleData, error: roleError } = await supabaseServer
//     .from('roles')
//     .select('id')
//     .eq('name', roleName)
//     .single();

//   if (roleError || !roleData) {
//     return NextResponse.json({ error: 'Role not found' }, { status: 404 });
//   }

//   // Step 2: Get department UUID
//   const { data: deptData, error: deptError } = await supabaseServer
//     .from('departments')
//     .select('id')
//     .eq('name', departmentName)
//     .single();

//   if (deptError || !deptData) {
//     return NextResponse.json({ error: 'Department not found' }, { status: 404 });
//   }

//   // Step 3: Get profiles
//   const { data, error } = await supabaseServer
//     .from('profiles')
//     .select('id, full_name, email, role, dept')
//     .eq('role', roleData.id)
//     .eq('dept', deptData.id);

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   return NextResponse.json(data);
// }
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roleName = searchParams.get('role');         // Example: 'professor'
  const departmentName = searchParams.get('department'); // Example: 'Computer Science'

  if (!roleName || !departmentName) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  // Step 1: Get role UUID
  const { data: roleData, error: roleError } = await supabaseServer
    .from('roles')
    .select('id, name')
    .eq('name', roleName)
    .single();

  if (roleError || !roleData) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  // Step 2: Get department UUID
  const { data: deptData, error: deptError } = await supabaseServer
    .from('departments')
    .select('id, name')
    .eq('name', departmentName)
    .single();

  if (deptError || !deptData) {
    return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  }

  // Step 3: Get profiles
  const { data, error } = await supabaseServer
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      dept
    `)
    .eq('role', roleData.id)
    .eq('dept', deptData.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Step 4: Map profiles to include roleName and departmentName
  const profilesWithNames = data.map(profile => ({
    ...profile,
    roleName: roleData.name,
    deptName: deptData.name,
  }));

  return NextResponse.json(profilesWithNames);
}

export async function PUT(req: NextRequest) {
  const { coordinatorId, hodId } = await req.json();

  if (!coordinatorId || !hodId) {
    return NextResponse.json({ error: 'Missing coordinatorId or hodId' }, { status: 400 });
  }

  // Step 1: Fetch HOD profile to get department UUID
  const { data: hodProfile, error: hodError } = await supabaseServer
    .from('profiles')
    .select('dept')
    .eq('id', hodId)
    .single();

  if (hodError || !hodProfile) {
    return NextResponse.json({ error: 'HOD not found' }, { status: 404 });
  }

  const departmentId = hodProfile.dept;

  // Step 2: Get role UUIDs
  const { data: coordinatorRole, error: coordinatorError } = await supabaseServer
    .from('roles')
    .select('id')
    .eq('name', 'coordinator')
    .single();

  const { data: professorRole, error: professorError } = await supabaseServer
    .from('roles')
    .select('id')
    .eq('name', 'professor')
    .single();

  if (coordinatorError || !coordinatorRole || professorError || !professorRole) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  // Step 3: Reset existing coordinator in department
  const { error: resetError } = await supabaseServer
    .from('profiles')
    .update({ role: professorRole.id })
    .eq('role', coordinatorRole.id)
    .eq('dept', departmentId);

  if (resetError) {
    return NextResponse.json({ error: resetError.message }, { status: 500 });
  }

  // Step 4: Assign new coordinator
  const { error: updateError } = await supabaseServer
    .from('profiles')
    .update({ role: coordinatorRole.id })
    .eq('id', coordinatorId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Coordinator updated successfully' });
}

// export async function PUT(req: NextRequest) {
//   const { coordinatorId, hodId } = await req.json();

//   if (!coordinatorId || !hodId) {
//     return NextResponse.json({ error: 'Missing coordinatorId or hodId' }, { status: 400 });
//   }

//   // Step 1: Fetch HOD profile to get department UUID
//   const { data: hodProfile, error: hodError } = await supabaseServer
//     .from('profiles')
//     .select('dept')
//     .eq('id', hodId)
//     .single();

//   if (hodError || !hodProfile) {
//     return NextResponse.json({ error: 'HOD not found' }, { status: 404 });
//   }

//   const departmentId = hodProfile.dept;

//   // Step 2: Reset any existing coordinator in same department
//   const { error: resetError } = await supabaseServer
//     .from('profiles')
//     .update({ role: null })  // Or set role back to professor UUID
//     .eq('role', /* coordinator role UUID */)
//     .eq('dept', departmentId);

//   if (resetError) {
//     return NextResponse.json({ error: resetError.message }, { status: 500 });
//   }

//   // Step 3: Get coordinator role UUID
//   const { data: coordinatorRole, error: roleError } = await supabaseServer
//     .from('roles')
//     .select('id')
//     .eq('name', 'coordinator')
//     .single();

//   if (roleError || !coordinatorRole) {
//     return NextResponse.json({ error: 'Coordinator role not found' }, { status: 404 });
//   }

//   // Step 4: Set new coordinator
//   const { error: updateError } = await supabaseServer
//     .from('profiles')
//     .update({ role: coordinatorRole.id })
//     .eq('id', coordinatorId);

//   if (updateError) {
//     return NextResponse.json({ error: updateError.message }, { status: 500 });
//   }

//   return NextResponse.json({ message: 'Coordinator updated successfully' });
// }
