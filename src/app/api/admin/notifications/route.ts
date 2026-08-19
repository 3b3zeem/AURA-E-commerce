import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

// In-Memory store for fast server fallback
const globalForNotifications = global as unknown as { adminNotificationsCache?: any[] };

if (!globalForNotifications.adminNotificationsCache) {
  globalForNotifications.adminNotificationsCache = [];
}

const memoryNotifications = globalForNotifications.adminNotificationsCache;

// GET /api/admin/notifications
export async function GET() {
  try {
    const supabase = createClient();
    const { data: dbData, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && dbData && dbData.length > 0) {
      return NextResponse.json({ notifications: dbData });
    }

    return NextResponse.json({ notifications: memoryNotifications });
  } catch (err) {
    return NextResponse.json({ notifications: memoryNotifications });
  }
}

// POST /api/admin/notifications
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newNotif = {
      id: "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      type: body.type || "system",
      title: body.title || "New Notification",
      message: body.message || "",
      user_email: body.userEmail || body.user_email || null,
      amount: body.amount || null,
      read: false,
      created_at: new Date().toISOString(),
    };

    memoryNotifications.unshift(newNotif);
    if (memoryNotifications.length > 100) memoryNotifications.length = 100;

    try {
      const supabase = createClient();
      await supabase.from("admin_notifications").insert([newNotif]);
    } catch {}

    return NextResponse.json({ success: true, notification: newNotif });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create notification" }, { status: 500 });
  }
}

// PATCH /api/admin/notifications (Mark as read or Mark all read)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, markAll } = body;

    if (markAll) {
      memoryNotifications.forEach((n) => (n.read = true));
      try {
        const supabase = createClient();
        await supabase.from("admin_notifications").update({ read: true }).eq("read", false);
      } catch {}
    } else if (id) {
      const found = memoryNotifications.find((n) => n.id === id);
      if (found) found.read = true;
      try {
        const supabase = createClient();
        await supabase.from("admin_notifications").update({ read: true }).eq("id", id);
      } catch {}
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update notification" }, { status: 500 });
  }
}

// DELETE /api/admin/notifications (Clear all)
export async function DELETE() {
  try {
    memoryNotifications.length = 0;
    try {
      const supabase = createClient();
      await supabase.from("admin_notifications").delete().neq("id", "");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to clear notifications" }, { status: 500 });
  }
}
