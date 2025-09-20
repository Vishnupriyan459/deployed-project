import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseServer } from "@/app/api/auth/[...nextauth]/supabaseServer";

// 📌 PUT /api/profile/password → Change password
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = supabaseServer;

  // Try login with current password
  const { data: login, error: loginError } = await supabase.auth.signInWithPassword({
    email: session.user.email!,
    password: currentPassword,
  });

  if (loginError) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Password updated successfully" });
}
