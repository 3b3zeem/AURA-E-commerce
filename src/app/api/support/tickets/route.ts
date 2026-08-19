import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

// Global in-memory support tickets store as fallback
const globalForSupport = global as unknown as {
  supportTickets?: any[];
  adminStatuses?: Record<string, { status: string; adminName: string }>;
};

if (!globalForSupport.supportTickets) globalForSupport.supportTickets = [];
if (!globalForSupport.adminStatuses) globalForSupport.adminStatuses = {};

const memoryTickets = globalForSupport.supportTickets;
const memoryAdminStatuses = globalForSupport.adminStatuses;

// GET /api/support/tickets
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdentity = searchParams.get("userIdentity");
    const status = searchParams.get("status");

    try {
      const supabase = createClient();
      let query = supabase.from("support_tickets").select("*").order("updated_at", { ascending: false });

      if (userIdentity) query = query.eq("user_identity", userIdentity);
      if (status && status !== "all") query = query.eq("status", status);

      const { data, error } = await query;
      if (!error && data) {
        return NextResponse.json({ tickets: data });
      }
    } catch {}

    let filtered = [...memoryTickets];
    if (userIdentity) filtered = filtered.filter((t) => t.user_identity === userIdentity);
    if (status && status !== "all") filtered = filtered.filter((t) => t.status === status);

    return NextResponse.json({ tickets: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/support/tickets (Create Ticket)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userIdentity, userEmail, subject, initialMessage } = body;

    if (!userIdentity || !subject) {
      return NextResponse.json({ error: "Missing required ticket details" }, { status: 400 });
    }

    const ticketCode = "TICK-" + Math.floor(1000 + Math.random() * 9000);
    const newTicket = {
      id: "tick_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      ticket_code: ticketCode,
      user_identity: userIdentity,
      user_email: userEmail || userIdentity,
      subject: subject || "Customer Support Inquiry",
      status: "open",
      assigned_admin_email: null,
      assigned_admin_name: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    memoryTickets.unshift(newTicket);

    // Also store initial message
    const initialMsgObj = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      ticket_id: newTicket.id,
      sender_type: "user",
      sender_name: userEmail || userIdentity,
      message: initialMessage || subject,
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      await supabase.from("support_tickets").insert([newTicket]);
      await supabase.from("support_messages").insert([initialMsgObj]);
    } catch {}

    // Broadcast Admin Notification
    try {
      const notifUrl = new URL("/api/admin/notifications", req.url).toString();
      await fetch(notifUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "system",
          title: "New Support Ticket Created",
          message: `${userIdentity} submitted ticket ${ticketCode}: "${subject}"`,
          userEmail: userEmail || userIdentity,
        }),
      });
    } catch {}

    return NextResponse.json({ success: true, ticket: newTicket, message: initialMsgObj });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/support/tickets (Claim or Update Status)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, action, adminEmail, adminName, newStatus } = body;

    const ticket = memoryTickets.find((t) => t.id === ticketId);

    if (action === "claim") {
      if (!adminEmail) {
        return NextResponse.json({ error: "Admin email required to claim ticket" }, { status: 400 });
      }

      if (ticket) {
        ticket.assigned_admin_email = adminEmail;
        ticket.assigned_admin_name = adminName || adminEmail.split("@")[0];
        ticket.status = "in_progress";
        ticket.updated_at = new Date().toISOString();
      }

      // Update admin status to busy
      memoryAdminStatuses[adminEmail] = { status: "busy", adminName: adminName || adminEmail.split("@")[0] };

      try {
        const supabase = createClient();
        await supabase
          .from("support_tickets")
          .update({
            assigned_admin_email: adminEmail,
            assigned_admin_name: adminName || adminEmail.split("@")[0],
            status: "in_progress",
            updated_at: new Date().toISOString(),
          })
          .eq("id", ticketId);

        await supabase
          .from("admin_status")
          .upsert([{ admin_email: adminEmail, admin_name: adminName || adminEmail.split("@")[0], status: "busy", updated_at: new Date().toISOString() }]);
      } catch {}

      return NextResponse.json({ success: true, ticket });
    }

    if (action === "update_status") {
      if (ticket) {
        ticket.status = newStatus;
        ticket.updated_at = new Date().toISOString();
      }

      try {
        const supabase = createClient();
        await supabase
          .from("support_tickets")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", ticketId);
      } catch {}

      // AUTO-UPDATE ADMIN STATUS: BUSY IF IN_PROGRESS, AVAILABLE IF SOLVED/CLOSED
      if (adminEmail) {
        const nextStatus = newStatus === "in_progress" ? "busy" : (newStatus === "solved" || newStatus === "closed") ? "available" : null;
        if (nextStatus) {
          memoryAdminStatuses[adminEmail] = { status: nextStatus, adminName: adminName || adminEmail.split("@")[0] };
          try {
            const supabase = createClient();
            await supabase
              .from("admin_status")
              .upsert([{ admin_email: adminEmail, admin_name: adminName || adminEmail.split("@")[0], status: nextStatus, updated_at: new Date().toISOString() }]);
          } catch {}
        }
      }

      return NextResponse.json({ success: true, ticket });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/support/tickets?ticketId=...
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    // Delete from memory
    const idx = memoryTickets.findIndex((t) => t.id === ticketId);
    if (idx !== -1) memoryTickets.splice(idx, 1);

    try {
      const supabase = createClient();
      await supabase.from("support_messages").delete().eq("ticket_id", ticketId);
      await supabase.from("support_tickets").delete().eq("id", ticketId);
    } catch {}

    return NextResponse.json({ success: true, deletedTicketId: ticketId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
