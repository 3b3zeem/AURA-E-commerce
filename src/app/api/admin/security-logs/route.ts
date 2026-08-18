import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import { verifyAdmin } from "@/lib/auth/adminGuard";

export async function GET(request: Request) {
  const guard = await verifyAdmin(request);
  if (!guard.isAdmin && guard.response) return guard.response;

  try {
    const supabase = createClient();
    const { data: logs, error } = await supabase
      .from("security_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Supabase GET security_logs error:", error);
      return NextResponse.json([]);
    }

    return NextResponse.json(logs || []);
  } catch (err: any) {
    return NextResponse.json([]);
  }
}
