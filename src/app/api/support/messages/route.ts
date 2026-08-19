import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

// Global in-memory support messages store
const globalForMessages = global as unknown as { supportMessages?: Record<string, any[]> };

if (!globalForMessages.supportMessages) globalForMessages.supportMessages = {};
const memoryMessages = globalForMessages.supportMessages;

// GET /api/support/messages?ticketId=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        return NextResponse.json({ messages: data });
      }
    } catch {}

    const messages = memoryMessages[ticketId] || [];
    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/support/messages
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, senderType, senderName, message } = body;

    if (!ticketId || !message) {
      return NextResponse.json({ error: "ticketId and message are required" }, { status: 400 });
    }

    const newMsg = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      ticket_id: ticketId,
      sender_type: senderType || "user",
      sender_name: senderName || "User",
      message,
      created_at: new Date().toISOString(),
    };

    if (!memoryMessages[ticketId]) memoryMessages[ticketId] = [];
    memoryMessages[ticketId].push(newMsg);

    try {
      const supabase = createClient();
      await supabase.from("support_messages").insert([newMsg]);
      await supabase
        .from("support_tickets")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", ticketId);
    } catch {}

    return NextResponse.json({ success: true, message: newMsg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
