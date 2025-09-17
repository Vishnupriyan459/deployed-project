import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseServer';

// GET all roles
export async function GET() {
  const { data, error } = await supabase.from('roles').select('*').order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// CREATE new role
export async function POST(req: Request) {
  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('roles').insert([{ name }]).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// UPDATE role
export async function PUT(req: Request) {
  const { id, name } = await req.json();
  if (!id || !name) {
    return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('roles').update({ name }).eq('id', id).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE role
export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('roles').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: 'Role deleted successfully' });
}
