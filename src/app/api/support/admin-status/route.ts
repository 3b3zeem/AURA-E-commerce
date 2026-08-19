import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

const globalForAdminStatus = global as unknown as {
  adminStatuses?: Record<string, { status: string; adminName: string }>;
};

if (!globalForAdminStatus.adminStatuses) globalForAdminStatus.adminStatuses = {};
const memoryAdminStatuses = globalForAdminStatus.adminStatuses;

// GET /api/support/admin-status?email=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "admin@aura.com";

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("admin_status")
        .select("*")
        .eq("admin_email", email)
        .single();

      if (!error && data) {
        return NextResponse.json({ status: data.status, adminName: data.admin_name });
      }
    } catch {}

    const cached = memoryAdminStatuses[email] || { status: "available", adminName: "Admin Agent" };
    return NextResponse.json(cached);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST & PATCH /api/support/admin-status
export async function POST(req: Request) {
  return handleUpdateAdminStatus(req);
}

export async function PATCH(req: Request) {
  return handleUpdateAdminStatus(req);
}

async function handleUpdateAdminStatus(req: Request) {
  try {
    const body = await req.json();
    const { email, adminName, status } = body;

    if (!email || !status) {
      return NextResponse.json({ error: "email and status are required" }, { status: 400 });
    }

    const name = adminName || email.split("@")[0];
    memoryAdminStatuses[email] = { status, adminName: name };

    try {
      const supabase = createClient();
      await supabase.from("admin_status").upsert([
        {
          admin_email: email,
          admin_name: name,
          status,
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch {}

    return NextResponse.json({ success: true, status, adminName: name });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
