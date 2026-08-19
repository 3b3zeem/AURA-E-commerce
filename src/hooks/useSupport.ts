"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTickets,
  fetchMessages,
  fetchAdminStatus,
  createTicket,
  sendMessage,
  updateTicketStatus,
  updateAdminStatus,
  deleteTicket,
  SupportTicket,
  SupportMessage,
} from "@/lib/services/supportApi";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const EMPTY_TICKETS: SupportTicket[] = [];
const EMPTY_MESSAGES: SupportMessage[] = [];

export function useSupportTickets(
  params?: { status?: string; userIdentity?: string },
  options?: { enabled?: boolean }
) {
  const queryClient = useQueryClient();
  const status = params?.status || "all";
  const userIdentity = params?.userIdentity && params.userIdentity !== "all" ? params.userIdentity : undefined;
  const isEnabled = options?.enabled !== undefined ? options.enabled : true;

  useEffect(() => {
    if (!isEnabled) return;
    const supabase = createClient();
    const channelId = `tickets_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => {
        queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, isEnabled]);

  const query = useQuery<SupportTicket[]>({
    queryKey: ["support_tickets", status, userIdentity || "all"],
    queryFn: () => fetchTickets({ status, userIdentity }),
    enabled: isEnabled,
    staleTime: 1000 * 2, // 2s stale time for instant updates
    refetchInterval: isEnabled ? 3000 : false,
    refetchOnWindowFocus: isEnabled,
  });

  return {
    ...query,
    data: query.data || EMPTY_TICKETS,
  };
}

export function useSupportMessages(ticketId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!ticketId) return;
    const supabase = createClient();
    const channelId = `messages_rt_${ticketId.slice(-6)}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on("postgres_changes", { event: "*", schema: "public", table: "support_messages" }, () => {
        queryClient.invalidateQueries({ queryKey: ["support_messages", ticketId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId, queryClient]);

  const query = useQuery<SupportMessage[]>({
    queryKey: ["support_messages", ticketId],
    queryFn: () => fetchMessages(ticketId),
    enabled: Boolean(ticketId),
    staleTime: 1000 * 2,
    refetchInterval: 3000, // 3s auto-refresh for live chat
    refetchOnWindowFocus: true,
  });

  return {
    ...query,
    data: query.data || EMPTY_MESSAGES,
  };
}

export function useAdminStatus(email: string) {
  return useQuery({
    queryKey: ["admin_status", email],
    queryFn: () => fetchAdminStatus(email),
    enabled: Boolean(email),
    staleTime: 1000 * 2,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
    },
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (newMsg) => {
      queryClient.invalidateQueries({ queryKey: ["support_messages", newMsg.ticket_id] });
      queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
    },
  });
}

export function useUpdateTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTicketStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin_status"] });
    },
  });
}

export function useUpdateAdminStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_status"] });
    },
  });
}

export function useDeleteTicketMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
    },
  });
}
