// /api/admin/roles/route.ts
import supabase from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ roles: data });
}

export async function POST(request: Request) {
  const { name } = await request.json();

  const { data, error } = await supabase
    .from("roles")
    .insert([{ name }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ role: data });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  const { data, error } = await supabase
    .from("roles")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deletedRole: data });
}
