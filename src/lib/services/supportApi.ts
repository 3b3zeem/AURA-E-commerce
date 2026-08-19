export interface SupportTicket {
  id: string;
  ticket_code: string;
  user_identity: string;
  user_email: string | null;
  user_name: string | null;
  subject: string;
  status: "open" | "in_progress" | "solved";
  assigned_admin: string | null;
  assigned_admin_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: "user" | "admin";
  sender_name: string;
  message: string;
  created_at: string;
}

export interface AdminStatus {
  email: string;
  status: "available" | "busy" | "offline";
  updated_at: string;
}

// 1. Tickets API
export async function fetchTickets(params?: { status?: string; userIdentity?: string }): Promise<SupportTicket[]> {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== "all") queryParams.append("status", params.status);
  if (params?.userIdentity && params.userIdentity !== "all") queryParams.append("userIdentity", params.userIdentity);

  const res = await fetch(`/api/support/tickets?${queryParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch support tickets");
  const data = await res.json();
  return data.tickets || [];
}

// 2. Messages API
export async function fetchMessages(ticketId: string): Promise<SupportMessage[]> {
  if (!ticketId) return [];
  const res = await fetch(`/api/support/messages?ticketId=${encodeURIComponent(ticketId)}`);
  if (!res.ok) throw new Error("Failed to fetch support messages");
  const data = await res.json();
  return data.messages || [];
}

// 3. Admin Status API
export async function fetchAdminStatus(email: string): Promise<AdminStatus | null> {
  if (!email) return null;
  const res = await fetch(`/api/support/admin-status?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error("Failed to fetch admin status");
  const data = await res.json();
  return data.status ? { email, status: data.status, updated_at: new Date().toISOString() } : null;
}

// 4. Create Ticket Mutation API
export async function createTicket(payload: {
  userIdentity: string;
  userEmail?: string;
  userName?: string;
  subject?: string;
  initialMessage?: string;
}): Promise<SupportTicket> {
  const res = await fetch("/api/support/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create ticket");
  const data = await res.json();
  return data.ticket;
}

// 5. Send Message Mutation API
export async function sendMessage(payload: {
  ticketId: string;
  senderType: "user" | "admin";
  senderName: string;
  message: string;
}): Promise<SupportMessage> {
  const res = await fetch("/api/support/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send message");
  const data = await res.json();
  return data.message;
}

// 6. Update Ticket Status Mutation API
export async function updateTicketStatus(payload: {
  ticketId: string;
  action?: "claim" | "update_status";
  status?: "open" | "in_progress" | "solved";
  newStatus?: "open" | "in_progress" | "solved";
  adminEmail?: string;
  adminName?: string;
  assignedAdmin?: string;
}): Promise<SupportTicket> {
  const bodyPayload = {
    ticketId: payload.ticketId,
    action: payload.action || (payload.action === "claim" ? "claim" : "update_status"),
    newStatus: payload.newStatus || payload.status,
    adminEmail: payload.adminEmail || payload.assignedAdmin,
    adminName: payload.adminName,
  };
  const res = await fetch("/api/support/tickets", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyPayload),
  });
  if (!res.ok) throw new Error("Failed to update ticket status");
  const data = await res.json();
  return data.ticket;
}

// 7. Update Admin Status Mutation API
export async function updateAdminStatus(payload: {
  email: string;
  status: "available" | "busy" | "offline";
}): Promise<AdminStatus> {
  const res = await fetch("/api/support/admin-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update admin status");
  const data = await res.json();
  return { email: payload.email, status: data.status, updated_at: new Date().toISOString() };
}

// 8. Delete Ticket Mutation API
export async function deleteTicket(ticketId: string): Promise<string> {
  const res = await fetch(`/api/support/tickets?ticketId=${encodeURIComponent(ticketId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete ticket");
  const data = await res.json();
  return data.deletedTicketId || ticketId;
}
