// app/api/profile/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/app/api/auth/[...nextauth]/supabaseServer";

const DEFAULT_PASSWORD = "password123";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in request body" },
        { status: 400 }
      );
    }

    // Use Supabase service role to update the user's password
    const { error } = await supabaseServer.auth.admin.updateUserById(userId, {
      password: DEFAULT_PASSWORD,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: `Password reset to default (${DEFAULT_PASSWORD})`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
