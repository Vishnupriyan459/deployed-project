import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { supabaseServer } from "../auth/[...nextauth]/supabaseServer";

// Default password for reset
const DEFAULT_PASSWORD = "password123";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = supabaseServer;

  // 1️⃣ Fetch the user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, register_no, role, dept")
    .eq("id", session.user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: profileError?.message || "Profile not found" }, { status: 404 });
  }

  // 2️⃣ Fetch role name
  const { data: roleData } = await supabase
    .from("roles")
    .select("name")
    .eq("id", profile.role)
    .single();

  // 3️⃣ Fetch department name
  const { data: deptData } = await supabase
    .from("departments")
    .select("name")
    .eq("id", profile.dept)
    .single();

  // 4️⃣ Fetch student complaints count
  const { data: complaints } = await supabase
    .from("complaints")
    .select("status")
    .eq("student_id", session.user.id);

  const complaintsCount = {
    pending: complaints?.filter(c => c.status === "Pending").length || 0,
    resolved: complaints?.filter(c => c.status === "Resolved").length || 0,
    rejected: complaints?.filter(c => c.status === "Rejected").length || 0,
  };

  // 5️⃣ Return normalized profile
  const normalizedProfile = {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    register_no: profile.register_no,
    role: roleData?.name || "student",
    dept: deptData?.name || "Unknown",
    complaintsCount,
  };

  return NextResponse.json(normalizedProfile);
}
