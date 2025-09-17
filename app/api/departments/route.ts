import { NextResponse } from 'next/server';
import supabase from '@/lib/supabaseServer';

// GET all departments
export async function GET() {
  const { data, error } = await supabase.from('departments').select('*').order('departments');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// CREATE department
export async function POST(req: Request) {
  const { departments } = await req.json();
  if (!departments) {
    return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('departments').insert([{ departments }]).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// UPDATE department
export async function PUT(req: Request) {
  const { id, departments } = await req.json();
  if (!id || !departments) {
    return NextResponse.json({ error: 'ID and department name are required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('departments').update({ departments }).eq('id', id).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE department
export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { error } = await supabase.from('departments').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: 'Department deleted successfully' });
}
