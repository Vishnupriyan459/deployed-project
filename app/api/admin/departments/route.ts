// /api/admin/departments/route.ts
import supabase from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("departments")
    .select("id, name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ departments: data });
}

export async function POST(request: Request) {
  const { name } = await request.json();

  const { data, error } = await supabase
    .from("departments")
    .insert([{ name }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ department: data });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  const { data, error } = await supabase
    .from("departments")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deletedDepartment: data });
}
