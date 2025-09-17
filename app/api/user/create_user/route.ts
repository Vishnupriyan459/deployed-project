// app/api/create-user/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, full_name, role, dept, register_no } = body;

    // Step 1: Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError || !authUser?.user?.id) {
      return NextResponse.json({ error: 'Failed to create auth user', details: authError }, { status: 500 });
    }

    const userId = authUser.user.id;

    // Step 2: Insert profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name,
      role,
      dept,
      register_no
    });

    if (profileError) {
      return NextResponse.json({ error: 'Failed to insert profile', details: profileError }, { status: 500 });
    }

    return NextResponse.json({ message: 'User created successfully' });

  } catch (e: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: e.message }, { status: 500 });
  }
}
