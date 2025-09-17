// app/api/user/update_user/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(req: Request) {
  try {
    const { id, email, ...updates } = await req.json();

    // 1. Get the current profile to check old email
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 2. If email is changed, update Auth as well
    if (email && email !== existingProfile.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, {
        email
      });
      if (authError) throw authError;
    }

    // 3. Update the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ email, ...updates })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Profile updated', data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
