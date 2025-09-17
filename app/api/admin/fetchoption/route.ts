// /api/admin/fetch-options
import supabase from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function GET() {
  const { data: roles, error: roleError } = await supabase
    .from("roles")
    .select("id, name");

  const { data: departments, error: deptError } = await supabase
    .from("departments")
    .select("id, name");

  if (roleError || deptError) {
    return NextResponse.json(
      { error: roleError?.message || deptError?.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json({ roles, departments });
}
